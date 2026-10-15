import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import { router, nav } from '../support/next.jsx'
import { mockFetch, sentBody } from '../support/fetch.js'
import { renderWithAuth, signIn, signInThenLoseToken } from '../support/render.jsx'
import { knownBug } from '../support/known-bug.js'
import BookingsPage from '@/app/bookings/page'
import HotelBookingsPage from '@/app/bookings/hotel/page'
import HotelDetailPage from '@/app/bookings/hotel/[id]/page'
import TravelPackagesPage from '@/app/bookings/travel/page'
import TravelPackageDetailPage from '@/app/bookings/travel/[id]/page'
import BookingDetailsPage from '@/app/bookings/details/[id]/page'
import MyBookingsByType from '@/app/bookings/my-bookings/page'
import MyBookingsPage from '@/app/my-bookings/page'
import AdminBookingsPage from '@/app/admin/bookings/page'
import BookingCard from '@/app/components/booking/BookingCard'
import HotelCard from '@/app/components/booking/HotelCard'
import TravelPackageCard from '@/app/components/booking/TravelPackageCard'

const hotel = {
  id: 'h1',
  name: 'Sea View',
  location: 'Goa, India',
  description: 'By the beach',
  price_per_night: 100,
  rating: 4.6,
  reviews_count: 120,
  amenities: ['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Restaurant', 'Gym'],
  images: ['/a.jpg', '/b.jpg'],
  room_types: [
    { id: 'r1', name: 'Deluxe', price_per_night: 100, capacity: 2, description: 'd' },
    { id: 'r2', name: 'Suite', price_per_night: 250, capacity: 1, description: 's' },
  ],
  nearby_attractions: [{ name: 'Baga Beach', description: 'Sand' }],
  policies: { check_in_time: '2 PM', check_out_time: '11 AM', cancellation_policy: 'Free until 24h' },
}
const pkg = {
  id: 'p1',
  name: 'Bali Bliss',
  destination: 'Bali',
  description: 'Beaches and temples',
  price: 1000,
  discounted_price: 800,
  duration: 7,
  max_participants: 12,
  rating: 4.8,
  images: ['/p1.jpg', '/p2.jpg'],
  highlights: ['Temples'],
  itinerary: [{ title: 'Arrive', description: 'Check in', activities: ['Welcome dinner'] }, { title: 'Relax', description: 'Beach' }],
  included_services: ['Hotel'],
  excluded_services: ['Flights'],
  categories: ['Beach', 'Culture'],
  features: ['Guide'],
  accommodation_type: 'Resort',
  activity_level: 'Easy',
}
const inr = (usd) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(usd * 83)

