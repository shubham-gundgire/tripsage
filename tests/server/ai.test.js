import { describe, test, expect, vi, beforeEach } from 'vitest'
import { db } from '../setup/server.js'
import { request, read, tokenFor, params } from '../support/requests.js'
import { knownBug } from '../support/known-bug.js'

// The Gemini SDK used by the hotel and package search: each test decides what it answers.
globalThis.__generate = vi.fn()
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: (...a) => globalThis.__generate(...a) }
    }
  },
}))

const token = tokenFor({ id: 'user-1', email: 'asha@example.com' })
const answer = (text) => ({ response: Promise.resolve({ text: () => text }) })
/** A Gemini REST reply, as fetch returns it. */
const geminiReply = (text, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  text: async () => text,
})

// Each route reads its API key when it loads, so load it fresh with the key set (or not).
async function load(path, env = {}) {
  vi.resetModules()
  for (const key of ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY']) vi.stubEnv(key, env[key] ?? '')
  return import(path)
}

beforeEach(() => {
  globalThis.__generate.mockReset()
})

describe('POST /api/llm/hotels/search', () => {
  const search = async (body, env) => (await load('@/app/api/llm/hotels/search/route', env)).POST(request('/x', { method: 'POST', body, token }))

  test('without an AI key: six sample hotels around the requested price', async () => {
    const { status, body } = await read(await search({ location: 'Goa', minPrice: 200, maxPrice: 600 }))
    expect(status).toBe(200)
    expect(body.is_fallback_data).toBe(true)
    expect(body.hotels).toHaveLength(6)
    expect(body.hotels[0]).toMatchObject({ name: 'Goa Grand Hotel', price_per_night: 299 })
  })

  test('with a key: the model answer, even when wrapped in text', async () => {
    globalThis.__generate.mockResolvedValue(answer('Sure! {"hotels":[{"name":"Taj"}]} Enjoy.'))
    const { body } = await read(await search({ location: 'Goa', minPrice: 100, maxPrice: 300, rating: 4 }, { GOOGLE_AI_API_KEY: 'k' }))
    expect(body).toEqual({ hotels: [{ name: 'Taj' }] })
    expect(globalThis.__generate.mock.calls[0][0]).toContain('Minimum rating: 4 stars.')
  })

  test.each([
    ['an answer that is not JSON', () => globalThis.__generate.mockResolvedValue(answer('no hotels today'))],
    ['a failed call', () => globalThis.__generate.mockRejectedValue(new Error('quota'))],
  ])('falls back to sample hotels on %s', async (_label, arrange) => {
    arrange()
    const { body } = await read(await search({ location: 'Pune' }, { GOOGLE_AI_API_KEY: 'k' }))
    expect(body.is_fallback_data).toBe(true)
    expect(body.hotels[0].name).toBe('Pune Grand Hotel')
  })

  test('needs a login and a location; a bad body is a 500', async () => {
    const route = await load('@/app/api/llm/hotels/search/route')
    expect((await route.POST(request('/x', { method: 'POST', body: { location: 'Goa' } }))).status).toBe(401)
    expect(await read(await route.POST(request('/x', { method: 'POST', body: { location: '  ' }, token })))).toEqual({ status: 400, body: { error: 'Location is required' } })
    expect((await route.POST(request('/x', { method: 'POST', body: '{', token }))).status).toBe(500)
  })
})

describe('POST /api/llm/hotels/details', () => {
  const details = async (body, env) => (await load('@/app/api/llm/hotels/details/route', env)).POST(request('/x', { method: 'POST', body, token }))
  const hotel = { id: 'h1', name: 'Sea View', location: 'Goa' }

  test('without a key: sample details for the named hotel', async () => {
    const { body } = await read(await details(hotel))
    expect(body.is_fallback_data).toBe(true)
    expect(body.hotel).toMatchObject({ id: 'h1', name: 'Sea View', location: 'Goa', address: '123 Main Street, Goa' })
    expect(body.hotel.room_types).toHaveLength(3)
  })

  test('with a key: the model answer, or the sample when it fails or is not JSON', async () => {
    globalThis.__generate.mockResolvedValueOnce(answer('{"hotel":{"name":"Sea View","rating":4.9}}'))
    expect((await read(await details(hotel, { GOOGLE_AI_API_KEY: 'k' }))).body).toEqual({ hotel: { name: 'Sea View', rating: 4.9 } })
    globalThis.__generate.mockResolvedValueOnce(answer('nope'))
    expect((await read(await details(hotel, { GOOGLE_AI_API_KEY: 'k' }))).body.is_fallback_data).toBe(true)
    globalThis.__generate.mockRejectedValueOnce(new Error('quota'))
    expect((await read(await details(hotel, { GOOGLE_AI_API_KEY: 'k' }))).body.is_fallback_data).toBe(true)
  })

  test('needs a login and id, name and location', async () => {
    const route = await load('@/app/api/llm/hotels/details/route')
    expect((await route.POST(request('/x', { method: 'POST', body: hotel }))).status).toBe(401)
    expect((await read(await route.POST(request('/x', { method: 'POST', body: { id: 'h1' }, token })))).status).toBe(400)
    expect((await route.POST(request('/x', { method: 'POST', body: '{', token }))).status).toBe(500)
  })
})

describe('POST /api/llm/travel-packages/search', () => {
  const search = async (body, env) => (await load('@/app/api/llm/travel-packages/search/route', env)).POST(request('/x', { method: 'POST', body, token }))

  test('without a key: six sample packages shaped by price and duration', async () => {
    const { body } = await read(await search({ destination: 'Bali', minPrice: 1500, maxPrice: 4000, duration: '5-9' }))
    expect(body.is_fallback_data).toBe(true)
    expect(body.travelPackages).toHaveLength(6)
    expect(body.travelPackages[0]).toMatchObject({ destination: 'Bali', price: 1500, discounted_price: 1275, duration: 7 })
    expect(body.travelPackages.every((p) => p.duration >= 5 && p.duration <= 9)).toBe(true)
  })

  test.each([
    ['15+', 15],
    ['4', 4],
    ['', 7],
  ])('sample durations for "%s"', async (duration, first) => {
    const { body } = await read(await search({ destination: 'Bali', duration }))
    expect(body.travelPackages[0].duration).toBe(first)
  })

  test('with GOOGLE_AI_API_KEY or GEMINI_API_KEY: the model answer, else the sample', async () => {
    globalThis.__generate.mockResolvedValueOnce(answer('{"travelPackages":[{"name":"Bali Bliss"}]}'))
    expect((await read(await search({ destination: 'Bali', minPrice: 1, maxPrice: 2, duration: '3-5' }, { GEMINI_API_KEY: 'k' }))).body).toEqual({ travelPackages: [{ name: 'Bali Bliss' }] })
    globalThis.__generate.mockResolvedValueOnce(answer('nope'))
    expect((await read(await search({ destination: 'Bali' }, { GOOGLE_AI_API_KEY: 'k' }))).body.is_fallback_data).toBe(true)
    globalThis.__generate.mockRejectedValueOnce(new Error('quota'))
    expect((await read(await search({ destination: 'Bali' }, { GOOGLE_AI_API_KEY: 'k' }))).body.is_fallback_data).toBe(true)
  })

  test('needs a login and a destination', async () => {
    const route = await load('@/app/api/llm/travel-packages/search/route')
    expect((await route.POST(request('/x', { method: 'POST', body: { destination: 'Bali' } }))).status).toBe(401)
    expect((await read(await route.POST(request('/x', { method: 'POST', body: { destination: ' ' }, token })))).status).toBe(400)
    expect((await route.POST(request('/x', { method: 'POST', body: '{', token }))).status).toBe(500)
  })

  // FINDING: a numeric duration (e.g. 7 from a number input) is not handled: `duration.includes`
  // throws and the search answers 500.
  knownBug('accepts a numeric duration', async () => {
    expect((await search({ destination: 'Bali', duration: 7 })).status).toBe(200)
  })
})

describe('POST /api/llm/travel-packages/details', () => {
  test('always tells the client to use its cached package', async () => {
    const { POST } = await load('@/app/api/llm/travel-packages/details/route')
    expect(await read(await POST(request('/x', { method: 'POST', body: { id: 't1' }, token })))).toEqual({ status: 200, body: { is_fallback_data: true, travelPackage: null } })
    expect((await POST(request('/x', { method: 'POST', body: {}, token }))).status).toBe(400)
    expect((await POST(request('/x', { method: 'POST', body: { id: 't1' } }))).status).toBe(401)
    expect((await POST(request('/x', { method: 'POST', body: '{', token }))).status).toBe(500)
  })
})

describe('POST /api/chat', () => {
  const chat = async (messages, env = { GEMINI_API_KEY: 'k' }) => (await load('@/app/api/chat/route', env)).POST(request('/x', { method: 'POST', body: { messages } }))
  const system = { role: 'system', content: 'You are...' }

  test('sends the recent conversation (no system message) and answers the reply', async () => {
    const fetch = vi.fn(async () => geminiReply('Visit Hampi!'))
    vi.stubGlobal('fetch', fetch)
    const res = await read(await chat([system, { role: 'user', content: 'Where to go?' }]))

    expect(res).toEqual({ status: 200, body: { text: 'Visit Hampi!' } })
    const [url, init] = fetch.mock.calls[0]
    expect(url).toContain('gemini-1.5-flash:generateContent?key=k')
    expect(JSON.parse(init.body).contents).toEqual([{ role: 'user', parts: [{ text: 'Where to go?' }] }])
  })

  test('keeps only the last five messages and cuts each to 100 words', async () => {
    const fetch = vi.fn(async () => geminiReply('ok'))
    vi.stubGlobal('fetch', fetch)
    const long = Array.from({ length: 150 }, (_, i) => `w${i}`).join(' ')
    const messages = [system, ...Array.from({ length: 8 }, (_, i) => ({ role: i % 2 ? 'model' : 'user', content: i === 7 ? long : `m${i}` }))]
    await chat(messages)
    const contents = JSON.parse(fetch.mock.calls[0][1].body).contents
    expect(contents.map((c) => c.parts[0].text.split(' ')[0])).toEqual(['m3', 'm4', 'm5', 'm6', 'w0'])
    expect(contents[4].parts[0].text.split(' ')).toHaveLength(100)
    expect(contents[4].parts[0].text.endsWith('...')).toBe(true)
  })

  // FINDING: the chat page sends earlier replies with role "assistant", and this route passes
  // roles through unchanged; Gemini accepts only "user" and "model", so once there is a reply
  // in the history every further message fails.
  knownBug('replies are sent to Gemini with the "model" role', async () => {
    const fetch = vi.fn(async () => geminiReply('ok'))
    vi.stubGlobal('fetch', fetch)
    await chat([system, { role: 'user', content: 'Beach?' }, { role: 'assistant', content: 'Goa' }, { role: 'user', content: 'When?' }])
    expect(JSON.parse(fetch.mock.calls[0][1].body).contents.map((c) => c.role)).toEqual(['user', 'model', 'user'])
  })

  test('an empty reply, an API error and a bad request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })))
    expect((await read(await chat([system, { role: 'user', content: '' }]))).body).toEqual({ text: 'No response text' })
    vi.stubGlobal('fetch', vi.fn(async () => geminiReply('denied', false, 403)))
    expect(await read(await chat([system, { role: 'user', content: 'hi' }]))).toEqual({ status: 500, body: { error: 'Failed to process request', details: 'HTTP error! status: 403' } })
    expect((await chat(undefined)).status).toBe(500)
  })
})

