import { describe, test, expect, vi } from 'vitest'
import { db } from '../setup/server.js'
import { request, read, tokenFor, params } from '../support/requests.js'
import { knownBug } from '../support/known-bug.js'
import { POST as create } from '@/app/api/bookings/create/route'
import { POST as createHotel } from '@/app/api/bookings/create-hotel-booking/route'
import { POST as createTravel } from '@/app/api/bookings/create-travel-booking/route'
import { PUT as cancel } from '@/app/api/bookings/cancel/[id]/route'
import { GET as details } from '@/app/api/bookings/details/[id]/route'
import { GET as userBookings } from '@/app/api/bookings/user/route'
import { GET as myBookings } from '@/app/api/bookings/user-bookings/route'

const asha = { id: 'user-1', email: 'asha@example.com' }
const ravi = { id: 'user-2', email: 'ravi@example.com' }
const post = (handler, body, user = asha) => handler(request('/x', { method: 'POST', body, token: user && tokenFor(user) }))

describe('the bearer-token check shared by the booking routes', () => {
  test.each([
    ['create', () => create(request('/x', { method: 'POST', body: {} }))],
    ['cancel', () => cancel(request('/x', { method: 'PUT' }), params({ id: 'b1' }))],
    ['details', () => details(request('/x'), params({ id: 'b1' }))],
    ['user-bookings', () => myBookings(request('/x'))],
  ])('%s: no token 401, bad token 401', async (_name, call) => {
    expect(await read(await call())).toEqual({ status: 401, body: { error: 'Unauthorized: No valid token provided' } })
  })

  test.each([
    ['create', (t) => create(request('/x', { method: 'POST', body: {}, token: t }))],
    ['cancel', (t) => cancel(request('/x', { method: 'PUT', token: t }), params({ id: 'b1' }))],
    ['details', (t) => details(request('/x', { token: t }), params({ id: 'b1' }))],
    ['user-bookings', (t) => myBookings(request('/x', { token: t }))],
  ])('%s: an invalid token is refused', async (_name, call) => {
    expect(await read(await call('forged'))).toEqual({ status: 401, body: { error: 'Unauthorized: Invalid token' } })
  })
})

describe('POST /api/bookings/create', () => {
  test('a hotel booking is saved for the signed-in user', async () => {
    const { status, body } = await read(
      await post(create, { booking_type: 'hotel', hotel_id: 1, room_type_id: 101, check_in_date: '2026-11-01', check_out_date: '2026-11-03', guests: 2, total_price: 700 })
    )
    expect(status).toBe(200)
    expect(body.booking).toMatchObject({ user_id: 'user-1', booking_type: 'hotel', booking_status: 'confirmed', hotel_id: 1, guests: 2, special_requests: '' })
    expect(body.booking).not.toHaveProperty('travel_package_id')
  })

  test('a travel booking keeps travel fields only', async () => {
    const { body } = await read(await post(create, { booking_type: 'travel', travel_package_id: 3, travel_date: '2026-12-01', participants: 2, total_price: 900, special_requests: 'veg' }))
    expect(body.booking).toMatchObject({ booking_type: 'travel', travel_package_id: 3, participants: 2, special_requests: 'veg' })
    expect(body.booking).not.toHaveProperty('hotel_id')
  })

  test('refuses an unknown booking type and reports failures', async () => {
    expect(await read(await post(create, { booking_type: 'car' }))).toEqual({ status: 400, body: { error: 'Invalid booking type' } })
    db.failNext('bookings')
    expect(await read(await post(create, { booking_type: 'hotel' }))).toEqual({ status: 500, body: { error: 'Failed to create booking' } })
    expect((await create(request('/x', { method: 'POST', body: '{', token: tokenFor(asha) }))).status).toBe(500)
  })

  // FINDING: the price and status come from the browser: a booking can be made for any price
  // (here ₹1 for a ₹700 stay) and created as "completed".
  knownBug('the server sets the price and status, not the client', async () => {
    const { body } = await read(await post(create, { booking_type: 'hotel', hotel_id: 1, room_type_id: 101, guests: 2, total_price: 1, booking_status: 'completed' }))
    expect(body.booking.total_price).not.toBe(1)
    expect(body.booking.booking_status).toBe('confirmed')
  })
})

