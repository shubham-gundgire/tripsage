import { describe, test, expect, vi, beforeEach } from 'vitest'
import { Writable } from 'node:stream'
import jwt from 'jsonwebtoken'
import { db } from '../setup/server.js'
import { request, read } from '../support/requests.js'
import { knownBug } from '../support/known-bug.js'

// Cloudinary: upload_stream collects what is piped in and answers through its callback.
globalThis.__cloudinary = { config: vi.fn(), uploads: [], fail: null }
vi.mock('cloudinary', () => ({
  v2: {
    config: (...a) => globalThis.__cloudinary.config(...a),
    uploader: {
      upload_stream: (options, callback) => {
        const chunks = []
        return new Writable({
          write(chunk, _enc, next) {
            chunks.push(chunk)
            next()
          },
          final(done) {
            const c = globalThis.__cloudinary
            c.uploads.push({ options, bytes: Buffer.concat(chunks) })
            if (c.fail) callback(c.fail)
            else callback(null, { secure_url: 'https://res.cloudinary.example/img.png', public_id: 'tripsage/blog-images/img' })
            done()
          },
        })
      },
    },
  },
}))

beforeEach(() => {
  globalThis.__cloudinary.uploads = []
  globalThis.__cloudinary.fail = null
})

describe('POST /api/upload', () => {
  const upload = async (form) => (await import('@/app/api/upload/route')).POST(new Request('http://localhost/api/upload', { method: 'POST', body: form }))

  test('sends the image to the blog-images folder and answers its URL', async () => {
    const form = new FormData()
    form.append('file', new Blob(['png-bytes'], { type: 'image/png' }), 'photo.png')
    expect(await read(await upload(form))).toEqual({ status: 200, body: { success: true, url: 'https://res.cloudinary.example/img.png', public_id: 'tripsage/blog-images/img' } })
    const [sent] = globalThis.__cloudinary.uploads
    expect(sent.options).toEqual({ folder: 'tripsage/blog-images', resource_type: 'image' })
    expect(sent.bytes.toString()).toBe('png-bytes')
  })

  test('no file 400; a Cloudinary error 500', async () => {
    expect(await read(await upload(new FormData()))).toEqual({ status: 400, body: { error: 'No file uploaded' } })
    globalThis.__cloudinary.fail = new Error('quota')
    const form = new FormData()
    form.append('file', new Blob(['x']), 'x.png')
    expect(await read(await upload(form))).toEqual({ status: 500, body: { error: 'Failed to upload image' } })
  })

  // FINDING: there is no login check (the code says "You can add authentication check here"):
  // anyone can upload images into the Cloudinary account, whose key and secret are written in
  // lib/cloudinary.js.
  knownBug('uploading needs a login', async () => {
    const form = new FormData()
    form.append('file', new Blob(['x']), 'x.png')
    expect((await upload(form)).status).toBe(401)
  })

  test('lib/cloudinary configures the SDK with secure URLs', async () => {
    vi.resetModules()
    globalThis.__cloudinary.config.mockClear()
    await import('@/lib/cloudinary')
    expect(globalThis.__cloudinary.config).toHaveBeenCalledWith(expect.objectContaining({ secure: true }))
  })
})

describe('POST /api/db/alter-bookings-table', () => {
  test('runs the stored procedure and reports its result', async () => {
    const { POST } = await import('@/app/api/db/alter-bookings-table/route')
    db.rpc.mockResolvedValueOnce({ data: 'done', error: null })
    expect(await read(await POST(request('/x', { method: 'POST' })))).toEqual({ status: 200, body: { success: true, message: 'Bookings table altered successfully', data: 'done' } })
    expect(db.rpc).toHaveBeenCalledWith('execute_alter_bookings_table')
    db.rpc.mockResolvedValueOnce({ data: null, error: { message: 'permission denied' } })
    expect((await read(await POST(request('/x', { method: 'POST' })))).body).toEqual({ success: false, message: 'Failed to alter bookings table', error: 'permission denied' })
    db.rpc.mockRejectedValueOnce(new Error('boom'))
    expect((await read(await POST(request('/x', { method: 'POST' })))).body.error).toBe('boom')
  })

  // FINDING: anyone can call it — there is no login or admin check before a schema change.
  knownBug('changing the table needs an admin', async () => {
    const { POST } = await import('@/app/api/db/alter-bookings-table/route')
    expect((await POST(request('/x', { method: 'POST' }))).status).toBe(401)
  })
})

