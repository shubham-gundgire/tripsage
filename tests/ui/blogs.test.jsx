import { describe, test, expect, vi } from 'vitest'
import { Suspense } from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { router, nav } from '../support/next.jsx'
import { mockFetch, sentBody } from '../support/fetch.js'
import { knownBug } from '../support/known-bug.js'
import BlogsPage from '@/app/blogs/page'
import BlogPost from '@/app/blogs/[id]/page'
import NewBlogPage from '@/app/blogs/new/page'
import EditBlogPage from '@/app/blogs/edit/[id]/page'

const post = (id, overrides = {}) => ({
  id,
  title: `Post ${id}`,
  category: 'Indian Travel',
  read_time: '4 min read',
  excerpt: `About ${id}`,
  date: '2025-02-01T00:00:00Z',
  author_name: 'Asha',
  author_id: 'user-1',
  cover_image: `/${id}.jpg`,
  tags: ['food', 'beach', 'budget'],
  content: [
    { type: 'paragraph', text: 'Intro text' },
    { type: 'heading', text: 'Where to stay' },
    { type: 'image', url: '/stay.jpg', caption: 'Our homestay' },
    { type: 'tips', items: ['Carry cash', 'Start early'] },
    { type: 'conclusion', text: 'Go!' },
    { type: 'video', url: 'ignored' },
  ],
  published: true,
  ...overrides,
})