describe('/bookings', () => {
  test('signed out: a warning, and every option goes to login', async () => {
    renderWithAuth(<BookingsPage />)
    expect(await screen.findByText(/You need to be logged in to make bookings/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hotel Bookings'))
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  test('signed in: the options open hotels, packages and my bookings', async () => {
    signIn()
    renderWithAuth(<BookingsPage />)
    await waitFor(() => expect(screen.queryByText(/You need to be logged in/)).not.toBeInTheDocument())
    fireEvent.click(screen.getByText('Hotel Bookings'))
    fireEvent.click(screen.getByText('Travel Packages'))
    fireEvent.click(screen.getByText('My Bookings'))
    expect(router.push.mock.calls.map((c) => c[0])).toEqual(['/bookings/hotel', '/bookings/travel', '/bookings/my-bookings'])
  })
})

describe('/bookings/hotel', () => {
  test('signed out goes to login and renders nothing', async () => {
    const { container } = renderWithAuth(<HotelBookingsPage />)
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
    expect(container).toBeEmptyDOMElement()
  })

  test('searches with the filters and lists hotels in rupees', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    signIn()
    const fetchMock = mockFetch({ 'POST /api/llm/hotels/search': { hotels: [hotel, { ...hotel, id: 'h2', name: 'No Photo', images: [], amenities: undefined }], is_fallback_data: true } })
    renderWithAuth(<HotelBookingsPage />)
    expect(await screen.findByText('Search for Hotels')).toBeInTheDocument()
    fireEvent.submit(screen.getByPlaceholderText('Where are you going?').closest('form'))
    expect(screen.getByText('Please enter a destination')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Where are you going?'), { target: { value: 'Goa' } })
    fireEvent.click(screen.getByRole('button', { name: /Advanced Filters/ }))
    fireEvent.change(screen.getByLabelText(/Min Price/), { target: { value: '50' } })
    fireEvent.change(screen.getByLabelText(/Max Price/), { target: { value: '300' } })
    fireEvent.change(screen.getByLabelText('Minimum Rating'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: /Search Hotels/ }))

    expect(await screen.findByRole('heading', { name: 'Sea View' })).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/llm/hotels/search')).toEqual({ location: 'Goa', minPrice: '50', maxPrice: '300', rating: '4' })
    expect(screen.getAllByText(inr(100)).length).toBeGreaterThan(0)
    expect(screen.getByText('+2 more')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /View Hotel/ })[0]).toHaveAttribute('href', '/bookings/hotel/h1?name=Sea%20View&location=Goa%2C%20India')
    expect(screen.getByText(/Showing generated hotels/)).toBeInTheDocument()
    fireEvent.error(screen.getByRole('img', { name: 'Sea View' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText(/Showing generated hotels/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Hide Filters/ }))
    vi.useRealTimers()
  })

  test('no results, API errors and a missing token', async () => {
    signIn()
    mockFetch({ 'POST /api/llm/hotels/search': { hotels: [] } })
    renderWithAuth(<HotelBookingsPage />)
    const search = (place) => {
      fireEvent.change(screen.getByPlaceholderText('Where are you going?'), { target: { value: place } })
      fireEvent.submit(screen.getByPlaceholderText('Where are you going?').closest('form'))
    }
    search('Nowhere')
    expect(await screen.findByText('No hotels found')).toBeInTheDocument()
    mockFetch({ 'POST /api/llm/hotels/search': { status: 400, body: { error: 'Location is required' } } })
    search('x')
    expect(await screen.findByText('Location is required')).toBeInTheDocument()
    mockFetch({ 'POST /api/llm/hotels/search': { status: 500, body: {} } })
    search('y')
    expect(await screen.findByText('Failed to search hotels')).toBeInTheDocument()
    mockFetch({ 'POST /api/llm/hotels/search': { body: {} } })
    search('z')
    expect(await screen.findByText('No hotels found')).toBeInTheDocument()
    mockFetch({ 'POST /api/llm/hotels/search': new Error('') })
    search('w')
    expect(await screen.findByText('Failed to search hotels. Please try again.')).toBeInTheDocument()
    localStorage.removeItem('token')
    search('v')
    expect(await screen.findByText('Authentication token not found. Please log in again.')).toBeInTheDocument()
  })
})

describe('/bookings/hotel/[id]', () => {
  const open = async (routes) => {
    signIn()
    nav.params = { id: 'h1' }
    nav.search = new URLSearchParams('name=Sea View&location=Goa, India')
    const fetchMock = mockFetch(routes)
    renderWithAuth(<HotelDetailPage />)
    return fetchMock
  }

  test('shows the hotel and books the selected room for the chosen dates', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const fetchMock = await open({ 'POST /api/llm/hotels/details': { hotel, is_fallback_data: true }, 'POST /api/bookings/create-hotel-booking': { booking: { id: 'b1' } } })
    expect(await screen.findByRole('heading', { level: 1, name: 'Sea View' })).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/llm/hotels/details')).toEqual({ id: 'h1', name: 'Sea View', location: 'Goa, India' })
    expect(screen.getByText('Baga Beach')).toBeInTheDocument()
    expect(screen.getByText('Free until 24h')).toBeInTheDocument()
    expect(screen.getByText('3 nights')).toBeInTheDocument()
    expect(screen.getByText(/Using cached hotel information/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sea View - Photo 2' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('heading', { name: 'Suite' }))
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } })
    expect(screen.getAllByText(inr(750)).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))

    expect(await screen.findByText(/Booking successful!/)).toBeInTheDocument()
    const body = sentBody(fetchMock, '/api/bookings/create-hotel-booking')
    expect(body).toMatchObject({ hotel_id: 'h1', room_type_id: 'r2', room_type: 'Suite', guests: 3, total_price: 750 })
    expect(body.check_in_date).toMatch(/^\d{4}-\d\d-\d\d$/)
    await act(async () => vi.advanceTimersByTime(2000))
    expect(router.push).toHaveBeenCalledWith('/my-bookings')
    vi.useRealTimers()
  })

  test('the calendar buttons, toasts and image errors', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await open({ 'POST /api/llm/hotels/details': { hotel: { ...hotel, images: ['/only.jpg'] }, is_fallback_data: true } })
    await screen.findByRole('heading', { level: 1, name: 'Sea View' })
    expect(screen.getByText('No additional photos available')).toBeInTheDocument()
    const [checkIn, checkOut] = screen.getAllByRole('textbox')
    // Moving check-in past check-out pushes check-out a day later.
    fireEvent.change(checkIn, { target: { value: '12/30/2030' } })
    fireEvent.change(checkOut, { target: { value: '12/31/2030' } })
    for (const button of screen.getAllByRole('button').filter((b) => b.type === 'button' && !b.textContent)) fireEvent.click(button)
    fireEvent.error(screen.getAllByRole('img', { name: 'Sea View' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await act(async () => vi.advanceTimersByTime(6000))
    vi.useRealTimers()
  })

  test('booking errors are shown', async () => {
    await open({ 'POST /api/llm/hotels/details': { hotel }, 'POST /api/bookings/create-hotel-booking': { status: 500, body: { error: 'Failed to create booking: db' } } })
    fireEvent.click(await screen.findByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Failed to create booking: db')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/create-hotel-booking': { status: 500, body: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Failed to create booking')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/create-hotel-booking': new Error('') })
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Failed to create booking. Please try again.')).toBeInTheDocument()
    localStorage.removeItem('token')
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Authentication token not found. Please log in again.')).toBeInTheDocument()
  })

  test('a hotel without rooms asks for a room type', async () => {
    await open({ 'POST /api/llm/hotels/details': { hotel: { ...hotel, room_types: [] } } })
    fireEvent.click(await screen.findByRole('button', { name: 'Book Now' }))
    expect(screen.getByText('Please select a room type')).toBeInTheDocument()
  })

  test('load errors show a way back; no hotel shows "Hotel Not Found"', async () => {
    await open({ 'POST /api/llm/hotels/details': { status: 401, body: { error: 'Invalid or expired token' } } })
    expect(await screen.findByText('Invalid or expired token')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to Search/ })).toHaveAttribute('href', '/bookings/hotel')
  })

  test('a failed load shows the error', async () => {
    await open({ 'POST /api/llm/hotels/details': { status: 500, body: {} } })
    expect(await screen.findByText('Failed to fetch hotel details')).toBeInTheDocument()
  })

  // An answer without a hotel crashes while reading its rooms, so the raw JavaScript error is
  // shown instead of "Hotel Not Found" (which cannot be reached).
  test('an answer without a hotel shows the raw error', async () => {
    await open({ 'POST /api/llm/hotels/details': { hotel: null } })
    expect(await screen.findByText(/Cannot read properties of null/)).toBeInTheDocument()
  })

  test('a token that disappears after login is reported', async () => {
    nav.params = { id: 'h1' }
    signInThenLoseToken()
    renderWithAuth(<HotelDetailPage />)
    expect(await screen.findByText('Authentication token not found')).toBeInTheDocument()
  })

  test('without a token the page says so; without a login it redirects', async () => {
    nav.params = { id: 'h1' }
    renderWithAuth(<HotelDetailPage />)
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
  })

  // FINDING: the page shows rupees (price × 83) but sends the dollar amount as total_price;
  // the confirmation email then shows that number with a ₹ sign (₹750 for a ₹62,250 stay).
  knownBug('the booked total matches the total shown on the page', async () => {
    const fetchMock = await open({ 'POST /api/llm/hotels/details': { hotel }, 'POST /api/bookings/create-hotel-booking': { booking: {} } })
    fireEvent.click(await screen.findByRole('heading', { name: 'Suite' }))
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    await screen.findByText(/Booking successful!/)
    expect(sentBody(fetchMock, '/api/bookings/create-hotel-booking').total_price).toBe(750 * 83)
  })

  // FINDING: the guest count is not checked against the room: six guests can book a room that
  // "fits up to 1 person".
  knownBug('refuses more guests than the room fits', async () => {
    const fetchMock = await open({ 'POST /api/llm/hotels/details': { hotel }, 'POST /api/bookings/create-hotel-booking': { booking: {} } })
    fireEvent.click(await screen.findByRole('heading', { name: 'Suite' }))
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '6' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    await new Promise((r) => setTimeout(r, 50))
    expect(fetchMock.mock.calls.some(([u]) => u.includes('create-hotel-booking'))).toBe(false)
  })
})

