import { vi } from 'vitest'

/**
 * A fetch stand-in for the pages: routes are "METHOD /path" (query string ignored) mapped to a
 * response body, { status, body }, or a function (url, init) returning either. Unknown routes
 * answer 404. Every call is recorded in fetchMock.calls.
 */
export function mockFetch(routes = {}) {
  const fetchMock = vi.fn(async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url
    const method = (init.method || 'GET').toUpperCase()
    const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
    let route = routes[`${method} ${path}`] ?? routes[path]
    if (route === undefined) {
      const match = Object.entries(routes).find(([key]) => {
        const [m, p] = key.includes(' ') ? key.split(' ') : ['GET', key]
        return m === method && new RegExp(`^${p.replace(/\*/g, '[^/]+')}$`).test(path)
      })
      route = match?.[1]
    }
    if (typeof route === 'function') route = await route(url, init)
    if (route instanceof Error) throw route
    const { status = 200, body = {} } = route && typeof route === 'object' && 'body' in route ? route : { body: route ?? { error: 'not found' }, status: route === undefined ? 404 : 200 }
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    }
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** The parsed JSON body of the n-th call to a path. */
export const sentBody = (fetchMock, path, n = 0) => {
  const calls = fetchMock.mock.calls.filter(([url]) => String(url).includes(path))
  return JSON.parse(calls[n][1].body)
}
