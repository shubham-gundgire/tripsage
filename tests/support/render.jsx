import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { AuthProvider } from '@/app/context/AuthContext'

/** Signs a user in the way the app remembers them (localStorage). */
export function signIn(user = { id: 'user-1', name: 'Asha', email: 'asha@example.com' }, token = 'tok-1') {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return user
}

/** Renders inside the app's AuthProvider, as the root layout does. */
export const renderWithAuth = (ui) => render(<AuthProvider>{ui}</AuthProvider>)

/**
 * Signed in, but the token is gone by the time the page reads it (e.g. cleared in another tab):
 * the AuthProvider's first read finds it, every later read does not.
 */
export function signInThenLoseToken(user) {
  signIn(user)
  const real = Storage.prototype.getItem
  let readOnce = false
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key) {
    if (key === 'token') {
      if (readOnce) return null
      readOnce = true
    }
    return real.call(this, key)
  })
}