describe('/blogs', () => {
  const page = (blogs, pagination = { page: 1, totalPages: 1, total: blogs.length, limit: 9 }) => ({ blogs, pagination })

  test('lists published posts with their details', async () => {
    const fetchMock = mockFetch({ '/api/blogs': page([post('b1'), post('b2')]) })
    render(<BlogsPage />)
    expect(await screen.findByRole('heading', { name: 'Post b1' })).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/blogs?page=1&limit=9')
    expect(screen.getByRole('link', { name: /Post b2/ })).toHaveAttribute('href', '/blogs/b2')
    expect(screen.getAllByText('food')).toHaveLength(2)
    expect(screen.queryByText('budget')).not.toBeInTheDocument() // two tags per card
    expect(screen.queryByRole('link', { name: /Add Blog/ })).not.toBeInTheDocument()
  })

  test('pages: numbered buttons, previous/next, disabled at the ends', async () => {
    nav.search = new URLSearchParams('page=2')
    const fetchMock = mockFetch({ '/api/blogs': page([post('b1')], { page: 2, totalPages: 3, total: 21, limit: 9 }) })
    render(<BlogsPage />)
    await screen.findByRole('heading', { name: 'Post b1' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/blogs?page=2&limit=9')
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(router.push).toHaveBeenLastCalledWith('/blogs?mode=all&page=3')
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons.at(-1))
    expect(router.push).toHaveBeenLastCalledWith('/blogs?mode=all&page=3')
    fireEvent.click(buttons.at(-5))
    expect(router.push).toHaveBeenLastCalledWith('/blogs?mode=all&page=1')
  })

  test('"My Blogs" needs a login', async () => {
    mockFetch({ '/api/blogs': page([]) })
    render(<BlogsPage />)
    expect(await screen.findByText('There are no blogs available at the moment.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /My Blogs/ }))
    expect(router.push).toHaveBeenCalledWith('/login?redirectTo=/blogs?mode=my')
  })

  test('signed in, "My Blogs" lists my posts with my token; empty shows a create link', async () => {
    localStorage.setItem('token', 'tok-1')
    const fetchMock = mockFetch({ '/api/blogs': page([post('b1')]), '/api/blogs/my-blogs': page([]) })
    render(<BlogsPage />)
    expect(await screen.findByRole('link', { name: /Add Blog/ })).toHaveAttribute('href', '/blogs/new')
    fireEvent.click(screen.getByRole('button', { name: /My Blogs/ }))
    expect(await screen.findByText(/You haven't created any blogs yet/)).toBeInTheDocument()
    const call = fetchMock.mock.calls.find(([u]) => u.startsWith('/api/blogs/my-blogs'))
    expect(call[1].headers.Authorization).toBe('Bearer tok-1')
    expect(screen.getByRole('link', { name: /Create your first blog/ })).toBeInTheDocument()
    expect(router.push).toHaveBeenCalledWith('/blogs?mode=my&page=1')
    fireEvent.click(screen.getByRole('button', { name: 'All Blogs' }))
    expect(await screen.findByRole('heading', { name: 'Post b1' })).toBeInTheDocument()
  })

  test('falls back to all blogs if "My Blogs" is refused, and survives errors', async () => {
    localStorage.setItem('token', 'expired')
    mockFetch({ '/api/blogs': page([post('b1')]), '/api/blogs/my-blogs': { status: 401, body: {} } })
    render(<BlogsPage />)
    await screen.findByRole('heading', { name: 'Post b1' })
    fireEvent.click(screen.getByRole('button', { name: /My Blogs/ }))
    expect(await screen.findByRole('heading', { name: 'Post b1' })).toBeInTheDocument()

    mockFetch({ '/api/blogs': { status: 500, body: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'All Blogs' }))
    mockFetch({ '/api/blogs': new Error('offline') })
    fireEvent.click(screen.getByRole('button', { name: 'All Blogs' }))
    mockFetch({ '/api/blogs': { blogs: undefined, pagination: undefined } })
    fireEvent.click(screen.getByRole('button', { name: 'All Blogs' }))
  })

  // FINDING: the mode is kept only in component state, never read from the URL, so
  // /blogs?mode=my (where creating or deleting a post sends you) shows all blogs.
  knownBug('/blogs?mode=my opens on my blogs', async () => {
    localStorage.setItem('token', 'tok-1')
    nav.search = new URLSearchParams('mode=my&page=1')
    const fetchMock = mockFetch({ '/api/blogs': page([]), '/api/blogs/my-blogs': page([]) })
    render(<BlogsPage />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock.mock.calls[0][0]).toContain('/api/blogs/my-blogs')
  })
})

describe('/blogs/[id]', () => {
  test('renders every content block type and the tags', async () => {
    nav.params = { id: 'b1' }
    mockFetch({ '/api/blogs/b1': post('b1') })
    render(<BlogPost />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Post b1' })).toBeInTheDocument()
    expect(screen.getByText('Intro text')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Where to stay' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Our homestay' })).toHaveAttribute('src', '/stay.jpg')
    expect(screen.getByText('Carry cash')).toBeInTheDocument()
    expect(screen.getByText('Go!')).toBeInTheDocument()
    expect(screen.getByText('budget')).toBeInTheDocument()
    expect(screen.getByText('February 1, 2025')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  test('waits for the id; unknown posts show "Blog not found"', async () => {
    const fetchMock = mockFetch({ '/api/blogs/nope': { status: 404, body: {} } })
    const { rerender } = render(<BlogPost />)
    expect(fetchMock).not.toHaveBeenCalled()
    nav.params = { id: 'nope' }
    rerender(<BlogPost />)
    expect(await screen.findByRole('heading', { name: 'Blog not found' })).toBeInTheDocument()
  })

  test('the author gets Edit and Delete; delete asks first', async () => {
    nav.params = { id: 'b1' }
    localStorage.setItem('token', 'tok-1')
    const fetchMock = mockFetch({ 'GET /api/blogs/b1': post('b1'), '/api/auth/me': { user: { id: 'user-1' } }, 'DELETE /api/blogs/b1': { message: 'ok' } })
    vi.stubGlobal('confirm', vi.fn(() => false))
    render(<BlogPost />)
    expect(await screen.findByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/blogs/edit/b1')
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(fetchMock.mock.calls.some(([, i]) => i?.method === 'DELETE')).toBe(false)
    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/blogs?mode=my'))
  })

  test('delete: a refused or failed delete is reported; no token goes to login', async () => {
    nav.params = { id: 'b1' }
    localStorage.setItem('token', 'tok-1')
    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('alert', vi.fn())
    mockFetch({ 'GET /api/blogs/b1': post('b1'), '/api/auth/me': { user: { id: 'user-1' } }, 'DELETE /api/blogs/b1': { status: 403, body: {} } })
    render(<BlogPost />)
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Failed to delete blog'))
    mockFetch({ 'DELETE /api/blogs/b1': new Error('offline') })
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('An error occurred while deleting the blog'))
    localStorage.removeItem('token')
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
  })

  test('not the author, or the author check fails: no edit controls', async () => {
    nav.params = { id: 'b1' }
    localStorage.setItem('token', 'tok-1')
    mockFetch({ 'GET /api/blogs/b1': post('b1'), '/api/auth/me': { user: { id: 'someone-else' } } })
    const { unmount } = render(<BlogPost />)
    await screen.findByRole('heading', { level: 1, name: 'Post b1' })
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    unmount()
    mockFetch({ 'GET /api/blogs/b1': post('b1'), '/api/auth/me': new Error('offline') })
    render(<BlogPost />)
    await screen.findByRole('heading', { level: 1, name: 'Post b1' })
    mockFetch({ 'GET /api/blogs/b1': post('b1'), '/api/auth/me': { status: 401, body: {} } })
  })
})

describe('/blogs/new', () => {
  const ready = async () => {
    localStorage.setItem('token', 'tok-1')
    const fetchMock = mockFetch({ '/api/auth/me': { user: { id: 'user-1' } }, 'POST /api/blogs': { blog: { id: 'new' } }, 'POST /api/upload': { url: 'https://img.example/cover.jpg' } })
    render(<NewBlogPage />)
    await screen.findByRole('heading', { name: 'Create New Blog' })
    return fetchMock
  }
  const fill = ({ title = 'Monsoon in Kerala', excerpt = 'Rain and backwaters', category = 'Indian Travel', cover = 'https://img.example/c.jpg', content = 'Hello' } = {}) => {
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: title } })
    fireEvent.change(screen.getByLabelText(/^Excerpt/), { target: { value: excerpt } })
    fireEvent.change(screen.getByLabelText(/^Category/), { target: { value: category } })
    fireEvent.change(screen.getByPlaceholderText('Or enter image URL directly'), { target: { value: cover } })
    fireEvent.change(screen.getByLabelText(/^Content/), { target: { value: content } })
  }
  const submit = () => fireEvent.submit(screen.getByRole('button', { name: 'Create Blog' }).closest('form'))

  test('without a token, or with a rejected one, goes to login', async () => {
    render(<NewBlogPage />)
    expect(router.push).toHaveBeenCalledWith('/login?redirectTo=/blogs/new')
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  test('a rejected or unverifiable token goes to login', async () => {
    localStorage.setItem('token', 'expired')
    mockFetch({ '/api/auth/me': { status: 401, body: {} } })
    const { unmount } = render(<NewBlogPage />)
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login?redirectTo=/blogs/new'))
    expect(localStorage.getItem('token')).toBeNull()
    unmount()
    localStorage.setItem('token', 'tok')
    mockFetch({ '/api/auth/me': new Error('offline') })
    render(<NewBlogPage />)
    await waitFor(() => expect(router.push).toHaveBeenCalledTimes(2))
  })

  test('creates a post: content becomes blocks, read time is estimated, tags are kept', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const fetchMock = await ready()
    fill({ content: '# Getting there\n\nTake the night train.\n\nPack:\n* Umbrella\n- Sandals\n\n_Worth it._\n\n\n\n' + 'word '.repeat(450) })
    const tagBox = screen.getByLabelText('Tags')
    fireEvent.change(tagBox, { target: { value: ' rain ' } })
    fireEvent.keyPress(tagBox, { key: 'Enter', code: 'Enter', charCode: 13 })
    fireEvent.change(tagBox, { target: { value: 'rain' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    fireEvent.change(tagBox, { target: { value: 'food' } })
    fireEvent.keyPress(tagBox, { key: 'a', code: 'KeyA', charCode: 97 })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    fireEvent.click(screen.getAllByRole('button', { name: '×' })[1])
    fireEvent.click(screen.getByLabelText(/Publish immediately/))
    submit()

    expect(await screen.findByText('Blog created successfully! Redirecting...')).toBeInTheDocument()
    const body = sentBody(fetchMock, '/api/blogs')
    expect(body).toMatchObject({ title: 'Monsoon in Kerala', category: 'Indian Travel', tags: ['rain'], published: true, read_time: '3 min read', cover_image: 'https://img.example/c.jpg' })
    expect(body.content.slice(0, 4)).toEqual([
      { type: 'heading', text: 'Getting there' },
      { type: 'paragraph', text: 'Take the night train.' },
      { type: 'tips', items: ['Umbrella', 'Sandals'] },
      { type: 'conclusion', text: 'Worth it.' },
    ])
    await act(async () => vi.advanceTimersByTime(1000))
    expect(router.push).toHaveBeenCalledWith('/blogs?mode=my')
    vi.useRealTimers()
  })

  test('missing fields, API errors and a lost token are handled', async () => {
    await ready()
    submit()
    expect(screen.getByText(/There was an error creating your blog/)).toBeInTheDocument()
    fill()
    mockFetch({ 'POST /api/blogs': { status: 500, body: { error: 'x' } } })
    submit()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create Blog' })).toBeEnabled())
    expect(screen.getByText(/There was an error creating your blog/)).toBeInTheDocument()
    mockFetch({ 'POST /api/blogs': new Error('offline') })
    submit()
    await waitFor(() => expect(screen.getByText(/There was an error/)).toBeInTheDocument())
    localStorage.removeItem('token')
    submit()
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login?redirectTo=/blogs/new'))
  })

  test('cover image: upload, wrong type, too large, failure', async () => {
    const fetchMock = await ready()
    const input = document.querySelector('input[type="file"]')
    const click = vi.spyOn(input, 'click')
    fireEvent.click(screen.getByRole('button', { name: /Upload Image/ }))
    expect(click).toHaveBeenCalled()
    expect(screen.getByText('No image selected')).toBeInTheDocument()

    fireEvent.change(input, { target: { files: [new File(['x'], 'notes.txt', { type: 'text/plain' })] } })
    expect(screen.getByText('Please select an image file')).toBeInTheDocument()
    const big = new File(['x'], 'big.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [big] } })
    expect(screen.getByText('Image size should be less than 5MB')).toBeInTheDocument()

    fireEvent.change(input, { target: { files: [new File(['png'], 'c.png', { type: 'image/png' })] } })
    expect(await screen.findByRole('img', { name: 'Cover preview' })).toHaveAttribute('src', 'https://img.example/cover.jpg')
    const upload = fetchMock.mock.calls.find(([u]) => u === '/api/upload')
    expect(upload[1].headers.Authorization).toBe('Bearer tok-1')

    mockFetch({ 'POST /api/upload': { status: 500, body: {} } })
    fireEvent.change(input, { target: { files: [new File(['png'], 'c.png', { type: 'image/png' })] } })
    expect(await screen.findByText('Failed to upload image. Please try again.')).toBeInTheDocument()
    fireEvent.change(input, { target: { files: [] } })
  })

  // FINDING: in a paragraph that contains a list, every line that is not a list item is
  // dropped: "Packing list:" followed by items loses the "Packing list:" line.
  knownBug('text before a list is kept', async () => {
    const fetchMock = await ready()
    fill({ content: 'Packing list:\n* Umbrella\n* Sandals' })
    submit()
    await screen.findByText('Blog created successfully! Redirecting...')
    expect(JSON.stringify(sentBody(fetchMock, '/api/blogs').content)).toContain('Packing list:')
  })
})

describe('/blogs/edit/[id]', () => {
  const open = async (routes, id = 'b1') => {
    localStorage.setItem('token', 'tok-1')
    const fetchMock = mockFetch(routes)
    await act(async () => {
      render(
        <Suspense fallback={<p>suspended</p>}>
          <EditBlogPage params={Promise.resolve({ id })} />
        </Suspense>
      )
    })
    return fetchMock
  }

  test('loads the post into the form and saves changes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const fetchMock = await open({ 'GET /api/blogs/b1': post('b1'), 'PUT /api/blogs/b1': { blog: {} } })
    expect(await screen.findByDisplayValue('Post b1')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Content/).value).toBe('Intro text\n\n# Where to stay\n\n* Carry cash\n* Start early\n\n_Go!_\n\n')
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'New title' } })
    fireEvent.submit(screen.getByLabelText(/^Title/).closest('form'))
    await waitFor(() => expect(fetchMock.mock.calls.some(([, i]) => i?.method === 'PUT')).toBe(true))
    expect(sentBody(fetchMock, '/api/blogs/b1', 1)).toMatchObject({ title: 'New title', tags: ['food', 'beach', 'budget'] })
    await act(async () => vi.advanceTimersByTime(1000))
    expect(router.push).toHaveBeenCalledWith('/blogs/b1')
    vi.useRealTimers()
  })

  test('404 goes to the list; 401/403 to login; other errors show the error', async () => {
    await open({ 'GET /api/blogs/b1': { status: 404, body: {} } })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/blogs'))
  })

  test.each([401, 403])('%i goes to login', async (status) => {
    await open({ 'GET /api/blogs/b1': { status, body: {} } })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
  })

  test('a failing load shows "Blog not found"', async () => {
    await open({ 'GET /api/blogs/b1': { status: 500, body: {} } })
    expect(await screen.findByRole('heading', { name: 'Blog not found' })).toBeInTheDocument()
  })

  test('no token goes to login', async () => {
    mockFetch({})
    await act(async () => {
      render(
        <Suspense fallback={null}>
          <EditBlogPage params={Promise.resolve({ id: 'b1' })} />
        </Suspense>
      )
    })
    expect(router.push).toHaveBeenCalledWith('/login?redirectTo=/blogs/edit/b1')
  })

  test('the form controls: tags, publish, cover upload and validation', async () => {
    const fetchMock = await open({ 'GET /api/blogs/b1': post('b1', { tags: undefined }), 'PUT /api/blogs/b1': { status: 500, body: { error: 'x' } }, 'POST /api/upload': { url: 'https://img.example/new.jpg' } })
    await screen.findByDisplayValue('Post b1')
    const tagBox = screen.getByLabelText('Tags')
    fireEvent.change(tagBox, { target: { value: 'kerala' } })
    fireEvent.keyPress(tagBox, { key: 'Enter', code: 'Enter', charCode: 13 })
    fireEvent.change(tagBox, { target: { value: 'kerala' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    fireEvent.keyPress(tagBox, { key: 'x', code: 'KeyX', charCode: 120 })
    fireEvent.change(tagBox, { target: { value: 'rain' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    fireEvent.click(screen.getAllByRole('button', { name: '×' })[0])
    fireEvent.click(screen.getByLabelText(/Publish/))
    fireEvent.change(screen.getByLabelText(/^Excerpt/), { target: { value: 'New excerpt' } })
    fireEvent.change(screen.getByLabelText(/^Category/), { target: { value: 'Adventure' } })

    const input = document.querySelector('input[type="file"]')
    const click = vi.spyOn(input, 'click')
    fireEvent.click(screen.getByRole('button', { name: /Upload Image/ }))
    expect(click).toHaveBeenCalled()
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } })
    expect(screen.getByText('Please select an image file')).toBeInTheDocument()
    const big = new File(['x'], 'big.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [big] } })
    expect(screen.getByText('Image size should be less than 5MB')).toBeInTheDocument()
    fireEvent.change(input, { target: { files: [new File(['p'], 'c.png', { type: 'image/png' })] } })
    expect(await screen.findByRole('img', { name: 'Cover preview' })).toHaveAttribute('src', 'https://img.example/new.jpg')
    mockFetch({ 'POST /api/upload': { status: 500, body: {} }, 'PUT /api/blogs/b1': { status: 500, body: { error: 'x' } } })
    fireEvent.change(input, { target: { files: [new File(['p'], 'c.png', { type: 'image/png' })] } })
    expect(await screen.findByText('Failed to upload image. Please try again.')).toBeInTheDocument()
    fireEvent.change(input, { target: { files: [] } })

    // A failed save, then an error, then a missing required field.
    fireEvent.submit(screen.getByLabelText(/^Title/).closest('form'))
    expect(await screen.findByText(/There was an error/)).toBeInTheDocument()
    mockFetch({ 'PUT /api/blogs/b1': new Error('offline') })
    fireEvent.submit(screen.getByLabelText(/^Title/).closest('form'))
    await waitFor(() => expect(screen.getByText(/There was an error/)).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText('Or enter image URL directly'), { target: { value: '' } })
    fireEvent.submit(screen.getByLabelText(/^Title/).closest('form'))
    expect(screen.getByText(/There was an error/)).toBeInTheDocument()
    expect(screen.getByText('No image selected')).toBeInTheDocument()
    void fetchMock
  })

  test('saving after the token is gone goes to login', async () => {
    await open({ 'GET /api/blogs/b1': post('b1') })
    await screen.findByDisplayValue('Post b1')
    localStorage.removeItem('token')
    fireEvent.submit(screen.getByLabelText(/^Title/).closest('form'))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login?redirectTo=/blogs/edit/b1'))
  })

  test('without an id in the route nothing loads', async () => {
    localStorage.setItem('token', 'tok-1')
    const fetchMock = mockFetch({})
    await act(async () => {
      render(
        <Suspense fallback={null}>
          <EditBlogPage params={Promise.resolve({})} />
        </Suspense>
      )
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('Could not extract blog ID from params')
  })

  // FINDING: the editor turns the post into text without its image blocks, so saving any edit
  // deletes the post's inline images (the six bundled posts have 17).
  knownBug('saving an edit keeps the inline images', async () => {
    const fetchMock = await open({ 'GET /api/blogs/b1': post('b1'), 'PUT /api/blogs/b1': { blog: {} } })
    await screen.findByDisplayValue('Post b1')
    fireEvent.submit(screen.getByLabelText(/^Title/).closest('form'))
    await waitFor(() => expect(fetchMock.mock.calls.some(([, i]) => i?.method === 'PUT')).toBe(true))
    expect(sentBody(fetchMock, '/api/blogs/b1', 1).content.some((b) => b.type === 'image')).toBe(true)
  })
})