describe('POST /api/bookings/create-hotel-booking', () => {
  const stay = { check_in_date: '2026-11-01', check_out_date: '2026-11-03', guests: 2, total_price: 7000, hotel_id: 'h1', hotel_name: 'Sea View', hotel_location: 'Goa', room_type: 'Deluxe' }

  test('saves the stay with hotel details as JSON and emails a confirmation', async () => {
    const { status, body } = await read(await post(createHotel, stay))
    expect(status).toBe(200)
    expect(body.booking).toMatchObject({ user_id: 'user-1', booking_type: 'hotel', booking_status: 'confirmed', travel_date: '2026-11-01', participants: '[]', total_price: 7000 })
    expect(JSON.parse(body.booking.hotel_details)).toEqual({ hotel_id: 'h1', hotel_name: 'Sea View', hotel_location: 'Goa', room_type: 'Deluxe' })
    const [mail] = globalThis.__sendMail.mock.calls[0]
    expect(mail).toMatchObject({ to: 'asha@example.com', subject: 'Your Hotel Booking Confirmation - TripSage' })
    expect(mail.html).toContain('Sea View')
    expect(mail.html).toContain('₹7,000')
  })

  test('uses given hotel_details as is, and defaults for missing names', async () => {
    const given = await read(await post(createHotel, { ...stay, hotel_details: { hotel_name: 'Given' } }))
    expect(JSON.parse(given.body.booking.hotel_details)).toEqual({ hotel_name: 'Given' })
    const bare = await read(await post(createHotel, { check_in_date: 'a', check_out_date: 'b', guests: 1, total_price: 1, room_type_id: 'r9' }))
    expect(JSON.parse(bare.body.booking.hotel_details)).toEqual({ hotel_name: 'Unknown Hotel', hotel_location: 'Unknown Location', room_type: 'r9' })
  })

  test('still succeeds when the email fails', async () => {
    globalThis.__sendMail.mockRejectedValue(new Error('smtp down'))
    expect((await post(createHotel, stay)).status).toBe(200)
  })

  test('needs a login, the required fields, and reports failures', async () => {
    expect((await post(createHotel, stay, null)).status).toBe(401)
    expect(await read(await post(createHotel, { ...stay, guests: undefined }))).toEqual({ status: 400, body: { error: 'Missing required booking information' } })
    db.failNext('bookings', { message: 'insert failed' })
    expect(await read(await post(createHotel, stay))).toEqual({ status: 500, body: { error: 'Failed to create booking: insert failed' } })
    expect((await createHotel(request('/x', { method: 'POST', body: '{', token: tokenFor(asha) }))).status).toBe(500)
  })

  // FINDING: names, places and special requests are put into the confirmation email's HTML
  // as they are, so a booking can inject links or markup into an email sent from TripSage.
  knownBug('text in the confirmation email is escaped', async () => {
    await post(createHotel, { ...stay, special_requests: '<a href="https://evil.example">Verify your card</a>' })
    const [mail] = globalThis.__sendMail.mock.calls[0]
    expect(mail.html).not.toContain('<a href="https://evil.example">')
  })
})

describe('POST /api/bookings/create-travel-booking', () => {
  const trip = { travel_date: '2026-12-01', participants: [{ name: 'Asha', age: 30 }], total_price: 12000, travel_package_id: 't1', package_name: 'Kerala Backwaters', destination: 'Kerala', duration: '5 days', package_type: 'Premium' }

  test('saves the trip with package details as JSON and emails a confirmation', async () => {
    const { status, body } = await read(await post(createTravel, trip))
    expect(status).toBe(200)
    expect(body.booking).toMatchObject({ booking_type: 'travel', guests: 1, booking_status: 'confirmed', total_price: 12000 })
    expect(JSON.parse(body.booking.travel_details)).toEqual({ travel_package_id: 't1', package_name: 'Kerala Backwaters', destination: 'Kerala', duration: '5 days', package_type: 'Premium' })
    const [mail] = globalThis.__sendMail.mock.calls[0]
    expect(mail.subject).toBe('Your Travel Package Confirmation - TripSage')
    expect(mail.html).toContain('Kerala Backwaters')
    expect(mail.html).toContain('Asha')
  })

  test('fills defaults, survives an email failure, and checks input', async () => {
    globalThis.__sendMail.mockRejectedValue(new Error('smtp down'))
    const { body } = await read(await post(createTravel, { travel_date: 'd', participants: [], total_price: 1, guests: 3 }))
    expect(JSON.parse(body.booking.travel_details)).toMatchObject({ package_name: 'Unknown Package', destination: 'Unknown Destination', duration: 'N/A', package_type: 'Standard Package' })
    expect(body.booking.guests).toBe(3)
    expect((await post(createTravel, { travel_date: 'd' })).status).toBe(400)
    expect((await post(createTravel, trip, null)).status).toBe(401)
    db.failNext('bookings', { message: 'insert failed' })
    expect((await read(await post(createTravel, trip))).body.error).toBe('Failed to create booking: insert failed')
    expect((await createTravel(request('/x', { method: 'POST', body: '{', token: tokenFor(asha) }))).status).toBe(500)
  })
})