describe('/bookings/travel', () => {
  test('searches as filters change and shows discounts', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    signIn()
    const fetchMock = mockFetch({ 'POST /api/llm/travel-packages/search': { travelPackages: [pkg, { ...pkg, id: 'p2', name: 'Plain', discounted_price: null, images: [], categories: undefined, price: 0 }], is_fallback_data: true } })
    renderWithAuth(<TravelPackagesPage />)
    expect(await screen.findByRole('heading', { name: 'Bali Bliss' })).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/llm/travel-packages/search')).toEqual({ destination: 'Worldwide', minPrice: null, maxPrice: null, duration: null })
    expect(screen.getByText('Save 20%')).toBeInTheDocument()
    expect(screen.getByText(inr(800))).toBeInTheDocument()
    expect(screen.getByText('₹10,000')).toBeInTheDocument() // a missing price is shown as ₹10,000
    expect(screen.getAllByRole('link', { name: /View Details/ })[0]).toHaveAttribute('href', '/bookings/travel/p1?name=Bali%20Bliss&destination=Bali')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    fireEvent.click(screen.getByRole('button', { name: /Advanced Filters/ }))
    fireEvent.change(screen.getByLabelText(/Min Price/), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/Max Price/), { target: { value: '900' } })
    fireEvent.change(screen.getByLabelText(/Duration/), { target: { value: screen.getByLabelText(/Duration/).options[1].value } })
    fireEvent.submit(screen.getByPlaceholderText('Where do you want to go?').closest('form'))
    await waitFor(() => expect(sentBody(fetchMock, '/api/llm/travel-packages/search', fetchMock.mock.calls.length - 1)).toMatchObject({ minPrice: '100', maxPrice: '900' }))
    fireEvent.click(screen.getByRole('button', { name: /Hide Filters/ }))
    await act(async () => vi.advanceTimersByTime(6000))
    vi.useRealTimers()
  })

  test('errors, no results, no token, and signed out', async () => {
    signIn()
    mockFetch({ 'POST /api/llm/travel-packages/search': { status: 500, body: {} } })
    const { unmount } = renderWithAuth(<TravelPackagesPage />)
    expect(await screen.findByText('Failed to load travel packages. Please try again.')).toBeInTheDocument()
    unmount()
    mockFetch({ 'POST /api/llm/travel-packages/search': {} })
    const second = renderWithAuth(<TravelPackagesPage />)
    expect(await screen.findByText('No travel packages found')).toBeInTheDocument()
    second.unmount()
    vi.restoreAllMocks()
    signInThenLoseToken()
    renderWithAuth(<TravelPackagesPage />)
    expect(await screen.findByText('Authentication token not found. Please log in again.')).toBeInTheDocument()
  })

  // FINDING: the search runs from an effect on every keystroke of the destination, so typing
  // "Bali" sends four AI searches (plus the first "Worldwide" one).
  knownBug('typing a destination does not search on every keystroke', async () => {
    signIn()
    const fetchMock = mockFetch({ 'POST /api/llm/travel-packages/search': { travelPackages: [] } })
    renderWithAuth(<TravelPackagesPage />)
    await screen.findByText('No travel packages found')
    for (const value of ['B', 'Ba', 'Bal', 'Bali']) fireEvent.change(screen.getByPlaceholderText('Where do you want to go?'), { target: { value } })
    await new Promise((r) => setTimeout(r, 50))
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(2)
  })
})

