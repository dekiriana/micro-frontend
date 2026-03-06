/**
 * useAuth — React hook wrapper untuk AuthStore
 *
 * Menjembatani framework-agnostic AuthStore ke React ecosystem.
 * Semua komponen React cukup pakai hook ini.
 */
import { useState, useEffect, useCallback } from 'react'
import { authStore, getCaps } from './auth-core-proxy.js'

export function useAuth() {
  const [state, setState] = useState(() => authStore.getState())

  useEffect(() => {
    // Subscribe ke AuthStore — unsubscribe saat unmount
    const unsub = authStore.subscribe(setState)
    return unsub
  }, [])

  const login = useCallback(async (username, password) => {
    return authStore.login(username, password)
  }, [])

  const logout = useCallback((reason) => {
    authStore.logout(reason)
  }, [])

  const refresh = useCallback(() => {
    return authStore.refresh()
  }, [])

  return {
    // State
    user:    state.user,
    token:   state.token,
    isAuth:  state.isAuth,
    loading: state.loading,
    error:   state.error,
    role:    state.user?.role ?? null,

    // Derived
    caps:    getCaps(state.user?.role),
    isAdmin:     state.user?.role === 'admin',
    isDeveloper: state.user?.role === 'developer',
    isViewer:    state.user?.role === 'viewer',

    // Actions
    login,
    logout,
    refresh,
    clearError: () => authStore.clearError(),
  }
}
