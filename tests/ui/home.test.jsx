import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import { router, nav } from '../support/next.jsx'
import { mockFetch } from '../support/fetch.js'
import { renderWithAuth, signIn } from '../support/render.jsx'
import { knownBug } from '../support/known-bug.js'
import RootLayout, { metadata } from '@/app/layout'
import Home from '@/app/page'
import NavbarWrapper from '@/app/components/NavbarWrapper'
import FooterWrapper from '@/app/components/FooterWrapper'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import HeroSection from '@/app/components/HeroSection'
import SearchBar from '@/app/components/SearchBar'
import BlogSection from '@/app/components/BlogSection'
import TestimonialsSection from '@/app/components/TestimonialsSection'
import ErrorMessage from '@/app/components/ErrorMessage'
import Modal from '@/app/components/Modal'
import StatsCard from '@/app/components/StatsCard'

const blogs = Array.from({ length: 5 }, (_, i) => ({ id: `b${i}`, title: `Story ${i}`, category: 'Asia', cover_image: `/c${i}.jpg`, date: '2025-02-01T00:00:00Z' }))

describe('layout and home page', () => {
  test('the root layout wraps the page in the navbar, footer and auth provider', () => {
    mockFetch({ '/api/blogs': { blogs: [] } })
    expect(metadata.title).toBe('TripSage - Your Personal Travel Assistant')
    // RootLayout renders <html>; render its body content into a container.
    const tree = RootLayout({ children: <p>page content</p> })
    const body = tree.props.children
    expect(tree.props.lang).toBe('en')
    expect(body.props.className).toContain('font-inter')
    render(body.props.children)
    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(screen.getByText('©2025 TripSage, All Rights Reserved')).toBeInTheDocument()
  })

  test('the home page has the hero, destinations, budget promo, blogs and testimonials', async () => {
    mockFetch({ '/api/blogs': { blogs } })
    renderWithAuth(<Home />)
    expect(screen.getByText("Explore the World's", { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Indian Tourism' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Taj Mahal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Planning Your Budget' })).toHaveAttribute('href', '/budget-tracker')
    expect(await screen.findByText('Story 0')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What Our Travelers Say' })).toBeInTheDocument()
  })

  // FINDING: app/page.js renders <Navbar /> itself, and the root layout already adds one
  // through NavbarWrapper, so the home page shows two navigation bars.
  knownBug('the home page has one navigation bar', () => {
    mockFetch({ '/api/blogs': { blogs: [] } })
    renderWithAuth(
      <>
        <NavbarWrapper />
        <Home />
      </>
    )
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
  })

  test('the navbar and footer are hidden on the chat guide', () => {
    nav.pathname = '/chat-guide'
    renderWithAuth(
      <>
        <NavbarWrapper />
        <FooterWrapper />
      </>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByText(/All Rights Reserved/)).not.toBeInTheDocument()
  })
})

describe('Navbar', () => {
  test('signed out: links to every section, login and sign-up', () => {
    renderWithAuth(<Navbar />)
    for (const [name, href] of [['Blogs', '/blogs'], ['About Us', '/about-us'], ['Budget Tracker', '/budget-tracker'], ['Bookings', '/bookings'], ['ChatGuide', '/chat-guide'], ['Login', '/login'], ['Sign up', '/signup']]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  test('hovering a link highlights it; scrolling changes the style', () => {
    const { container } = renderWithAuth(<Navbar />)
    const blogsLink = screen.getByRole('link', { name: 'Blogs' })
    fireEvent.mouseEnter(blogsLink)
    expect(blogsLink.querySelectorAll('div')).toHaveLength(1)
    fireEvent.mouseLeave(blogsLink)
    expect(blogsLink.querySelectorAll('div')).toHaveLength(0)
    fireEvent.mouseEnter(screen.getAllByRole('link')[0])

    const navEl = container.querySelector('nav')
    window.scrollY = 100
    fireEvent.scroll(window)
    expect(navEl.className).toContain('py-4')
    window.scrollY = 0
    fireEvent.scroll(window)
    expect(navEl.className).toContain('py-6')
  })

  test('signed in: the user menu opens, links to the profile and logs out', async () => {
    signIn({ id: 'u', name: 'Asha Patil', email: 'a@x' })
    renderWithAuth(<Navbar />)
    const menu = await screen.findByRole('button', { name: /Asha/ })
    expect(menu).toHaveTextContent('AAsha')
    fireEvent.click(menu)
    fireEvent.click(screen.getByRole('link', { name: 'My Profile' }))
    expect(screen.queryByRole('link', { name: 'My Profile' })).not.toBeInTheDocument()

    fireEvent.click(menu)
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()

    fireEvent.click(menu)
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Logout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(localStorage.getItem('token')).toBeNull()
    expect(router.push).toHaveBeenCalledWith('/')
  })

  test('a user without a name shows an icon and "User"', async () => {
    signIn({ id: 'u', email: 'a@x' })
    renderWithAuth(<Navbar />)
    expect(await screen.findByRole('button', { name: 'User' })).toBeInTheDocument()
  })

  test('the mobile menu opens and closes, signed out and in', async () => {
    const { unmount } = renderWithAuth(<Navbar />)
    const toggle = () => screen.getAllByRole('button').at(-1)
    fireEvent.click(toggle())
    expect(screen.getAllByRole('link', { name: 'Login' })).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('link', { name: 'Blogs' })[1])
    expect(screen.getAllByRole('link', { name: 'Login' })).toHaveLength(1)
    fireEvent.click(toggle())
    fireEvent.click(screen.getAllByRole('link', { name: 'Login' })[1])
    fireEvent.click(toggle())
    fireEvent.click(screen.getAllByRole('link', { name: 'Sign up' })[1])
    unmount()

    signIn({ id: 'u', name: 'Asha', email: 'a@x' })
    renderWithAuth(<Navbar />)
    await screen.findByRole('button', { name: /Asha/ })
    fireEvent.click(toggle())
    fireEvent.click(screen.getByRole('link', { name: 'My Profile' }))
    fireEvent.click(toggle())
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(localStorage.getItem('user')).toBeNull()
  })
})

test('Footer links to the policy pages', () => {
  render(<Footer />)
  for (const [name, href] of [['About Us', '/about-us'], ['Contact Us', '/contact-us'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms-conditions']]) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  }
  expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
})

describe('HeroSection search', () => {
  const today = new Date()
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const day = (n) => {
    // Days of next month are always selectable; they appear in the second calendar.
    const cells = screen.getAllByText(String(n), { selector: 'div' })
    return cells[cells.length - 1]
  }

  test('needs a destination; then searches with destination and one guest', () => {
    render(<HeroSection />)
    fireEvent.submit(screen.getByPlaceholderText('Where to?').closest('form'))
    expect(router.push).not.toHaveBeenCalled()
    fireEvent.change(screen.getByPlaceholderText('Where to?'), { target: { value: 'Goa' } })
    fireEvent.focus(screen.getByPlaceholderText('Where to?'))
    fireEvent.blur(screen.getByPlaceholderText('Where to?'))
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(router.push).toHaveBeenCalledWith('/destination-details?destination=Goa&guests=1')
  })

  test('picking a date range and guests puts them in the search', () => {
    render(<HeroSection />)
    fireEvent.change(screen.getByPlaceholderText('Where to?'), { target: { value: 'Goa' } })
    fireEvent.click(screen.getByText('Select dates'))
    fireEvent.click(day(10))
    // An earlier day replaces the start date.
    fireEvent.click(day(5))
    fireEvent.click(day(12))
    const start = iso(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5))
    const end = iso(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 12))
    expect(screen.getByText(/→/)).toBeInTheDocument()

    fireEvent.click(screen.getByText('1 Guest'))
    fireEvent.click(screen.getByText('3 Guests'))
    expect(screen.getByText('3 Guests')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(router.push).toHaveBeenCalledWith(`/destination-details?destination=Goa&startDate=${start}&endDate=${end}&guests=3`)
  })

  test('a third click starts a new range; clear, apply and clicking outside close things', () => {
    render(<HeroSection />)
    fireEvent.click(screen.getByText('Select dates'))
    fireEvent.click(day(3))
    fireEvent.click(day(8))
    fireEvent.click(screen.getByText(/→/))
    fireEvent.click(day(20))
    expect(screen.queryByText(/→/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear dates' }))
    expect(screen.getAllByText('Select dates').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Select dates'))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()
    // Clicking a blank calendar cell or a past day does nothing.
    fireEvent.click(screen.getByText('Select dates'))
    const blank = [...document.querySelectorAll('.grid div')].find((d) => d.textContent === '')
    if (blank) fireEvent.click(blank)
    if (today.getDate() > 1) fireEvent.click(screen.getAllByText('1', { selector: 'div' })[0])
    expect(screen.getAllByText('Select dates').length).toBeGreaterThan(0)
  })

  test('today can be picked from the current month', () => {
    render(<HeroSection />)
    fireEvent.change(screen.getByPlaceholderText('Where to?'), { target: { value: 'Goa' } })
    fireEvent.click(screen.getByText('Select dates'))
    fireEvent.click(screen.getAllByText(String(today.getDate()), { selector: 'div' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(router.push.mock.calls[0][0]).toContain(`startDate=${iso(today)}`)
  })

  test('stats and the ChatGuide banner', () => {
    render(<HeroSection />)
    for (const t of ['1M+', '5000+', 'Chat Guide', '4.9/5']) expect(screen.getByRole('heading', { name: t })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start Your Journey/ })).toHaveAttribute('href', '/chat-guide')
    render(<StatsCard title="Other" subtitle="x" />)
    expect(screen.getByRole('heading', { name: 'Other' })).toBeInTheDocument()
  })
})

describe('SearchBar (used on the destination page)', () => {
  test('searches with the given defaults', () => {
    render(<SearchBar defaultValues={{ destination: 'Goa', startDate: '2026-11-10T12:00:00Z', endDate: '2026-11-12T12:00:00Z', guests: 2 }} />)
    expect(screen.getByText('Nov 10 → Nov 12')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(router.push).toHaveBeenCalledWith('/destination-details?destination=Goa&startDate=2026-11-10&endDate=2026-11-12&guests=2')
  })

  test('needs a destination; guests and the date picker open and close', () => {
    render(<SearchBar />)
    fireEvent.submit(screen.getByPlaceholderText('Where do you want to go?').closest('form'))
    expect(router.push).not.toHaveBeenCalled()
    fireEvent.focus(screen.getByPlaceholderText('Where do you want to go?'))
    fireEvent.blur(screen.getByPlaceholderText('Where do you want to go?'))
    fireEvent.click(screen.getByText('1 Guest'))
    fireEvent.click(screen.getByText('4 Guests'))
    expect(screen.getByText('4 Guests')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Select your dates'))
    expect(document.querySelector('.react-datepicker')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(document.querySelector('.react-datepicker')).not.toBeInTheDocument()
  })

  test('picking a range in the calendar shows it', () => {
    render(<SearchBar defaultValues={{ destination: 'Goa' }} />)
    fireEvent.click(screen.getByText('Select your dates'))
    // The calendar re-renders after each pick, so look the days up each time.
    const days = () => [...document.querySelectorAll('.react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--outside-month)')]
    fireEvent.click(days().at(-3))
    fireEvent.click(days().at(-1))
    expect(screen.getByText(/→/)).toBeInTheDocument()
    // The open calendar adds its own month buttons, so submit the form itself.
    fireEvent.submit(document.querySelector('form'))
    expect(router.push.mock.calls[0][0]).toMatch(/startDate=\d{4}-\d\d-\d\d&endDate=\d{4}-\d\d-\d\d/)
  })

  // FINDING: the picked dates are local midnights converted with toISOString(), so east of
  // UTC (all of India) the search asks for the day before the one picked.
  knownBug('in India, the searched start date is the day that was picked', () => {
    vi.stubEnv('TZ', 'Asia/Kolkata')
    render(<SearchBar defaultValues={{ destination: 'Goa', startDate: new Date(2026, 10, 15).toString() }} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(router.push.mock.calls[0][0]).toContain('startDate=2026-11-15')
  })
})

describe('BlogSection', () => {
  test('loads six posts and scrolls through them', async () => {
    const fetchMock = mockFetch({ '/api/blogs': { blogs } })
    const scrollTo = vi.fn()
    Element.prototype.scrollTo = scrollTo
    render(<BlogSection />)
    expect(await screen.findByText('Story 4')).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/blogs?limit=6')
    expect(screen.getByRole('link', { name: /Story 2/ })).toHaveAttribute('href', '/blogs/b2')
    expect(screen.getAllByText('February 1, 2025')).toHaveLength(5)
    const [prev, next] = screen.getAllByRole('button')
    for (let i = 0; i < 3; i++) fireEvent.click(next)
    for (let i = 0; i < 6; i++) fireEvent.click(prev)
    expect(scrollTo).toHaveBeenCalled()
    window.innerWidth = 500
    fireEvent.click(next)
    window.innerWidth = 1024
  })

  test('says when there are no posts, or the request fails', async () => {
    mockFetch({ '/api/blogs': { status: 500, body: {} } })
    const { unmount } = render(<BlogSection />)
    expect(await screen.findByText('No blogs available at the moment.')).toBeInTheDocument()
    unmount()
    mockFetch({ '/api/blogs': new Error('offline') })
    render(<BlogSection />)
    expect(await screen.findByText('No blogs available at the moment.')).toBeInTheDocument()
  })
})

describe('TestimonialsSection', () => {
  const quote = () => screen.getByRole('blockquote') ?? null
  test('moves with the arrows, by swiping, and on its own every 6 seconds', () => {
    vi.useFakeTimers()
    const { container } = render(<TestimonialsSection />)
    const text = () => container.querySelector('blockquote').textContent
    const first = text()
    const [prev, next] = screen.getAllByRole('button')
    fireEvent.click(next)
    const second = text()
    expect(second).not.toBe(first)
    fireEvent.click(prev)
    expect(text()).toBe(first)
    fireEvent.click(prev)
    expect(text()).not.toBe(first)

    const card = container.querySelector('blockquote').closest('div[class]').parentElement
    const slide = [...container.querySelectorAll('*')].find((el) => el.__motion?.onDragEnd)
    act(() => slide.__motion.onDragEnd(null, { offset: { x: -600 }, velocity: { x: -100 } }))
    expect(text()).toBe(first)
    const slide2 = [...container.querySelectorAll('*')].find((el) => el.__motion?.onDragEnd)
    act(() => slide2.__motion.onDragEnd(null, { offset: { x: 600 }, velocity: { x: 100 } }))
    act(() => [...container.querySelectorAll('*')].find((el) => el.__motion?.onDragEnd).__motion.onDragEnd(null, { offset: { x: 1 }, velocity: { x: 1 } }))
    act(() => vi.advanceTimersByTime(6000))
    expect(text()).toBe(first)
    void card
    void quote
    vi.useRealTimers()
  })
})

describe('ErrorMessage and Modal', () => {
  test('ErrorMessage shows the message and a retry button', () => {
    const retry = vi.fn()
    const { rerender } = render(<ErrorMessage message="Could not load" retry={retry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(retry).toHaveBeenCalled()
    rerender(<ErrorMessage />)
    expect(screen.getByText('An error occurred while loading the data.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('Modal locks scrolling and closes with Escape, the X, or a click outside', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Share">
        <p>inside</p>
      </Modal>
    )
    expect(screen.getByRole('heading', { name: 'Share' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'a' })
    fireEvent.mouseDown(screen.getByText('inside'))
    fireEvent.mouseDown(document.body)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(3)
    rerender(<Modal isOpen={false} onClose={onClose} title="Share" />)
    expect(document.body.style.overflow).toBe('unset')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
