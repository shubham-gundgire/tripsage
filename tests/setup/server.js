import { vi, beforeEach, afterEach } from 'vitest'
import { createFakeSupabase } from '../support/fake-supabase.js'
import { TEST_SECRET } from '../support/requests.js'

// Routes read these when they load.
process.env.JWT_SECRET = TEST_SECRET
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'

// One fake database behind every Supabase client the app creates: the anon client
// (app/lib/supabase.js), the service-role clients and the auth-helpers client.
export const db = createFakeSupabase()
globalThis.__db = db
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => globalThis.__db) }))
vi.mock('@supabase/auth-helpers-nextjs', () => ({ createRouteHandlerClient: vi.fn(() => globalThis.__db) }))

// next/headers cookies(), settable per test.
globalThis.__cookies = []
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    const store = {
      getAll: () => globalThis.__cookies,
      get: (name) => globalThis.__cookies.find((c) => c.name === name),
    }
    // Next 15 returns a promise that also works synchronously.
    return Object.assign(Promise.resolve(store), store)
  }),
}))

// No email leaves the tests.
globalThis.__sendMail = vi.fn(async () => ({ messageId: 'test-message' }))
vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn(() => ({ sendMail: (...a) => globalThis.__sendMail(...a) })) } }))

beforeEach(() => {
  // Nothing may reach the network: a test that expects a request stubs fetch itself.
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    throw new Error(`unexpected network request: ${url}`)
  }))
  db.reset()
  globalThis.__cookies = []
  globalThis.__sendMail.mockReset()
  globalThis.__sendMail.mockResolvedValue({ messageId: 'test-message' })
  db.auth.getSession.mockReset()
  db.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  db.rpc.mockReset()
  db.rpc.mockResolvedValue({ data: null, error: null })
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
