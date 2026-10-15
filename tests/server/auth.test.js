import { describe, test, expect, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../setup/server.js'
import { request, read, tokenFor, TEST_SECRET } from '../support/requests.js'
import { knownBug } from '../support/known-bug.js'
import { POST as signup } from '@/app/api/auth/signup/route'
import { POST as login } from '@/app/api/auth/login/route'
import { GET as me } from '@/app/api/auth/me/route'
import { POST as forgot } from '@/app/api/auth/forgot-password/route'
import { POST as reset } from '@/app/api/auth/reset-password/route'
import { getAuthUser, getCookie, verifyToken, authenticateRequest, getJwtSecretKey } from '@/app/lib/auth'

const asha = async (overrides = {}) => {
  const user = { id: 'user-1', name: 'Asha', email: 'asha@example.com', password: await bcrypt.hash('secret1', 4), ...overrides }
  db.seed({ users: [...(db.tables.users ?? []), user] })
  return user
}

describe('POST /api/auth/signup', () => {
  test('stores the user with a hashed password and answers without it', async () => {
    const { status, body } = await read(await signup(request('/api/auth/signup', { method: 'POST', body: { name: 'Asha', email: 'asha@example.com', password: 'secret1' } })))

    expect(status).toBe(200)
    expect(body.message).toBe('User registered successfully')
    expect(body.user).toMatchObject({ name: 'Asha', email: 'asha@example.com' })
    expect(body.user).not.toHaveProperty('password')
    const [saved] = db.tables.users
    expect(await bcrypt.compare('secret1', saved.password)).toBe(true)
    expect(saved.created_at).toMatch(/^\d{4}-\d\d-\d\dT/)
  })

  test.each([{ email: 'a@example.com', password: 'x' }, { name: 'A', password: 'x' }, { name: 'A', email: 'a@example.com' }])(
    'refuses missing details: %j',
    async (body) => {
      const res = await read(await signup(request('/api/auth/signup', { method: 'POST', body })))
      expect(res).toEqual({ status: 400, body: { error: 'Name, email, and password are required' } })
    }
  )

  test('refuses an email that is already registered', async () => {
    await asha()
    const res = await read(await signup(request('/api/auth/signup', { method: 'POST', body: { name: 'B', email: 'asha@example.com', password: 'x' } })))
    expect(res).toEqual({ status: 400, body: { error: 'User with this email already exists' } })
  })

  test('a database error answers 500 with its message', async () => {
    db.seed({ users: [] })
    const original = db.from.bind(db)
    let calls = 0
    vi.spyOn(db, 'from').mockImplementation((t) => {
      calls += 1
      if (calls === 2) db.failNext('users', { message: 'insert failed' })
      return original(t)
    })
    const res = await read(await signup(request('/api/auth/signup', { method: 'POST', body: { name: 'A', email: 'a@example.com', password: 'x' } })))
    expect(res).toEqual({ status: 500, body: { error: 'insert failed' } })
  })

  test('a body that is not JSON answers 500', async () => {
    const res = await read(await signup(request('/api/auth/signup', { method: 'POST', body: 'not json' })))
    expect(res).toEqual({ status: 500, body: { error: 'Internal server error' } })
  })

  // FINDING: sign-up takes a password of any length (reset-password requires 6 characters).
  knownBug('requires at least 6 characters, as reset-password does', async () => {
    const res = await signup(request('/api/auth/signup', { method: 'POST', body: { name: 'A', email: 'a@example.com', password: '1' } }))
    expect(res.status).toBe(400)
  })

  // FINDING: emails are compared exactly, so "Asha@Example.com" makes a second account for the
  // same address (and the person must log in with the exact capitalisation used at sign-up).
  knownBug('treats email addresses case-insensitively', async () => {
    await asha()
    const res = await signup(request('/api/auth/signup', { method: 'POST', body: { name: 'B', email: 'Asha@Example.com', password: 'secret1' } }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  test('answers a 24-hour token and the user without the password', async () => {
    await asha()
    const { status, body } = await read(await login(request('/api/auth/login', { method: 'POST', body: { email: 'asha@example.com', password: 'secret1' } })))

    expect(status).toBe(200)
    expect(body.user).toEqual({ id: 'user-1', name: 'Asha', email: 'asha@example.com' })
    const claims = jwt.verify(body.token, TEST_SECRET)
    expect(claims).toMatchObject({ userId: 'user-1', email: 'asha@example.com' })
    expect(claims.exp - claims.iat).toBe(24 * 60 * 60)
  })

  test('the same 401 for an unknown email and a wrong password', async () => {
    await asha()
    const unknown = await read(await login(request('/api/auth/login', { method: 'POST', body: { email: 'x@example.com', password: 'secret1' } })))
    const wrong = await read(await login(request('/api/auth/login', { method: 'POST', body: { email: 'asha@example.com', password: 'nope' } })))
    expect(unknown).toEqual({ status: 401, body: { error: 'Invalid email or password' } })
    expect(wrong).toEqual(unknown)
  })

  test('refuses missing details, and reports database and body errors', async () => {
    expect(await read(await login(request('/api/auth/login', { method: 'POST', body: { email: 'a@example.com' } })))).toEqual({
      status: 400,
      body: { error: 'Email and password are required' },
    })
    db.failNext('users', { message: 'db down' })
    expect(await read(await login(request('/api/auth/login', { method: 'POST', body: { email: 'a@example.com', password: 'x' } })))).toEqual({
      status: 500,
      body: { error: 'db down' },
    })
    expect((await login(request('/api/auth/login', { method: 'POST', body: '{' }))).status).toBe(500)
  })
})

describe('GET /api/auth/me', () => {
  test('returns my profile', async () => {
    const user = await asha({ created_at: '2025-01-01T00:00:00Z' })
    const res = await read(await me(request('/api/auth/me', { token: tokenFor(user) })))
    expect(res).toEqual({ status: 200, body: { user: { id: 'user-1', name: 'Asha', email: 'asha@example.com', created_at: '2025-01-01T00:00:00Z' } } })
  })

  test.each([
    ['no token', {}, { error: 'Authentication required' }],
    ['a bad token', { token: 'nope' }, { error: 'Invalid or expired token' }],
    ['an expired token', { token: tokenFor({ id: 'user-1', email: 'a' }, { expiresIn: -1 }) }, { error: 'Invalid or expired token' }],
  ])('401 with %s', async (_label, options, body) => {
    expect(await read(await me(request('/api/auth/me', options)))).toEqual({ status: 401, body })
  })

  test('an account that no longer exists answers 500 (single() finds no row)', async () => {
    const res = await read(await me(request('/api/auth/me', { token: tokenFor({ id: 'gone', email: 'x' }) })))
    expect(res.status).toBe(500)
  })

  // FINDING: a deleted account (no row) is reported as a server error instead of 404, because
  // .single() turns "no rows" into an error before the "User not found" check.
  knownBug('a deleted account answers 404', async () => {
    const res = await me(request('/api/auth/me', { token: tokenFor({ id: 'gone', email: 'x' }) }))
    expect(res.status).toBe(404)
  })
})

describe('forgot and reset password', () => {
  const send = (email) => forgot(request('/api/auth/forgot-password', { method: 'POST', body: { email } }))
  const generic = { message: 'If your email is registered, you will receive a password reset link shortly.' }

  test('stores a one-hour token and emails a reset link', async () => {
    await asha()
    process.env.NEXT_PUBLIC_APP_URL = 'https://tripsage.example'
    const res = await read(await send('asha@example.com'))
    delete process.env.NEXT_PUBLIC_APP_URL

    expect(res).toEqual({ status: 200, body: generic })
    const [token] = db.tables.password_reset_tokens
    expect(token.user_id).toBe('user-1')
    expect(token.token).toMatch(/^[0-9a-f]{64}$/)
    const minutes = (new Date(token.expires_at) - Date.now()) / 60000
    expect(minutes).toBeGreaterThan(59)
    expect(minutes).toBeLessThanOrEqual(60)
    const [mail] = globalThis.__sendMail.mock.calls[0]
    expect(mail.to).toBe('asha@example.com')
    expect(mail.html).toContain(`https://tripsage.example/reset-password?token=${token.token}`)
  })

  test('an unknown email gets the same answer and no token', async () => {
    expect(await read(await send('nobody@example.com'))).toEqual({ status: 200, body: generic })
    expect(db.tables.password_reset_tokens ?? []).toHaveLength(0)
    expect(globalThis.__sendMail).not.toHaveBeenCalled()
  })

  test('the link still "succeeds" when the email cannot be sent', async () => {
    await asha()
    globalThis.__sendMail.mockRejectedValue(new Error('smtp down'))
    expect(await read(await send('asha@example.com'))).toEqual({ status: 200, body: generic })
  })

  test('errors: no email, user lookup, token storage, bad body', async () => {
    expect(await read(await send(undefined))).toEqual({ status: 400, body: { error: 'Email is required' } })
    db.failNext('users')
    expect((await send('asha@example.com')).status).toBe(500)
    await asha()
    db.failNext('password_reset_tokens')
    expect((await send('asha@example.com')).status).toBe(500)
    expect((await forgot(request('/x', { method: 'POST', body: '{' }))).status).toBe(500)
  })

  // FINDING: when the email cannot be sent, lib/email.js prints the whole reset link — a
  // working password-reset token — to the server log.
  knownBug('a reset link is never written to the server log', async () => {
    await asha()
    globalThis.__sendMail.mockRejectedValue(new Error('smtp down'))
    await send('asha@example.com')
    const [token] = db.tables.password_reset_tokens
    const logged = console.log.mock.calls.flat().join('\n')
    expect(logged).not.toContain(token.token)
  })

  const resetWith = (body) => reset(request('/api/auth/reset-password', { method: 'POST', body }))
  const validToken = (overrides = {}) =>
    db.seed({ password_reset_tokens: [{ id: 't1', user_id: 'user-1', token: 'abc', used: false, expires_at: new Date(Date.now() + 3600e3).toISOString(), ...overrides }] })

  test('a valid token sets the new password and is used up', async () => {
    await asha()
    validToken()
    expect(await read(await resetWith({ token: 'abc', password: 'new-pass' }))).toEqual({ status: 200, body: { message: 'Password has been reset successfully' } })
    expect(await bcrypt.compare('new-pass', db.tables.users[0].password)).toBe(true)
    expect(db.tables.password_reset_tokens[0].used).toBe(true)
    // ...and cannot be used again.
    expect((await read(await resetWith({ token: 'abc', password: 'other-pass' }))).body).toEqual({ error: 'Invalid or expired token' })
  })

  test.each([
    ['an expired token', { expires_at: new Date(Date.now() - 1000).toISOString() }],
    ['a used token', { used: true }],
  ])('refuses %s', async (_label, overrides) => {
    await asha()
    validToken(overrides)
    expect(await read(await resetWith({ token: 'abc', password: 'new-pass' }))).toEqual({ status: 400, body: { error: 'Invalid or expired token' } })
  })

  test('checks the input and reports database errors', async () => {
    expect((await read(await resetWith({ token: 'abc' }))).status).toBe(400)
    expect(await read(await resetWith({ token: 'abc', password: '123' }))).toEqual({ status: 400, body: { error: 'Password must be at least 6 characters long' } })
    db.failNext('password_reset_tokens')
    expect((await resetWith({ token: 'abc', password: 'new-pass' })).status).toBe(500)
    await asha()
    validToken()
    db.failNext('users')
    expect((await resetWith({ token: 'abc', password: 'new-pass' })).status).toBe(500)
    expect((await reset(request('/x', { method: 'POST', body: '{' }))).status).toBe(500)
  })

  test('the password is still changed if marking the token fails', async () => {
    await asha()
    validToken()
    const original = db.from.bind(db)
    vi.spyOn(db, 'from').mockImplementation((t) => {
      const q = original(t)
      if (t === 'password_reset_tokens' && db.queries.length >= 2) db.failNext('password_reset_tokens')
      return q
    })
    expect((await resetWith({ token: 'abc', password: 'new-pass' })).status).toBe(200)
    expect(await bcrypt.compare('new-pass', db.tables.users[0].password)).toBe(true)
  })
})

describe('app/lib/auth', () => {
  test('getAuthUser reads the bearer token and loads the user', async () => {
    const user = await asha()
    expect(await getAuthUser(request('/', { token: tokenFor(user) }))).toEqual({ userId: 'user-1', name: 'Asha', email: 'asha@example.com' })
  })

  test.each([
    ['no header', request('/')],
    ['not a bearer token', request('/', { headers: { authorization: 'Basic abc' } })],
    ['an empty bearer token', request('/', { headers: { authorization: 'Bearer ' } })],
    ['a bad token', request('/', { token: 'nope' })],
    ['a token without a user id', request('/', { token: jwt.sign({ email: 'x' }, TEST_SECRET) })],
    ['an unknown user', request('/', { token: tokenFor({ id: 'gone', email: 'x' }) })],
  ])('getAuthUser gives null for %s', async (_label, req) => {
    expect(await getAuthUser(req)).toBeNull()
  })

  test('getCookie, verifyToken and the secret', () => {
    const req = request('/', { headers: { cookie: 'a=1; token=xyz; b=2' } })
    expect(getCookie(req, 'token')).toBe('xyz')
    expect(getCookie(req, 'missing')).toBeNull()
    expect(getCookie(request('/'), 'token')).toBeNull()
    expect(verifyToken(tokenFor({ id: 'u', email: 'e' }))).toMatchObject({ userId: 'u' })
    expect(verifyToken('nope')).toBeNull()
    expect(getJwtSecretKey()).toBe(TEST_SECRET)
  })

  test('authenticateRequest answers 500 if reading the header throws', async () => {
    const res = await authenticateRequest({ headers: { get: () => { throw new Error('boom') } } })
    expect(res.authenticated).toBe(false)
    expect(await read(res.response)).toEqual({ status: 500, body: { error: 'Authentication error' } })
  })
})
