import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { router, nav } from '../support/next.jsx'
import { mockFetch, sentBody } from '../support/fetch.js'
import { renderWithAuth, signIn } from '../support/render.jsx'
import { useAuth, AuthProvider } from '@/app/context/AuthContext'
import LoginPage from '@/app/login/page'
import SignupPage from '@/app/signup/page'
import ForgotPasswordPage from '@/app/forgot-password/page'
import ResetPasswordPage from '@/app/reset-password/page'
import ProfilePage from '@/app/profile/page'

const type = (placeholder, value) => fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } })
const asha = { id: 'user-1', name: 'Asha Patil', email: 'asha@example.com', created_at: '2025-03-04T00:00:00Z' }

describe('AuthProvider', () => {
  let auth
  const Probe = () => {
    auth = useAuth()
    return <p>{auth.loading ? 'loading' : auth.user ? `signed in as ${auth.user.name}` : 'signed out'}</p>
  }

  test('restores the signed-in user from localStorage', async () => {
    signIn(asha)
    renderWithAuth(<Probe />)
    expect(await screen.findByText('signed in as Asha Patil')).toBeInTheDocument()
    expect(auth.isAuthenticated).toBe(true)
  })

  test('a corrupt stored user is dropped (logged out, back to home)', async () => {
    localStorage.setItem('token', 't')
    localStorage.setItem('user', '{not json')
    renderWithAuth(<Probe />)
    expect(await screen.findByText('signed out')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(router.push).toHaveBeenCalledWith('/')
  })

  test('login stores the token and user; failures come back as messages', async () => {
    mockFetch({ 'POST /api/auth/login': { status: 200, body: { token: 'tok-9', user: asha } } })
    renderWithAuth(<Probe />)
    await screen.findByText('signed out')
    let result
    await act(async () => {
      result = await auth.login('asha@example.com', 'secret1')
    })
    expect(result.success).toBe(true)
    expect(localStorage.getItem('token')).toBe('tok-9')
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(asha)
    expect(screen.getByText('signed in as Asha Patil')).toBeInTheDocument()

    mockFetch({ 'POST /api/auth/login': { status: 401, body: { error: 'Invalid email or password' } } })
    await act(async () => {
      result = await auth.login('a', 'b')
    })
    expect(result).toEqual({ success: false, error: 'Invalid email or password' })
    mockFetch({ 'POST /api/auth/login': { status: 500, body: {} } })
    await act(async () => {
      result = await auth.login('a', 'b')
    })
    expect(result.error).toBe('Login failed')
  })

  test('register reports success or the API error', async () => {
    renderWithAuth(<Probe />)
    await screen.findByText('signed out')
    const fetchMock = mockFetch({ 'POST /api/auth/signup': { status: 200, body: { user: asha } } })
    expect(await auth.register('Asha', 'asha@example.com', 'secret1')).toEqual({ success: true, data: { user: asha } })
    expect(sentBody(fetchMock, '/api/auth/signup')).toEqual({ name: 'Asha', email: 'asha@example.com', password: 'secret1' })
    mockFetch({ 'POST /api/auth/signup': { status: 400, body: { error: 'User with this email already exists' } } })
    expect(await auth.register('A', 'a', 'b')).toEqual({ success: false, error: 'User with this email already exists' })
    mockFetch({ 'POST /api/auth/signup': { status: 500, body: {} } })
    expect((await auth.register('A', 'a', 'b')).error).toBe('Registration failed')
  })

  test('getUserProfile refreshes the user; an expired token logs out', async () => {
    signIn(asha)
    renderWithAuth(<Probe />)
    await screen.findByText('signed in as Asha Patil')
    const fetchMock = mockFetch({ 'GET /api/auth/me': { status: 200, body: { user: { ...asha, name: 'Asha P.' } } } })
    await act(async () => {
      await auth.getUserProfile()
    })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok-1')
    expect(screen.getByText('signed in as Asha P.')).toBeInTheDocument()

    mockFetch({ 'GET /api/auth/me': { status: 401, body: { error: 'Invalid or expired token' } } })
    let result
    await act(async () => {
      result = await auth.getUserProfile()
    })
    expect(result).toEqual({ success: false, error: 'Invalid or expired token' })
    expect(screen.getByText('signed out')).toBeInTheDocument()
  })

  test('getUserProfile without a token logs out; other errors keep the session', async () => {
    renderWithAuth(<Probe />)
    await screen.findByText('signed out')
    expect(await auth.getUserProfile()).toEqual({ success: false, error: 'Not authenticated' })
    signIn(asha)
    mockFetch({ 'GET /api/auth/me': { status: 500, body: {} } })
    expect((await auth.getUserProfile()).error).toBe('Failed to fetch user profile')
    expect(localStorage.getItem('token')).toBe('tok-1')
  })
})

describe('LoginPage', () => {
  test('asks for both fields', () => {
    renderWithAuth(<LoginPage />)
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
  })

  test('signs in and goes home', async () => {
    const fetchMock = mockFetch({ 'POST /api/auth/login': { status: 200, body: { token: 't', user: asha } } })
    renderWithAuth(<LoginPage />)
    type('Email address', 'asha@example.com')
    type('Password', 'secret1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/'))
    expect(sentBody(fetchMock, '/api/auth/login')).toEqual({ email: 'asha@example.com', password: 'secret1' })
  })

  test('shows the API error, and links to sign-up and password reset', async () => {
    mockFetch({ 'POST /api/auth/login': { status: 401, body: { error: 'Invalid email or password' } } })
    renderWithAuth(<LoginPage />)
    type('Email address', 'asha@example.com')
    type('Password', 'nope')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute('href', '/forgot-password')
  })

  test('an unexpected failure shows a generic message', async () => {
    const Broken = () => {
      const auth = useAuth()
      auth.login = async () => {
        throw new Error('boom')
      }
      return <LoginPage />
    }
    renderWithAuth(<Broken />)
    type('Email address', 'a@x.com')
    type('Password', 'p')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
  })
})

