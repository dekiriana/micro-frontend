/**
 * DevPulse Auth Core — JWT Simulation Layer
 * Framework-agnostic. No dependencies.
 *
 * Simulates real JWT structure (header.payload.signature)
 * without a real crypto backend — for demo/education purposes.
 */

const SECRET = 'devpulse-secret-2024'

/** Base64url encode (browser-safe) */
function b64encode(obj) {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/** Base64url decode */
function b64decode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  try { return JSON.parse(atob(base64)) } catch { return null }
}

/** Simulated HMAC signature (not cryptographically secure — demo only) */
function sign(header, payload) {
  const data = `${b64encode(header)}.${b64encode(payload)}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const chr = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash).toString(36) + SECRET.slice(0, 8)
}

/**
 * Create a JWT-like token
 * @param {object} payload - user data to encode
 * @param {number} expiresInSeconds - default 1 hour
 */
export function createToken(payload, expiresInSeconds = 3600) {
  const header  = { alg: 'HS256', typ: 'JWT' }
  const now     = Math.floor(Date.now() / 1000)
  const claims  = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    iss: 'devpulse-auth',
  }
  const h = b64encode(header)
  const p = b64encode(claims)
  const s = sign(header, claims)
  return `${h}.${p}.${s}`
}

/**
 * Decode token payload WITHOUT verifying signature
 * (use verifyToken for validated decode)
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  return b64decode(parts[1])
}

/**
 * Verify token: checks structure, signature, and expiry
 * Returns { valid, payload, reason }
 */
export function verifyToken(token) {
  if (!token) return { valid: false, payload: null, reason: 'no_token' }

  const parts = token.split('.')
  if (parts.length !== 3) return { valid: false, payload: null, reason: 'malformed' }

  const header  = b64decode(parts[0])
  const payload = b64decode(parts[1])
  if (!header || !payload) return { valid: false, payload: null, reason: 'decode_error' }

  // Verify signature
  const expectedSig = sign(header, payload)
  if (parts[2] !== expectedSig) {
    return { valid: false, payload: null, reason: 'invalid_signature' }
  }

  // Check expiry
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) {
    return { valid: false, payload, reason: 'expired' }
  }

  return { valid: true, payload, reason: null }
}

/**
 * Get remaining seconds until token expires
 */
export function getTokenTTL(token) {
  const payload = decodeToken(token)
  if (!payload?.exp) return 0
  return Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
}
