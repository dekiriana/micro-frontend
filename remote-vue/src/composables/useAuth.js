import { ref, onUnmounted } from 'vue'

export function useAuth() {
  const user = ref(null)
  const isAuth = ref(false)
  const role = ref(null)
  const caps = ref({}) 

  let unsubscribe = null

  const connectToAuthStore = async () => {
    try {
      // Sama seperti Angular, kita import dinamis agar tidak error saat standalone dev
      const mod = await (Function('return import("host_devpulse/AuthCore")')())
      const { authStore, getCaps } = mod

      // Subscribe ke Host AuthStore
      unsubscribe = authStore.subscribe((state) => {
        user.value = state.user
        isAuth.value = state.isAuth
        role.value = state.user?.role
        caps.value = getCaps(state.user?.role)
      })
    } catch (err) {
      console.warn('[Vue useAuth] Gagal connect ke Host, menggunakan LocalStorage Fallback', err)
      tryLocalStorageFallback()
    }
  }

  const tryLocalStorageFallback = () => {
    try {
      const token = localStorage.getItem('devpulse_token')
      if (!token) return
      
      const parts = token.split('.')
      if (parts.length !== 3) return
      
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) return

      user.value = payload
      isAuth.value = true
      role.value = payload.role

      // Fallback manual capabilities jika tidak terkoneksi ke Host
      const FALLBACK_CAPS = {
        admin: { canWrite: true, canDeploy: true, canManageUsers: true },
        developer: { canWrite: true, canDeploy: false, canManageUsers: false },
        viewer: { canWrite: false, canDeploy: false, canManageUsers: false },
      }
      caps.value = FALLBACK_CAPS[payload.role] || FALLBACK_CAPS.viewer
    } catch (e) { /* ignore */ }
  }

  connectToAuthStore()

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return { user, isAuth, role, caps }
}