describe('cancel and details', () => {
  const seed = () =>
    db.seed({
      bookings: [
        { id: 'b1', user_id: 'user-1', booking_type: 'hotel', booking_status: 'confirmed', hotel_id: 'h1', room_type_id: 'r1' },
        { id: 'b2', user_id: 'user-2', booking_type: 'travel', booking_status: 'confirmed', travel_package_id: 't1' },
        { id: 'b3', user_id: 'user-1', booking_type: 'hotel', booking_status: 'cancelled' },
      ],
      hotels: [{ id: 'h1', name: 'Sea View' }],
      room_types: [{ id: 'r1', name: 'Deluxe' }],
      travel_packages: [{ id: 't1', name: 'Kerala' }],
    })
  const cancelAs = (id, user = asha) => cancel(request('/x', { method: 'PUT', token: tokenFor(user) }), params({ id }))

  test('I can cancel my booking once', async () => {
    seed()
    expect(await read(await cancelAs('b1'))).toMatchObject({ status: 200, body: { message: 'Booking cancelled successfully', booking: { id: 'b1', booking_status: 'cancelled' } } })
    expect(await read(await cancelAs('b1'))).toEqual({ status: 400, body: { error: 'Booking is already cancelled' } })
  })

  test("I cannot cancel someone else's booking", async () => {
    seed()
    expect(await read(await cancelAs('b2'))).toEqual({ status: 404, body: { error: 'Booking not found or access denied' } })
    expect(db.tables.bookings[1].booking_status).toBe('confirmed')
  })

  test('cancel reports update failures and unexpected errors', async () => {
    seed()
    const original = db.from.bind(db)
    vi.spyOn(db, 'from').mockImplementation((t) => {
      if (db.queries.length === 1) db.failNext('bookings')
      return original(t)
    })
    expect(await read(await cancelAs('b1'))).toEqual({ status: 500, body: { error: 'Failed to cancel booking' } })
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(db, 'from').mockImplementation(() => { throw new Error('boom') })
    expect((await cancelAs('b1')).status).toBe(500)
  })

  test('details include the joined hotel, room and package, for my bookings only', async () => {
    seed()
    const { status, body } = await read(await details(request('/x', { token: tokenFor(asha) }), params({ id: 'b1' })))
    expect(status).toBe(200)
    expect(body.booking).toMatchObject({ id: 'b1', hotels: { name: 'Sea View' }, room_types: { name: 'Deluxe' }, travel_packages: null })
    expect((await details(request('/x', { token: tokenFor(asha) }), params({ id: 'b2' }))).status).toBe(404)
    vi.spyOn(db, 'from').mockImplementation(() => { throw new Error('boom') })
    expect((await details(request('/x', { token: tokenFor(asha) }), params({ id: 'b1' }))).status).toBe(500)
  })
})

