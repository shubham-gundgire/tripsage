import { describe, test, expect, vi } from 'vitest'
import { db } from '../setup/server.js'
import { request, read, tokenFor, params } from '../support/requests.js'
import { GET as hotels } from '@/app/api/bookings/hotels/route'
import { GET as hotel } from '@/app/api/bookings/hotels/[id]/route'
import { GET as packages } from '@/app/api/bookings/travel-packages/route'
import { GET as travelPackage } from '@/app/api/bookings/travel-packages/[id]/route'
import { GET as travel } from '@/app/api/bookings/travel/route'
import { GET as travelOne } from '@/app/api/bookings/travel/[id]/route'
import { POST as seed } from '@/app/api/bookings/seed/route'

const token = tokenFor({ id: 'user-1', email: 'asha@example.com' })
const get = (handler, path, context) => handler(request(path, { token }), context)

describe('GET /api/bookings/hotels (built-in list)', () => {
  test('lists all five hotels to a signed-in user', async () => {
    const { status, body } = await read(await get(hotels, '/api/bookings/hotels'))
    expect(status).toBe(200)
    expect(body.hotels.map((h) => h.name)).toEqual(['Luxury Palace Hotel', 'Seaside Resort & Spa', 'Mountain View Lodge', 'Urban Boutique Hotel', 'Historic Grand Hotel'])
  })

  test('filters by location, effective price and rating', async () => {
    const names = async (q) => (await read(await get(hotels, `/api/bookings/hotels?${q}`))).body.hotels.map((h) => h.id)
    expect(await names('location=miami')).toEqual([2])
    // The discounted price counts when there is one (Luxury Palace: 295, not 350).
    expect(await names('min_price=280')).toEqual([1])
    expect(await names('max_price=200')).toEqual([3])
    expect(await names('min_rating=4.7')).toEqual([1, 5])
    expect(await names('min_price=abc&max_price=xyz&min_rating=nan')).toHaveLength(5)
  })

  test('needs a valid token', async () => {
    expect((await hotels(request('/x'))).status).toBe(401)
    expect((await hotels(request('/x', { token: 'forged' }))).status).toBe(401)
  })

  test('an unexpected error answers 500', async () => {
    const req = request('/x', { token })
    expect((await hotels({ headers: req.headers, url: 'not a url' })).status).toBe(500)
  })
})

describe('GET /api/bookings/hotels/[id]', () => {
  test('returns a hotel with its room types', async () => {
    const { status, body } = await read(await get(hotel, '/x', params({ id: '5' })))
    expect(status).toBe(200)
    expect(body.hotel.name).toBe('Historic Grand Hotel')
    expect(body.roomTypes.map((r) => r.name)).toEqual(['Classic Room', 'Heritage Suite', 'Presidential Suite'])
  })

  test('404 for an unknown hotel; 401 without a valid token', async () => {
    expect(await read(await get(hotel, '/x', params({ id: '99' })))).toEqual({ status: 404, body: { error: 'Hotel not found' } })
    expect((await hotel(request('/x'), params({ id: '1' }))).status).toBe(401)
    expect((await hotel(request('/x', { token: 'forged' }), params({ id: '1' }))).status).toBe(401)
  })

  test('an unexpected error answers 500', async () => {
    vi.spyOn(Array.prototype, 'find').mockImplementationOnce(() => { throw new Error('boom') })
    expect((await read(await get(hotel, '/x', params({ id: '1' })))).body.error).toBe('An unexpected error occurred: boom')
  })
})

describe('GET /api/bookings/travel-packages (built-in list)', () => {
  const ids = async (q) => (await read(await get(packages, `/x?${q}`))).body.travelPackages.map((p) => p.id)

  test('lists all five packages, and filters by destination and effective price', async () => {
    expect(await ids('')).toEqual([1, 2, 3, 4, 5])
    expect(await ids('destination=japan')).toEqual([3])
    expect(await ids('min_price=3000')).toEqual([4])
    expect(await ids('max_price=2000')).toEqual([1])
    expect(await ids('min_price=x&max_price=y')).toHaveLength(5)
  })

  test('filters by duration range, "15+" and exact days', async () => {
    expect(await ids('duration=7-8')).toEqual([1, 4])
    expect(await ids('duration=12%2B')).toEqual([3, 5])
    expect(await ids('duration=10')).toEqual([2])
    expect(await ids('duration=soon')).toHaveLength(5)
  })

  test('needs a valid token; unexpected errors answer 500', async () => {
    expect((await packages(request('/x'))).status).toBe(401)
    expect((await packages(request('/x', { token: 'forged' }))).status).toBe(401)
    const req = request('/x', { token })
    expect((await packages({ headers: req.headers, url: 'not a url' })).status).toBe(500)
  })
})