describe('/bookings/travel/[id]', () => {
  const open = async (routes, cache) => {
    signIn()
    nav.search = new URLSearchParams('name=Bali Bliss&destination=Bali')
    if (cache) localStorage.setItem('travelPackages', cache)
    const fetchMock = mockFetch(routes)
    renderWithAuth(<TravelPackageDetailPage params={{ id: 'p1' }} />)
    return fetchMock
  }

  test('finds the package through the search, books it and confirms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const fetchMock = await open({
      'POST /api/llm/travel-packages/details': { is_fallback_data: true, travelPackage: null },
      'POST /api/llm/travel-packages/search': { travelPackages: [pkg] },
      'POST /api/bookings/create-travel-booking': { booking: { id: 'b1' } },
    })
    expect(await screen.findByRole('heading', { level: 1, name: 'Bali Bliss' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('travelPackages'))[0].id).toBe('p1')
    expect(screen.getByText('Day 1: Arrive')).toBeInTheDocument()
    expect(screen.getByText('Welcome dinner')).toBeInTheDocument()
    expect(screen.getByText('Save 20%')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('img', { name: 'Bali Bliss image 2' }).parentElement)

    expect(screen.getByRole('button', { name: 'Book Now' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/Travel Date/), { target: { value: '2030-01-10' } })
    fireEvent.change(screen.getByLabelText(/Number of Participants/), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/Special Requests/), { target: { value: 'Veg meals' } })
    expect(screen.getAllByText(inr(1600)).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))

    expect(await screen.findByRole('heading', { name: 'Booking Confirmed!' })).toBeInTheDocument()
    expect(sentBody(fetchMock, '/api/bookings/create-travel-booking')).toMatchObject({ travel_package_id: 'p1', package_name: 'Bali Bliss', travel_date: '2030-01-10', participants: 2, total_price: 1600, special_requests: 'Veg meals', package_type: 'Beach' })
    await act(async () => vi.advanceTimersByTime(2000))
    expect(router.push).toHaveBeenCalledWith('/my-bookings')
    vi.useRealTimers()
  })

  test('uses a cached package, and the API package when it sends one', async () => {
    const fetchMock = await open({}, JSON.stringify([{ ...pkg, discounted_price: null }]))
    expect(await screen.findByRole('heading', { level: 1, name: 'Bali Bliss' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
  })

  test('the details endpoint can answer the package directly; bad cache is ignored', async () => {
    await open({ 'POST /api/llm/travel-packages/details': { travelPackage: { ...pkg, images: ['/only.jpg'], categories: undefined, features: undefined, availability: 'Winter' } } }, '{bad')
    expect(await screen.findByText('Winter')).toBeInTheDocument()
  })

  test.each([
    [{ 'POST /api/llm/travel-packages/details': { status: 500, body: {} } }],
    [{ 'POST /api/llm/travel-packages/details': { is_fallback_data: true }, 'POST /api/llm/travel-packages/search': { status: 500, body: {} } }],
    [{ 'POST /api/llm/travel-packages/details': { is_fallback_data: true }, 'POST /api/llm/travel-packages/search': { travelPackages: [{ ...pkg, id: 'other' }] } }],
    [{ 'POST /api/llm/travel-packages/details': {} }],
  ])('load problems show an error with a way back (%#)', async (routes) => {
    await open(routes)
    expect(await screen.findByRole('link', { name: /Back to Travel Packages/ })).toHaveAttribute('href', '/bookings/travel')
  })

  test('booking problems are shown', async () => {
    await open({ 'POST /api/llm/travel-packages/details': { travelPackage: pkg }, 'POST /api/bookings/create-travel-booking': { status: 400, body: { error: 'Missing required booking information' } } })
    await screen.findByRole('heading', { level: 1, name: 'Bali Bliss' })
    fireEvent.submit(screen.getByLabelText(/Travel Date/).closest('form'))
    expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Travel Date/), { target: { value: '2030-01-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Missing required booking information')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/create-travel-booking': { status: 500, body: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Failed to create booking')).toBeInTheDocument()
    localStorage.removeItem('token')
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(await screen.findByText('Authentication token not found')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Number of Participants/), { target: { value: '0' } })
  })

  test('signed out renders nothing; a missing token is an error', async () => {
    const { container } = renderWithAuth(<TravelPackageDetailPage params={{ id: 'p1' }} />)
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
    expect(container).toBeEmptyDOMElement()
    signInThenLoseToken()
    renderWithAuth(<TravelPackageDetailPage params={{ id: 'p1' }} />)
    expect(await screen.findByText('Failed to load travel package details. Please try again.')).toBeInTheDocument()
  })

  // FINDING: the search page never caches its results, so the detail page re-runs the AI
  // search to find the package by id. Real AI answers make up new ids each time, so with a
  // Gemini key every package shows "not found" (only the fixed sample ids work).
  knownBug('opens a package found by an AI search with changing ids', async () => {
    let n = 0
    await open({
      'POST /api/llm/travel-packages/details': { is_fallback_data: true, travelPackage: null },
      'POST /api/llm/travel-packages/search': () => ({ travelPackages: [{ ...pkg, id: `ai-${++n}` }] }),
    })
    // The user clicked the package with id p1 from the first search; the second search has new ids.
    expect(await screen.findByRole('heading', { level: 1, name: 'Bali Bliss' })).toBeInTheDocument()
  })
})