describe('Supabase-session debug routes', () => {
  const session = { user: { id: 'sb-1', email: 'asha@example.com', last_sign_in_at: '2025-01-01' } }
  const cookies = (names) => {
    globalThis.__cookies = names.map((name) => ({ name, value: `${name}-value-long-enough-to-trim` }))
  }

  test('/api/auth/status reports the session and cookie names', async () => {
    const { GET } = await import('@/app/api/auth/status/route')
    cookies(['sb-x-auth-token', 'theme'])
    expect(await read(await GET())).toEqual({ status: 200, body: { status: 'unauthenticated', cookies: { total: 2, names: ['sb-x-auth-token', 'theme'], hasAuthCookie: true } } })
    db.auth.getSession.mockResolvedValueOnce({ data: { session } })
    expect((await read(await GET())).body).toMatchObject({ status: 'authenticated', user: { id: 'sb-1', email: 'asha@example.com' } })
    cookies([])
    db.auth.getSession.mockResolvedValueOnce({ data: {}, error: { message: 'bad jwt' } })
    expect(await read(await GET())).toEqual({ status: 500, body: { status: 'error', error: 'bad jwt', cookies: { total: 0, names: [], hasAuthCookie: false } } })
    db.auth.getSession.mockRejectedValueOnce(new Error('boom'))
    expect((await read(await GET())).body).toMatchObject({ status: 'error', message: 'boom' })
  })

  test('/api/auth/test answers who is signed in', async () => {
    const { GET } = await import('@/app/api/auth/test/route')
    cookies(['sb-x-auth-token'])
    expect(await read(await GET(request('/x')))).toEqual({ status: 401, body: { error: 'No session found', cookiesFound: 1, authCookieFound: true } })
    db.auth.getSession.mockResolvedValueOnce({ data: { session } })
    expect((await read(await GET(request('/x')))).body).toEqual({ message: 'Authentication successful', user: { id: 'sb-1', email: 'asha@example.com', lastSignIn: '2025-01-01' }, cookiesFound: 1 })
    cookies([])
    db.auth.getSession.mockResolvedValueOnce({ data: null, error: { message: 'bad jwt' } })
    expect(await read(await GET(request('/x')))).toEqual({ status: 401, body: { error: 'bad jwt', cookiesFound: 0, authCookieFound: false } })
    db.auth.getSession.mockRejectedValueOnce(new Error('boom'))
    expect((await read(await GET(request('/x')))).body.error).toBe('Unexpected error: boom')
  })

  test('/api/debug-cookies tries three ways to read the session', async () => {
    const { GET } = await import('@/app/api/debug-cookies/route')
    cookies(['sb-lhahkzopivqnqlnkjpsv-auth-token'])
    db.auth.getSession.mockResolvedValueOnce({ data: { session } })
    const { body } = await read(await GET(request('/x')))
    expect(body.methods.method1).toEqual({ success: true, cookieCount: 1, cookieNames: ['sb-lhahkzopivqnqlnkjpsv-auth-token'], authCookieFound: true, authCookieName: 'sb-lhahkzopivqnqlnkjpsv-auth-token' })
    expect(body.methods.method2).toMatchObject({ success: true, cookieFound: true, cookieValueStart: 'sb-lhahkzo...' })
    expect(body.methods.method3.sessionCheck).toEqual({ success: true, hasSession: true, userId: 'sb-1', userEmail: 'asha@example.com' })

    cookies([])
    db.auth.getSession.mockResolvedValueOnce({ data: null, error: { message: 'bad jwt' } })
    expect((await read(await GET(request('/x')))).body.methods.method3.sessionCheck).toEqual({ success: false, hasSession: false, error: 'bad jwt' })
    db.auth.getSession.mockRejectedValueOnce(new Error('boom'))
    expect((await read(await GET(request('/x')))).body.methods.method3.sessionCheck).toEqual({ success: false, error: 'boom' })
  })

  test('/api/debug-cookies records each method that fails', async () => {
    const { GET } = await import('@/app/api/debug-cookies/route')
    const headers = await import('next/headers')
    headers.cookies.mockImplementation(() => { throw new Error('no cookies here') })
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
    const { body } = await read(await GET(request('/x')))
    expect(body.errors).toEqual(['Method 1 failed: no cookies here', 'Method 2 failed: no cookies here', 'Method 3 failed: no cookies here'])
    headers.cookies.mockReset()
    void createRouteHandlerClient
  })
})