describe('GET /api/bookings/travel-packages/[id]', () => {
  test('returns a package with its day-by-day itinerary', async () => {
    const { body } = await read(await get(travelPackage, '/x', params({ id: '2' })))
    expect(body.travelPackage.destination).toBe('Switzerland')
    expect(body.travelPackage.detailed_itinerary).toHaveLength(10)
  })

  test('404 unknown; 401 without a valid token; 500 unexpected', async () => {
    expect((await get(travelPackage, '/x', params({ id: '42' }))).status).toBe(404)
    expect((await travelPackage(request('/x'), params({ id: '1' }))).status).toBe(401)
    expect((await travelPackage(request('/x', { token: 'forged' }), params({ id: '1' }))).status).toBe(401)
    vi.spyOn(Array.prototype, 'find').mockImplementationOnce(() => { throw new Error('boom') })
    expect((await get(travelPackage, '/x', params({ id: '1' }))).status).toBe(500)
  })
})

describe('GET /api/bookings/travel and /travel/[id] (database)', () => {
  const seedPackages = () =>
    db.seed({
      travel_packages: [
        { id: 'p1', destination: 'Goa, India', price: 500, duration_days: 4 },
        { id: 'p2', destination: 'Kerala, India', price: 900, duration_days: 6 },
        { id: 'p3', destination: 'Paris, France', price: 2500, duration_days: 6 },
      ],
    })

  test('lists and filters packages without needing a login', async () => {
    seedPackages()
    const ids = async (q) => (await read(await travel(request(`/x?${q}`)))).body.packages.map((p) => p.id)
    expect(await ids('')).toEqual(['p1', 'p2', 'p3'])
    expect(await ids('destination=india')).toEqual(['p1', 'p2'])
    expect(await ids('minPrice=600&maxPrice=1000')).toEqual(['p2'])
    expect(await ids('duration=6')).toEqual(['p2', 'p3'])
  })

  test('list errors answer 500', async () => {
    db.failNext('travel_packages')
    expect(await read(await travel(request('/x')))).toEqual({ status: 500, body: { error: 'Failed to fetch travel packages' } })
    expect((await travel({ url: 'not a url' })).status).toBe(500)
  })

  test('one package by id', async () => {
    seedPackages()
    expect(await read(await travelOne(request('/x'), params({ id: 'p2' })))).toMatchObject({ status: 200, body: { package: { destination: 'Kerala, India' } } })
    expect(await read(await travelOne(request('/x'), params({ id: '' })))).toEqual({ status: 400, body: { error: 'Travel package ID is required' } })
    // .single() reports "no rows" as an error, so an unknown id is a 500 here.
    expect(await read(await travelOne(request('/x'), params({ id: 'nope' })))).toEqual({ status: 500, body: { error: 'Failed to fetch travel package details' } })
    const exploding = { params: { get id() { throw new Error('boom') } } }
    expect((await travelOne(request('/x'), exploding)).status).toBe(500)
  })
})

describe('POST /api/bookings/seed (development only)', () => {
  const session = { user: { id: 'supabase-user' } }

  test('needs a Supabase session, then refuses outside development', async () => {
    expect(await read(await seed(request('/x', { method: 'POST' })))).toEqual({ status: 401, body: { error: 'Unauthorized' } })
    db.auth.getSession.mockResolvedValue({ data: { session } })
    expect(await read(await seed(request('/x', { method: 'POST' })))).toEqual({ status: 403, body: { error: 'This endpoint is only available in development mode' } })
  })

  test('in development, creates three hotel and two package bookings priced from the data', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    db.auth.getSession.mockResolvedValue({ data: { session } })
    db.seed({
      hotels: [{ id: 'h1', name: 'A' }, { id: 'h2', name: 'B' }, { id: 'h3', name: 'C' }],
      room_types: [{ id: 'r1', hotel_id: 'h1', price_per_night: 100 }, { id: 'r2', hotel_id: 'h2', price_per_night: 200 }],
      travel_packages: [{ id: 'p1', price: 1000 }, { id: 'p2', price: 2000 }],
    })
    const { status, body } = await read(await seed(request('/x', { method: 'POST' })))

    expect(status).toBe(200)
    const [stay1, stay2, stay3] = body.bookings.hotelBookings
    expect(stay1).toMatchObject({ user_id: 'supabase-user', room_type_id: 'r1', total_price: 300, booking_status: 'confirmed' })
    expect(stay2).toMatchObject({ room_type_id: 'r2', total_price: 600, booking_status: 'completed' })
    // No room types for the third hotel: kept with its placeholder price.
    expect(stay3).toMatchObject({ room_type_id: null, total_price: 599.97, booking_status: 'cancelled' })
    expect(body.bookings.travelBookings.map((b) => b.total_price)).toEqual([2000, 6000])
  })

  test('reports missing data and database errors', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    db.auth.getSession.mockResolvedValue({ data: { session } })
    expect((await read(await seed(request('/x', { method: 'POST' })))).body.error).toBe('Failed to create sample bookings: No hotels found in the database')
    db.seed({ hotels: [{ id: 'h1' }, { id: 'h2' }, { id: 'h3' }] })
    expect((await read(await seed(request('/x', { method: 'POST' })))).body.error).toBe('Failed to create sample bookings: No travel packages found in the database')
  })
})