describe('/bookings/details/[id]', () => {
  const booking = {
    id: 'b1',
    booking_type: 'hotel',
    booking_status: 'confirmed',
    total_price: 300,
    check_in_date: '2026-11-01',
    check_out_date: '2026-11-03',
    guests: 2,
    created_at: '2026-10-01',
    special_requests: 'Late check-in',
    hotels: { name: 'Sea View', location: 'Goa', images: [] },
    room_types: { name: 'Deluxe', description: 'Big room', amenities: ['AC'] },
  }

  test('shows a booking and cancels it after confirmation', async () => {
    signIn()
    mockFetch({ 'GET /api/bookings/details/b1': { booking }, 'PUT /api/bookings/cancel/b1': { booking: { ...booking, booking_status: 'cancelled' } } })
    vi.stubGlobal('print', vi.fn())
    renderWithAuth(<BookingDetailsPage params={{ id: 'b1' }} />)
    expect(await screen.findByRole('heading', { name: 'Sea View' })).toBeInTheDocument()
    expect(screen.getByText('November 1, 2026 - November 3, 2026')).toBeInTheDocument()
    expect(screen.getByText('$300.00')).toBeInTheDocument()
    expect(screen.getByText('Late check-in')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(window.print).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /Cancel Booking/ }))
    fireEvent.click(screen.getByRole('button', { name: 'No, Keep Booking' }))
    fireEvent.click(screen.getByRole('button', { name: /Cancel Booking/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Cancel Booking' }))
    expect(await screen.findByText('Cancelled')).toBeInTheDocument()
  })

  test('travel bookings, failed cancels, load errors and odd dates', async () => {
    signIn()
    const trip = { ...booking, booking_type: 'travel', booking_status: 'pending', travel_date: 'not a date', participants: 1, travel_packages: { name: 'Bali', destination: 'Indonesia', duration: 7, included_services: ['Hotel'] } }
    mockFetch({ 'GET /api/bookings/details/b1': { booking: trip }, 'PUT /api/bookings/cancel/b1': { status: 400, body: { error: 'Booking is already cancelled' } } })
    const { unmount } = renderWithAuth(<BookingDetailsPage params={{ id: 'b1' }} />)
    expect(await screen.findByText('7 days')).toBeInTheDocument()
    expect(screen.getByText('not a date')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Cancel Booking/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Cancel Booking' }))
    expect(await screen.findByText('Booking is already cancelled')).toBeInTheDocument()
    unmount()
    mockFetch({ 'GET /api/bookings/details/b1': { booking: { ...trip, booking_status: 'weird' } }, 'PUT /api/bookings/cancel/b1': { status: 500, body: {} } })
    renderWithAuth(<BookingDetailsPage params={{ id: 'b1' }} />)
    await screen.findByText('Weird')
  })

  test('a failed load shows an error; signed out redirects', async () => {
    signIn()
    mockFetch({ 'GET /api/bookings/details/b1': { status: 401, body: {} } })
    renderWithAuth(<BookingDetailsPage params={{ id: 'b1' }} />)
    expect(await screen.findByText('Failed to load booking details. Please try again.')).toBeInTheDocument()
  })

  // FINDING: the page calls /api/bookings/details/[id] and /api/bookings/cancel/[id] without the
  // Authorization header those routes require, so it always shows "Failed to load booking
  // details" (and cancelling from it can never work).
  knownBug('sends the login token when loading the booking', async () => {
    signIn()
    const fetchMock = mockFetch({ 'GET /api/bookings/details/b1': { booking } })
    renderWithAuth(<BookingDetailsPage params={{ id: 'b1' }} />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock.mock.calls[0][1]?.headers?.Authorization).toBe('Bearer tok-1')
  })
})

describe('my bookings pages', () => {
  const list = [
    { id: 'aaaaaaaa-1', booking_type: 'hotel', booking_status: 'confirmed', check_in_date: '2026-12-01', check_out_date: '2026-12-03', guests: 2, total_price: 100, created_at: '2026-10-01', hotels: { name: 'Sea View', location: 'Goa' } },
    { id: 'bbbbbbbb-2', booking_type: 'travel', booking_status: 'pending', travel_date: '2026-11-01', participants: 3, total_price: 0, created_at: '2026-10-02', travel_packages: { name: 'Bali', destination: 'Indonesia' } },
    { id: 'cccccccc-3', booking_type: 'hotel', booking_status: 'cancelled', check_in_date: '2025-01-01', check_out_date: '2025-01-02', total_price: 50, created_at: '2024-12-01', hotels: null },
    { id: 'dddddddd-4', booking_type: 'travel', booking_status: 'completed', travel_date: '2025-06-01', total_price: 70, created_at: '2025-05-01' },
    { id: 'eeeeeeee-5', booking_type: 'travel', booking_status: 'odd', created_at: '2025-05-01' },
  ]

  test('/bookings/my-bookings groups upcoming and past, and filters', async () => {
    signIn()
    const fetchMock = mockFetch({ '/api/bookings/user-bookings': { bookings: list } })
    renderWithAuth(<MyBookingsByType />)
    expect(await screen.findByText('Upcoming Bookings')).toBeInTheDocument()
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok-1')
    expect(screen.getByText('Past Bookings')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Show Filters/ }))
    fireEvent.change(screen.getByLabelText('Booking Type'), { target: { value: 'hotel' } })
    fireEvent.change(screen.getByLabelText('Booking Status'), { target: { value: 'pending' } })
    expect(screen.getByText('Try adjusting your filters to see all your bookings.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Browse Hotels' }))
    fireEvent.click(screen.getByRole('button', { name: 'Explore Travel Packages' }))
    expect(router.push.mock.calls.map((c) => c[0])).toEqual(['/bookings/hotel', '/bookings/travel'])
    fireEvent.click(screen.getByRole('button', { name: /Hide Filters/ }))
  })

  test('/bookings/my-bookings: empty, failing, no token, signed out', async () => {
    signIn()
    mockFetch({ '/api/bookings/user-bookings': {} })
    const a = renderWithAuth(<MyBookingsByType />)
    expect(await screen.findByText(/You haven't made any bookings yet/)).toBeInTheDocument()
    a.unmount()
    mockFetch({ '/api/bookings/user-bookings': { status: 500, body: {} } })
    const b = renderWithAuth(<MyBookingsByType />)
    expect(await screen.findByText('Failed to load your bookings. Please try again.')).toBeInTheDocument()
    b.unmount()
    signInThenLoseToken()
    renderWithAuth(<MyBookingsByType />)
    expect(await screen.findByText('Failed to load your bookings. Please try again.')).toBeInTheDocument()
  })

  test('/my-bookings lists every booking with status, reference and price', async () => {
    signIn()
    mockFetch({ '/api/bookings/user-bookings': { bookings: list } })
    renderWithAuth(<MyBookingsPage />)
    expect(await screen.findByText('Sea View')).toBeInTheDocument()
    expect(screen.getByText('AAAAAAAA')).toBeInTheDocument()
    expect(screen.getByText('December 1, 2026 - December 3, 2026')).toBeInTheDocument()
    for (const s of ['Confirmed', 'Pending', 'Cancelled', 'Completed', 'odd']) expect(screen.getByText(s)).toBeInTheDocument()
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0)
  })

  test('/my-bookings: empty, errors, no token, signed out', async () => {
    signIn()
    mockFetch({ '/api/bookings/user-bookings': {} })
    const a = renderWithAuth(<MyBookingsPage />)
    expect(await screen.findByText('No bookings found')).toBeInTheDocument()
    a.unmount()
    mockFetch({ '/api/bookings/user-bookings': { status: 500, body: {} } })
    const b = renderWithAuth(<MyBookingsPage />)
    expect(await screen.findByText('Failed to fetch bookings')).toBeInTheDocument()
    b.unmount()
    mockFetch({ '/api/bookings/user-bookings': new Error('') })
    const c = renderWithAuth(<MyBookingsPage />)
    expect(await screen.findByText('Failed to load bookings. Please try again.')).toBeInTheDocument()
    c.unmount()
    signInThenLoseToken()
    const d = renderWithAuth(<MyBookingsPage />)
    expect(await screen.findByText('Authentication token not found')).toBeInTheDocument()
    d.unmount()
    vi.restoreAllMocks()
    localStorage.clear()
    renderWithAuth(<MyBookingsPage />)
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/login'))
  })

  // FINDING: /my-bookings (where both booking pages send you) only reads the old joined
  // `hotels` / `travel_packages` fields, so every booking made through the site is listed as
  // "Hotel Booking" / "Travel Package" with location "N/A".
  knownBug('/my-bookings shows the names the bookings API provides', async () => {
    signIn()
    mockFetch({ '/api/bookings/user-bookings': { bookings: [{ id: 'xxxxxxxx', booking_type: 'hotel', booking_status: 'confirmed', name: 'Sea View', location: 'Goa' }] } })
    renderWithAuth(<MyBookingsPage />)
    expect(await screen.findByText('Sea View')).toBeInTheDocument()
  })
})