describe('SignupPage', () => {
  const fill = ({ name = 'Asha', email = 'asha@example.com', password = 'secret1', confirm = password } = {}) => {
    type('Full name', name)
    type('Email address', email)
    type('Password', password)
    type('Confirm password', confirm)
  }
  const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
  // Submits even with an empty required field (a browser would stop at the native check).
  const forceSubmit = () => fireEvent.submit(screen.getByRole('button', { name: 'Sign up' }).closest('form'))

  test.each([
    [{ name: '' }, 'Please fill in all fields'],
    [{ confirm: 'other1' }, 'Passwords do not match'],
    [{ password: '123', confirm: '123' }, 'Password must be at least 6 characters long'],
  ])('checks the form: %j', (values, message) => {
    renderWithAuth(<SignupPage />)
    fill(values)
    forceSubmit()
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  test('registers, logs in and goes home', async () => {
    mockFetch({ 'POST /api/auth/signup': { status: 200, body: { user: asha } }, 'POST /api/auth/login': { status: 200, body: { token: 't', user: asha } } })
    renderWithAuth(<SignupPage />)
    fill()
    submit()
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/'))
  })

  test('if the automatic login fails, sends the user to log in', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockFetch({ 'POST /api/auth/signup': { status: 200, body: {} }, 'POST /api/auth/login': { status: 401, body: { error: 'x' } } })
    renderWithAuth(<SignupPage />)
    fill()
    submit()
    expect(await screen.findByText('Registration successful! Please log in.')).toBeInTheDocument()
    await act(async () => vi.advanceTimersByTime(2000))
    expect(router.push).toHaveBeenCalledWith('/login')
    vi.useRealTimers()
  })

  test('shows the API error, or a generic one if something throws', async () => {
    mockFetch({ 'POST /api/auth/signup': { status: 400, body: { error: 'User with this email already exists' } } })
    renderWithAuth(<SignupPage />)
    fill()
    submit()
    expect(await screen.findByText('User with this email already exists')).toBeInTheDocument()

    const Broken = () => {
      const auth = useAuth()
      auth.register = async () => {
        throw new Error('boom')
      }
      return <SignupPage />
    }
    render(
      <AuthProvider>
        <Broken />
      </AuthProvider>
    )
    const forms = screen.getAllByRole('button', { name: 'Sign up' })
    const last = forms[forms.length - 1].closest('form')
    for (const [ph, v] of [['Full name', 'A'], ['Email address', 'a@x.com'], ['Password', 'secret1'], ['Confirm password', 'secret1']]) {
      fireEvent.change(last.querySelector(`[placeholder="${ph}"]`), { target: { value: v } })
    }
    fireEvent.submit(last)
    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
  })
})

describe('ForgotPasswordPage', () => {
  test('requires an email', () => {
    render(<ForgotPasswordPage />)
    fireEvent.submit(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(screen.getByText('Please enter your email address')).toBeInTheDocument()
  })

  test('shows the confirmation and clears the field', async () => {
    mockFetch({ 'POST /api/auth/forgot-password': { status: 200, body: { message: 'Check your inbox' } } })
    render(<ForgotPasswordPage />)
    type('Email address', 'asha@example.com')
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByText('Check your inbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toHaveValue('')
  })

  test('falls back to default texts, and shows errors', async () => {
    mockFetch({ 'POST /api/auth/forgot-password': { status: 200, body: {} } })
    render(<ForgotPasswordPage />)
    type('Email address', 'a@x.com')
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByText(/If your email is registered/)).toBeInTheDocument()

    mockFetch({ 'POST /api/auth/forgot-password': { status: 500, body: {} } })
    type('Email address', 'a@x.com')
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()

    mockFetch({ 'POST /api/auth/forgot-password': new Error('') })
    type('Email address', 'a@x.com')
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    expect(await screen.findByText('An error occurred. Please try again.')).toBeInTheDocument()
  })
})

describe('ResetPasswordPage', () => {
  const fill = (password, confirm = password) => {
    type('New password', password)
    type('Confirm new password', confirm)
  }

  test('without a token: explains, and the button stays disabled', async () => {
    render(<ResetPasswordPage />)
    expect(await screen.findByText(/Invalid or missing reset token/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeDisabled()
  })

  test.each([
    ['', '', 'Please fill in all fields'],
    ['secret1', 'secret2', 'Passwords do not match'],
    ['123', '123', 'Password must be at least 6 characters long'],
  ])('checks "%s"/"%s"', async (p, c, message) => {
    nav.search = new URLSearchParams('token=abc')
    render(<ResetPasswordPage />)
    await screen.findByText('Reset Password', { selector: 'h2' })
    fill(p, c)
    fireEvent.submit(screen.getByRole('button', { name: 'Reset Password' }))
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  test('sends the token with the new password and confirms', async () => {
    nav.search = new URLSearchParams('token=abc')
    const fetchMock = mockFetch({ 'POST /api/auth/reset-password': { status: 200, body: {} } })
    render(<ResetPasswordPage />)
    fill('secret1')
    fireEvent.click(await screen.findByRole('button', { name: 'Reset Password' }))
    expect(await screen.findByText('Password Reset Complete')).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/auth/reset-password')).toEqual({ token: 'abc', password: 'secret1' })
    expect(screen.getByRole('link', { name: 'Go to Login' })).toHaveAttribute('href', '/login')
  })

  test('shows the API error or a generic one', async () => {
    nav.search = new URLSearchParams('token=abc')
    mockFetch({ 'POST /api/auth/reset-password': { status: 400, body: { error: 'Invalid or expired token' } } })
    render(<ResetPasswordPage />)
    fill('secret1')
    fireEvent.click(await screen.findByRole('button', { name: 'Reset Password' }))
    expect(await screen.findByText('Invalid or expired token')).toBeInTheDocument()
    mockFetch({ 'POST /api/auth/reset-password': { status: 500, body: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
    mockFetch({ 'POST /api/auth/reset-password': new Error('') })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    expect(await screen.findByText('An error occurred. Please try again.')).toBeInTheDocument()
  })
})

describe('ProfilePage', () => {
  test('sends visitors who are not signed in to login', async () => {
    renderWithAuth(<ProfilePage />)
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
  })

  test('loads and shows my profile', async () => {
    signIn(asha)
    mockFetch({ 'GET /api/auth/me': { status: 200, body: { user: asha } } })
    renderWithAuth(<ProfilePage />)
    expect(await screen.findByRole('heading', { name: 'Asha Patil' })).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('asha@example.com')).toBeInTheDocument()
    expect(screen.getByText('March 4, 2025')).toBeInTheDocument()
    expect(screen.getByText("You haven't created any trips yet.")).toBeInTheDocument()
  })

  test('placeholders when details are missing, even if the refresh throws', async () => {
    signIn({ id: 'u' })
    mockFetch({ 'GET /api/auth/me': new Error('offline') })
    renderWithAuth(<ProfilePage />)
    expect(await screen.findByRole('heading', { name: 'User' })).toBeInTheDocument()
    expect(screen.getByText('No email provided')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })
})