describe('app/lib/email.js', () => {
  let email
  beforeEach(async () => {
    email = await import('@/app/lib/email')
  })
  const lastMail = () => globalThis.__sendMail.mock.calls.at(-1)[0]

  test('the reset and welcome emails are addressed and named', async () => {
    await email.sendPasswordResetEmail('asha@example.com', 'Asha', 'https://x/reset?token=t')
    expect(lastMail()).toMatchObject({ to: 'asha@example.com', subject: 'Reset Your TripSage Password' })
    expect(lastMail().html).toContain('https://x/reset?token=t')
    expect(lastMail().html).toContain('Asha')
    await email.sendWelcomeEmail('asha@example.com', 'Asha')
    expect(lastMail().subject).toBe('Welcome to TripSage!')
  })

  test('booking emails show dates, rupee totals and participants', async () => {
    await email.sendHotelBookingConfirmation('a@x', 'Asha', { id: 'b1', check_in_date: '2026-11-01', check_out_date: '2026-11-03', guests: 2, total_price: 12500, hotel_details: JSON.stringify({ hotel_name: 'Sea View' }) })
    expect(lastMail().html).toContain('₹12,500')
    expect(lastMail().html).toContain('Sea View')
    expect(lastMail().html).toContain('November')
    await email.sendTravelBookingConfirmation('a@x', 'Asha', { travel_date: '2026-12-01', guests: 2, total_price: 9000, travel_details: { package_name: 'Kerala' }, participants: JSON.stringify([{ name: 'Ravi', age: 31 }]) })
    expect(lastMail().html).toContain('Kerala')
    expect(lastMail().html).toContain('Ravi')
  })

  test('missing details fall back to placeholders', async () => {
    await email.sendHotelBookingConfirmation('a@x', 'Asha', { check_in_date: 'x', check_out_date: 'y', guests: 1, total_price: 1, hotel_details: {} })
    expect(lastMail().html).toContain('Your Hotel')
    await email.sendTravelBookingConfirmation('a@x', 'Asha', { travel_date: 'x', guests: 1, total_price: 1, travel_details: '{}' })
    expect(lastMail().html).toContain('TRP')
  })

  test('when sending fails, each email is logged instead and the call still resolves', async () => {
    globalThis.__sendMail.mockRejectedValue(new Error('smtp down'))
    await expect(email.sendPasswordResetEmail('a@x', 'A', 'link')).resolves.toBeUndefined()
    await expect(email.sendWelcomeEmail('a@x', 'A')).resolves.toBeUndefined()
    await expect(email.sendHotelBookingConfirmation('a@x', 'A', { check_in_date: 'x', check_out_date: 'y', hotel_details: {} })).resolves.toBeUndefined()
    await expect(email.sendTravelBookingConfirmation('a@x', 'A', { travel_date: 'x', travel_details: {}, participants: [{ name: 'P', age: 1 }] })).resolves.toBeUndefined()
    const logged = console.log.mock.calls.flat().join('\n')
    expect(logged).toContain('PASSWORD RESET EMAIL')
    expect(logged).toContain('WELCOME EMAIL')
  })
})

describe('app/lib/emailService.js (used by the booking routes)', () => {
  test('sends both confirmations; a send failure is logged, not thrown', async () => {
    const service = await import('@/app/lib/emailService')
    await service.sendHotelBookingConfirmation('a@x', 'Asha', { check_in_date: '2026-01-01', check_out_date: '2026-01-02', guests: 1, total_price: 1000, hotel_details: '{"hotel_name":"Lake"}' })
    expect(globalThis.__sendMail.mock.calls.at(-1)[0].html).toContain('Lake')
    await service.sendTravelBookingConfirmation('a@x', 'Asha', { travel_date: '2026-01-01', guests: 1, total_price: 1000, travel_details: '{"package_name":"Ladakh"}', participants: '[{"name":"Ravi","age":30}]' })
    expect(globalThis.__sendMail.mock.calls.at(-1)[0].html).toContain('Ladakh')
    await service.sendTravelBookingConfirmation('a@x', 'Asha', { travel_date: '2026-01-01', travel_details: {}, total_price: 1 })
    globalThis.__sendMail.mockRejectedValue(new Error('smtp down'))
    await expect(service.sendHotelBookingConfirmation('a@x', 'A', { hotel_details: {} })).resolves.toBeUndefined()
    await expect(service.sendTravelBookingConfirmation('a@x', 'A', { travel_details: {} })).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('Error sending travel booking confirmation email:', expect.any(Error))
  })
})

describe('Supabase clients and the JWT secret', () => {
  test('app/lib/supabase warns when the anon key is missing', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    const { createClient } = await import('@supabase/supabase-js')
    await import('@/app/lib/supabase')
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('anon key is not set'))
    expect(createClient).toHaveBeenLastCalledWith('https://lhahkzopivqnqlnkjpsv.supabase.co', '')
  })

  test('createAdminClient needs the URL and the service-role key', async () => {
    const { createAdminClient } = await import('@/supabase-service-client')
    expect(createAdminClient()).toBe(db)
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    expect(() => createAdminClient()).toThrow('Missing Supabase environment variables')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    expect(() => createAdminClient()).toThrow('Missing Supabase environment variables')
  })

  test('without JWT_SECRET the auth module warns at start-up', async () => {
    vi.resetModules()
    vi.stubEnv('JWT_SECRET', '')
    await import('@/app/lib/auth')
    await import('@/app/api/auth/login/route')
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Using default JWT secret'))
  })

  // FINDING: when JWT_SECRET is not set, every route falls back to the published string
  // "your-jwt-secret-key", so anyone can sign their own token for any user id.
  knownBug('a token signed with the placeholder secret is never accepted', async () => {
    vi.resetModules()
    vi.stubEnv('JWT_SECRET', '')
    const { GET } = await import('@/app/api/bookings/user-bookings/route')
    const forged = jwt.sign({ userId: 'someone-else', email: 'x' }, 'your-jwt-secret-key')
    expect((await GET(request('/x', { token: forged }))).status).toBe(401)
  })
})