describe('booking cards', () => {
  test('BookingCard reads both storage formats', () => {
    const { rerender } = render(<BookingCard booking={{ booking_type: 'hotel', booking_status: 'confirmed', hotel_details: JSON.stringify({ hotel_name: 'Sea View', hotel_location: 'Goa', room_type: 'Deluxe' }), check_in_date: '2026-11-01', check_out_date: '2026-11-03', guests: 2, total_price: 100, created_at: '2026-10-01' }} />)
    expect(screen.getByRole('heading', { name: 'Sea View' })).toBeInTheDocument()
    expect(screen.getByText('Nov 01, 2026')).toBeInTheDocument()
    expect(screen.getByText(inr(100))).toBeInTheDocument()
    fireEvent.error(screen.getByRole('img'))
    rerender(<BookingCard booking={{ booking_type: 'hotel', booking_status: 'cancelled', hotel_details: '{bad', hotels: { name: 'Palace', images: ['/p.jpg'], location: 'Jaipur' }, room_types: { name: 'Suite' } }} />)
    expect(screen.getByRole('heading', { name: 'Palace' })).toBeInTheDocument()
    rerender(<BookingCard booking={{ booking_type: 'hotel', booking_status: 'completed', hotel_details: {} }} />)
    expect(screen.getByRole('heading', { name: 'Hotel Booking' })).toBeInTheDocument()
    rerender(<BookingCard booking={{ booking_type: 'travel', booking_status: 'pending', travel_packages: { name: 'Bali', destination: 'Indonesia' } }} />)
    expect(screen.getByRole('heading', { name: 'Bali' })).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
    rerender(<BookingCard booking={{ booking_type: 'travel', booking_status: 'x' }} />)
    expect(screen.getByRole('heading', { name: 'Travel Package' })).toBeInTheDocument()
    rerender(<BookingCard booking={{ booking_type: 'hotel', booking_status: 'pending' }} />)
  })

  // FINDING: the hotel page saves hotel_details as { name, location, ... }, but BookingCard and
  // the bookings API read hotel_name / hotel_location — booked hotels show as "Hotel Booking".
  knownBug('a booking made on the hotel page shows the hotel name', () => {
    render(<BookingCard booking={{ booking_type: 'hotel', booking_status: 'confirmed', hotel_details: JSON.stringify({ id: 'h1', name: 'Sea View', location: 'Goa' }) }} />)
    expect(screen.getByRole('heading', { name: 'Sea View' })).toBeInTheDocument()
  })

  test('HotelCard and TravelPackageCard (unused) show the essentials and open the details', () => {
    render(<HotelCard hotel={hotel} />)
    expect(screen.getByText('+1 more')).toBeInTheDocument()
    expect(screen.getByText(inr(100))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('heading', { name: 'Sea View' }))
    expect(router.push).toHaveBeenCalledWith('/bookings/hotel/h1')
    render(<HotelCard hotel={{ ...hotel, id: 'h3', name: 'Bare', images: [], amenities: ['Parking'], price_per_night: 0 }} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()

    render(<TravelPackageCard travelPackage={{ ...pkg, includes: ['a', 'b', 'c', 'd'], excludes: ['x', 'y', 'z'], duration_days: 7 }} />)
    expect(screen.getByText('+1 more inclusions')).toBeInTheDocument()
    expect(screen.getByText('And 1 other exclusions')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('heading', { name: 'Bali Bliss' }))
    expect(router.push).toHaveBeenLastCalledWith('/bookings/travel/p1')
    render(<TravelPackageCard travelPackage={{ ...pkg, id: 'p9', name: 'Cheap', images: [], includes: [], excludes: [], price: 0 }} />)
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0)
  })
})