describe('POST /api/destination-details', () => {
  const ask = async (body, env = { GEMINI_API_KEY: 'k' }) => (await load('@/app/api/destination-details/route', env)).POST(request('/x', { method: 'POST', body }))
  const trip = { destination: 'Kyoto', startDate: '2026-04-01', endDate: '2026-04-05', guests: '2' }

  test.each(['overview', 'accommodation', 'food', 'transportation', 'events', 'budget', 'itinerary', 'tips', 'shopping'])(
    'without a key, "%s" has built-in content for the destination',
    async (section) => {
      const { status, body } = await read(await ask({ ...trip, section }, {}))
      expect(status).toBe(200)
      expect(JSON.stringify(body)).not.toContain('"error":true')
    }
  )

  test('an unknown section gets an error object', async () => {
    const { body } = await read(await ask({ ...trip, section: 'weather' }, {}))
    expect(body).toEqual({ error: true, message: 'Unable to generate valid data for weather. Please try again later.', destinationName: 'Kyoto' })
  })

  test('asks for the right trip and returns the JSON answer', async () => {
    const fetch = vi.fn(async () => geminiReply('{"description":"Temples"}'))
    vi.stubGlobal('fetch', fetch)
    expect((await read(await ask({ ...trip, section: 'budget' }))).body).toEqual({ description: 'Temples' })
    const prompt = JSON.parse(fetch.mock.calls[0][1].body)
    expect(JSON.stringify(prompt)).toContain('for 4 days')
    expect(JSON.stringify(prompt)).toContain('2 people')
  })

  test('accepts JSON in a ```json block', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => geminiReply('Here:\n```json\n{"ok":1}\n```')))
    expect((await read(await ask({ ...trip, guests: '1', section: 'food' }))).body).toEqual({ ok: 1 })
  })

  test('retries once when the answer has no JSON, then falls back', async () => {
    const fetch = vi.fn(async () => geminiReply('Kyoto is lovely.'))
    vi.stubGlobal('fetch', fetch)
    const { body } = await read(await ask({ destination: 'Kyoto', section: 'food' }))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(body.cuisine).toContain('Kyoto')
  })

  test('JSON-looking text that does not parse falls back without retrying', async () => {
    const fetch = vi.fn(async () => geminiReply('{ broken'))
    vi.stubGlobal('fetch', fetch)
    expect((await read(await ask({ ...trip, section: 'shopping' }))).body.overview).toContain('Kyoto')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  test('missing parameters 400; a failing request 500', async () => {
    expect((await read(await ask({ destination: 'Kyoto' }))).status).toBe(400)
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    expect(await read(await ask({ ...trip, section: 'food' }))).toEqual({ status: 500, body: { error: 'Failed to process request', details: 'offline' } })
  })
})

