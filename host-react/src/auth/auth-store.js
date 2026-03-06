/**
 * DevPulse Auth Core — AuthStore
 *
 * Single source of truth untuk auth state di seluruh micro-frontend.
 * Framework-agnostic: bekerja di React, Vue, Angular tanpa modifikasi.
 *
 * Pattern: Observable store dengan EventEmitter sederhana.
 * Di-share sebagai singleton via Module Federation "shared" config.
 */

import { createToken, verifyToken, decodeToken, getTokenTTL } from './jwt.js'

const STORAGE_KEY = 'devpulse_token'

// ─── Mock user database ────────────────────────────────────────────────────
const MOCK_USERS = [
  {
    id:       'u001',
    username: 'admin',
    password: 'admin123',
    name:     'Alex Admin',
    initials: 'AA',
    email:    'alex@devpulse.dev',
    role:     'admin',
    avatar:   'AA',
    team:     'Platform',
  },
  {
    id:       'u002',
    username: 'viewer',
    password: 'viewer123',
    name:     'Sam Viewer',
    initials: 'SV',
    email:    'sam@devpulse.dev',
    role:     'viewer',
    avatar:   'SV',
    team:     'Product',
  },
  {
    id:       'u003',
    username: 'dev',
    password: 'dev123',
    name:     'Jordan Dev',
    initials: 'JD',
    email:    'jordan@devpulse.dev',
    role:     'developer',
    avatar:   'JD',
    team:     'Engineering',
  },
]

// ─── Store State ───────────────────────────────────────────────────────────
class AuthStore {
  #state = {
    token:   null,
    user:    null,
    isAuth:  false,
    loading: false,
    error:   null,
  }

  #listeners = new Set()
  #tokenTimer = null

  constructor() {
    // Rehydrate from localStorage on init
    this.#rehydrate()
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  getState() {
    return { ...this.#state }
  }

  getToken() { return this.#state.token }
  getUser()  { return this.#state.user  }
  isAuth()   { return this.#state.isAuth }
  getRole()  { return this.#state.user?.role ?? null }

  hasRole(...roles) {
    return roles.includes(this.#state.user?.role)
  }

  // ── Subscribe / Unsubscribe ───────────────────────────────────────────────

  /**
   * Subscribe to state changes.
   * Returns unsubscribe function.
   * @param {function} listener - called with new state on every change
   */
  subscribe(listener) {
    this.#listeners.add(listener)
    // Immediately emit current state to new subscriber
    listener({ ...this.#state })
    return () => this.#listeners.delete(listener)
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Login with username + password (mock).
   * Returns { success, error }
   */
  async login(username, password) {
    this.#setState({ loading: true, error: null })

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800))

    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    )

    if (!user) {
      this.#setState({ loading: false, error: 'Invalid username or password' })
      return { success: false, error: 'Invalid username or password' }
    }

    // Create JWT — exclude password from token payload
    const { password: _pw, ...userPayload } = user
    const token = createToken(userPayload, 3600) // 1 hour

    this.#setAuth(token, userPayload)
    return { success: true, error: null }
  }

  /**
   * Logout — clears all state and notifies all subscribers.
   * This is the key mechanism for cross-framework logout.
   */
  logout(reason = 'user_action') {
    this.#clearTimer()
    localStorage.removeItem(STORAGE_KEY)
    this.#setState({
      token:   null,
      user:    null,
      isAuth:  false,
      loading: false,
      error:   null,
      logoutReason: reason,
    })
  }

  /**
   * Refresh — extend token TTL (simulate token refresh)
   */
  refresh() {
    if (!this.#state.user) return false
    const token = createToken(this.#state.user, 3600)
    this.#setAuth(token, this.#state.user)
    return true
  }

  clearError() {
    this.#setState({ error: null })
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  #setAuth(token, user) {
    localStorage.setItem(STORAGE_KEY, token)
    this.#setState({ token, user, isAuth: true, loading: false, error: null })
    this.#scheduleExpiry(token)
  }

  #setState(partial) {
    this.#state = { ...this.#state, ...partial }
    this.#emit()
  }

  #emit() {
    const snapshot = { ...this.#state }
    this.#listeners.forEach(fn => {
      try { fn(snapshot) } catch (e) { console.error('[AuthStore] listener error', e) }
    })
  }

  #rehydrate() {
    try {
      const token = localStorage.getItem(STORAGE_KEY)
      if (!token) return

      const { valid, payload, reason } = verifyToken(token)
      if (!valid) {
        localStorage.removeItem(STORAGE_KEY)
        if (reason === 'expired') {
          this.#setState({ error: 'session_expired' })
        }
        return
      }

      this.#setState({ token, user: payload, isAuth: true })
      this.#scheduleExpiry(token)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  #scheduleExpiry(token) {
    this.#clearTimer()
    const ttl = getTokenTTL(token)
    if (ttl <= 0) return
    // Auto-logout when token expires
    this.#tokenTimer = setTimeout(() => {
      this.logout('token_expired')
    }, ttl * 1000)
  }

  #clearTimer() {
    if (this.#tokenTimer) {
      clearTimeout(this.#tokenTimer)
      this.#tokenTimer = null
    }
  }
}

// ─── Singleton export ──────────────────────────────────────────────────────
// This is what makes cross-framework sharing work:
// When Module Federation marks this as "shared: { singleton: true }",
// ALL remotes use THIS exact instance.
export const authStore = new AuthStore()

// Re-export jwt helpers for convenience
export { createToken, verifyToken, decodeToken, getTokenTTL }