describe('/admin/bookings', () => {
  test('asks visitors to log in', async () => {
    renderWithAuth(<AdminBookingsPage />)
    expect(await screen.findByRole('heading', { name: 'Admin Access Required' })).toBeInTheDocument()
  })

  test('generates test data and reports the result or the error', async () => {
    signIn()
    mockFetch({ 'POST /api/bookings/seed': { bookings: { hotelBookings: [1, 2, 3], travelBookings: [1, 2] } } })
    renderWithAuth(<AdminBookingsPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Generate Test Booking Data' }))
    expect(await screen.findByText('Created 3 hotel bookings and 2 travel bookings.')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/seed': { bookings: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate Test Booking Data' }))
    expect(await screen.findByText('Created 0 hotel bookings and 0 travel bookings.')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/seed': { status: 401, body: { error: 'Unauthorized' } } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate Test Booking Data' }))
    expect(await screen.findByText('Unauthorized')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/seed': { status: 500, body: {} } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate Test Booking Data' }))
    expect(await screen.findByText('Failed to generate test data')).toBeInTheDocument()
    mockFetch({ 'POST /api/bookings/seed': new Error('') })
    fireEvent.click(screen.getByRole('button', { name: 'Generate Test Booking Data' }))
    expect(await screen.findByText('An unexpected error occurred')).toBeInTheDocument()
  })
})
