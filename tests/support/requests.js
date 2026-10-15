import jwt from 'jsonwebtoken'

export const TEST_SECRET = 'test-jwt-secret'

/** A token exactly like the ones /api/auth/login hands out. */
export const tokenFor = (user, options = { expiresIn: '24h' }) =>
  jwt.sign({ userId: user.id, email: user.email }, TEST_SECRET, options)

/** A Request as a Next route handler receives it. */
export function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const init = { method, headers: { ...headers } }
  if (token) init.headers.authorization = `Bearer ${token}`
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
    init.headers['content-type'] = 'application/json'
  }
  return new Request(`http://localhost${path}`, init)
}

/** Status and parsed JSON body of a route's response. */
export async function read(response) {
  return { status: response.status, body: await response.json() }
}

/** Route context for dynamic segments such as [id]. */
export const params = (values) => ({ params: values })
