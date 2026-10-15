import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { createElement, forwardRef } from 'react'
import { resetNav } from '../support/next.jsx'

vi.mock('next/navigation', () => import('../support/next.jsx'))
vi.mock('next/link', () => ({
  default: ({ href, children, prefetch, ...rest }) => (
    <a href={typeof href === 'string' ? href : href?.pathname} {...rest}>
      {children}
    </a>
  ),
}))
vi.mock('next/image', () => ({
  // eslint-disable-next-line jsx-a11y/alt-text
  default: ({ src, alt, fill, priority, quality, placeholder, sizes, ...rest }) => <img src={typeof src === 'string' ? src : src?.src} alt={alt} {...rest} />,
}))
vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'font-inter', variable: '--font-inter' }),
  Russo_One: () => ({ className: 'font-russo', variable: '--font-russo' }),
}))

// framer-motion: render the plain element without the animation props. The props are kept on
// the DOM node (node.__motion) so tests can call gesture handlers such as onDragEnd.
vi.mock('framer-motion', () => {
  const motionOnly = /^(initial|animate|exit|transition|variants|while[A-Z]\w*|viewport|layout|layoutId|custom|drag\w*|onDrag\w*|onAnimation\w*)$/
  const cache = new Map()
  const motion = new Proxy(
    {},
    {
      get: (_t, tag) => {
        if (!cache.has(tag)) {
          cache.set(
            tag,
            forwardRef((props, ref) => {
              const domProps = Object.fromEntries(Object.entries(props).filter(([k]) => !motionOnly.test(k)))
              const setRef = (node) => {
                if (node) node.__motion = props
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
              }
              return createElement(tag, { ...domProps, ref: setRef })
            })
          )
        }
        return cache.get(tag)
      },
    }
  )
  return { motion, AnimatePresence: ({ children }) => <>{children}</>, useAnimation: () => ({ start: vi.fn() }), useInView: () => true }
})

// Browser APIs jsdom does not implement.
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()
Element.prototype.scrollTo = vi.fn()
window.matchMedia ??= (query) => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  // Pages must not reach the network: a test that expects requests mocks fetch itself.
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    throw new Error(`unexpected request: ${url}`)
  }))
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  resetNav()
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