describe('listing my bookings', () => {
  const seed = () =>
    db.seed({
      bookings: [
        { id: 'old', user_id: 'user-1', booking_type: 'hotel', created_at: '2025-01-01', hotel_id: 'h1', room_type_id: 'r1' },
        { id: 'new', user_id: 'user-1', booking_type: 'travel', created_at: '2025-06-01', travel_package_id: 't1' },
        { id: 'json-hotel', user_id: 'user-1', booking_type: 'hotel', created_at: '2025-03-01', hotel_details: JSON.stringify({ hotel_name: 'Sea View', hotel_location: 'Goa', room_type: 'Deluxe' }) },
        { id: 'json-trip', user_id: 'user-1', booking_type: 'travel', created_at: '2025-04-01', travel_details: JSON.stringify({ package_name: 'Kerala', destination: 'Kochi', duration: '5 days' }) },
        { id: 'bad-hotel', user_id: 'user-1', booking_type: 'hotel', created_at: '2025-02-01', hotel_details: '{oops' },
        { id: 'bad-trip', user_id: 'user-1', booking_type: 'travel', created_at: '2025-02-02', travel_details: '{oops' },
        { id: 'bare-hotel', user_id: 'user-1', booking_type: 'hotel', created_at: '2024-01-01' },
        { id: 'bare-trip', user_id: 'user-1', booking_type: 'travel', created_at: '2024-01-02' },
        { id: 'theirs', user_id: 'user-2', booking_type: 'hotel', created_at: '2025-07-01' },
      ],
      hotels: [{ id: 'h1', name: 'Palace', location: 'Jaipur', images: ['p.jpg'] }],
      room_types: [{ id: 'r1', name: 'Suite', price_per_night: 900 }],
      travel_packages: [{ id: 't1', name: 'Alps', destination: 'Swiss', images: [], duration: 7 }],
    })

  test('/api/bookings/user-bookings: mine only, newest first, with display fields from either format', async () => {
    seed()
    const { status, body } = await read(await myBookings(request('/x', { token: tokenFor(asha) })))
    expect(status).toBe(200)
    const byId = Object.fromEntries(body.bookings.map((b) => [b.id, b]))
    expect(body.bookings.map((b) => b.id)).toEqual(['new', 'json-trip', 'json-hotel', 'bad-trip', 'bad-hotel', 'old', 'bare-trip', 'bare-hotel'])
    expect(byId['json-hotel']).toMatchObject({ name: 'Sea View', location: 'Goa', room_name: 'Deluxe', image: null })
    expect(byId['json-trip']).toMatchObject({ name: 'Kerala', location: 'Kochi', duration: '5 days', image: null })
    expect(byId.old).toMatchObject({ name: 'Palace', location: 'Jaipur', image: 'p.jpg', room_name: 'Suite', price_per_night: 900 })
    expect(byId.new).toMatchObject({ name: 'Alps', location: 'Swiss', image: null, duration: 7 })
    expect(byId['bad-hotel']).toMatchObject({ name: 'Unknown Hotel', location: 'Unknown Location' })
    expect(byId['bad-trip']).toMatchObject({ name: 'Unknown Travel Package', location: 'Unknown Destination' })
    expect(byId['bare-hotel']).toMatchObject({ name: 'Hotel Booking', location: 'Location not available' })
    expect(byId['bare-trip']).toMatchObject({ name: 'Travel Package', location: 'Destination not available' })
  })

  test('/api/bookings/user-bookings reports failures', async () => {
    db.failNext('bookings')
    expect(await read(await myBookings(request('/x', { token: tokenFor(asha) })))).toEqual({ status: 500, body: { error: 'Failed to fetch bookings' } })
    vi.spyOn(db, 'from').mockImplementation(() => { throw new Error('boom') })
    expect((await myBookings(request('/x', { token: tokenFor(asha) }))).status).toBe(500)
  })

  test('/api/bookings/user: hotel and travel bookings together, newest first', async () => {
    seed()
    const { status, body } = await read(await userBookings(request('/x', { token: tokenFor(asha) })))
    expect(status).toBe(200)
    expect(body.bookings[0].id).toBe('new')
    expect(body.bookings.find((b) => b.id === 'old').hotels).toMatchObject({ name: 'Palace' })
    expect(body.bookings.some((b) => b.id === 'theirs')).toBe(false)
  })

  test('/api/bookings/user: login and failures', async () => {
    expect((await userBookings(request('/x'))).status).toBe(401)
    db.failNext('bookings')
    expect((await read(await userBookings(request('/x', { token: tokenFor(asha) })))).body.error).toBe('Failed to fetch bookings')
    const original = db.from.bind(db)
    vi.spyOn(db, 'from').mockImplementation((t) => {
      if (db.queries.length === 1) db.failNext('bookings')
      return original(t)
    })
    db.queries.length = 0
    expect((await userBookings(request('/x', { token: tokenFor(asha) }))).status).toBe(500)
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(db, 'from').mockImplementation(() => { throw new Error('boom') })
    expect((await read(await userBookings(request('/x', { token: tokenFor(asha) })))).body.error).toBe('Internal server error')
  })
})