describe('trip summaries', () => {
  const summary = {
    summary_text: 'A week in Kyoto',
    place_info: { description: 'Old capital' },
    budget_info: { total_estimate: '$1500' },
    itinerary_info: { recommended_days: 5, days: [] },
  }
  const create = async (body, env = { GEMINI_API_KEY: 'k' }) => (await load('@/app/api/trip-summary/route', env)).POST(request('/x', { method: 'POST', body }))

  test('generates, stores and returns a shareable summary', async () => {
    const fetch = vi.fn(async () => geminiReply('```' + JSON.stringify(summary) + '```'))
    vi.stubGlobal('fetch', fetch)
    const { status, body } = await read(await create({ destination: 'Kyoto', startDate: '2026-04-01', endDate: '2026-04-05', guests: 2 }))

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true, summary })
    expect(body.shareUrl).toMatch(/^\/shared-trip\/[0-9a-f-]{36}$/)
    const [row] = db.tables.trip_summaries
    expect(row).toMatchObject({ destination: 'Kyoto', user_id: null, share_url: body.shareUrl, summary_text: 'A week in Kyoto' })
    expect(body.id).toBe(row.id)
    expect(JSON.parse(fetch.mock.calls[0][1].body).contents.parts.text).toContain('There are 2 travelers.')
  })

  test('errors: no destination, no key, API failure, unparseable answer, database failure', async () => {
    expect((await read(await create({}))).status).toBe(400)
    expect(await read(await create({ destination: 'Kyoto' }, {}))).toEqual({ status: 503, body: { error: 'AI service is not available' } })
    vi.stubGlobal('fetch', vi.fn(async () => geminiReply('busy', false, 429)))
    expect((await read(await create({ destination: 'Kyoto' }))).body.error).toBe('Failed to generate trip summary (429)')
    vi.stubGlobal('fetch', vi.fn(async () => geminiReply('no json')))
    expect((await read(await create({ destination: 'Kyoto' }))).body.error).toBe('Failed to generate trip summary')
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })))
    expect((await read(await create({ destination: 'Kyoto' }))).status).toBe(500)
    vi.stubGlobal('fetch', vi.fn(async () => geminiReply(JSON.stringify(summary))))
    db.failNext('trip_summaries', { message: 'insert failed' })
    expect(await read(await create({ destination: 'Kyoto' }))).toEqual({ status: 500, body: { error: 'Failed to store trip summary', details: 'insert failed' } })
    expect((await (await load('@/app/api/trip-summary/route', { GEMINI_API_KEY: 'k' })).POST(request('/x', { method: 'POST', body: '{' }))).status).toBe(500)
  })

  test('a summary is found by its id or by its share id', async () => {
    const { GET } = await load('@/app/api/trip-summary/[id]/route')
    db.seed({ trip_summaries: [{ id: 's1', share_id: 'share-abc', destination: 'Kyoto' }] })
    expect((await read(await GET(request('/x'), params({ id: 's1' })))).body.summary.destination).toBe('Kyoto')
    expect((await read(await GET(request('/x'), params({ id: 'share-abc' })))).body.summary.id).toBe('s1')
    expect(await read(await GET(request('/x'), params({ id: 'nope' })))).toEqual({ status: 404, body: { error: 'Trip summary not found' } })
    expect((await read(await GET(request('/x'), params({})))).status).toBe(400)
    expect((await read(await GET(request('/x'), {}))).status).toBe(400)
    db.failNext('trip_summaries', { message: 'db down' })
    expect(await read(await GET(request('/x'), params({ id: 's1' })))).toEqual({ status: 500, body: { error: 'Failed to fetch trip summary', details: 'db down' } })
    vi.spyOn(db, 'from').mockImplementation(() => { throw new Error('boom') })
    expect((await read(await GET(request('/x'), params({ id: 's1' })))).body.details).toBe('boom')
  })
})
