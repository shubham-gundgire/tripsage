import { vi } from 'vitest'

/** Stands in for next/navigation: a recording router, a settable path, params and query. */
export const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn(), prefetch: vi.fn(), forward: vi.fn() }
export const nav = { pathname: '/', params: {}, search: new URLSearchParams() }

export const useRouter = () => router
export const usePathname = () => nav.pathname
export const useParams = () => nav.params
export const useSearchParams = () => nav.search
export const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
export const redirect = vi.fn()

export function resetNav() {
  for (const fn of Object.values(router)) fn.mockReset()
  nav.pathname = '/'
  nav.params = {}
  nav.search = new URLSearchParams()
}
