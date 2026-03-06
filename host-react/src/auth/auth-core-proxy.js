/**
 * auth-core-proxy.js
 *
 * Re-export semua dari auth-store lokal.
 * File ini yang di-expose via Module Federation sebagai './AuthCore'
 * dan juga yang di-alias sebagai '@devpulse/auth-core'.
 *
 * Karena di-mark singleton dalam shared config, semua remote
 * yang import './AuthCore' akan mendapat instance yang SAMA.
 */
export * from './auth-store.js'
export { ROLES, ROLE_CAPS, getCaps } from './roles.js'
