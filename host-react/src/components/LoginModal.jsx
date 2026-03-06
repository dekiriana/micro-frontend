/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../auth/useAuth.js'
import styles from './LoginModal.module.css'

export default function LoginModal({ onClose, onSuccess, prefill = null }) {
  const { login, loading, error, clearError } = useAuth()

  const [username, setUsername] = useState(prefill?.username ?? '')
  const [password, setPassword] = useState(prefill?.password ?? '')
  const [showPw, setShowPw]     = useState(false)
  const [shake, setShake]       = useState(false)
  const inputRef                = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => { if (error) clearError() }, [username, password, error, clearError])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    const result = await login(username.trim(), password)

    if (result.success) {
      onSuccess?.()
      onClose()
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const decoded = (() => {

    try {
      if (!username) return null
      const MOCK = { admin: 'admin', dev: 'developer', viewer: 'viewer' }
      const role = MOCK[username] ?? null
      if (!role) return null
      const now = Math.floor(Date.now() / 1000)
      return {
        header:  { alg: 'HS256', typ: 'JWT' },
        payload: { id: 'u00x', username, role, iat: now, exp: now + 3600, iss: 'devpulse-auth' },
      }
    } catch { return null }
  })()

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${shake ? styles.shake : ''}`}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <polygon points="10,1 19,6 19,14 10,19 1,14 1,6"
                stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-glow)"/>
              <circle cx="10" cy="10" r="2.5" fill="var(--accent)"/>
            </svg>
            <span>DevPulse</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.loginIntro}>
            <h2 className={styles.loginTitle}>Sign in to your account</h2>
            <p className={styles.loginSub}>JWT token will be shared across all micro-frontends</p>
          </div>

          {/* Error message */}
          {error && (
            <div className={styles.errorBanner}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#e5393d" strokeWidth="1.2"/>
                <path d="M6 3.5v3M6 8.5v.5" stroke="#e5393d" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                ref={inputRef}
                className={styles.input}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin / dev / viewer"
                autoComplete="username"
                spellCheck={false}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.togglePw}
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? '◡' : '◠'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span className={styles.loadingRow}>
                  <span className={styles.spinner} />
                  Authenticating...
                </span>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          {/* JWT preview panel */}
          {decoded && (
            <div className={styles.jwtPreview}>
              <div className={styles.jwtLabel}>
                <span className={styles.jwtDot} />
                JWT token preview (after login)
              </div>
              <div className={styles.jwtTerminal}>
                <div className={styles.jwtSection}>
                  <span className={styles.jwtSectionLabel} style={{ color: '#e8a838' }}>// header</span>
                  <pre className={styles.jwtCode} style={{ color: '#e8a838' }}>
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
                <div className={styles.jwtSection}>
                  <span className={styles.jwtSectionLabel} style={{ color: '#42b883' }}>// payload</span>
                  <pre className={styles.jwtCode} style={{ color: '#42b883' }}>
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>
                <div className={styles.jwtSection}>
                  <span className={styles.jwtSectionLabel} style={{ color: '#4da6ff' }}>// shared via</span>
                  <code className={styles.jwtNote}>authStore singleton → all remotes</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo shortcuts */}
        <div className={styles.demoRow}>
          <span className={styles.demoLabel}>Quick access:</span>
          {[
            { u: 'admin',  p: 'admin123',  role: 'admin',     color: '#e5393d' },
            { u: 'dev',    p: 'dev123',    role: 'developer', color: '#4da6ff' },
            { u: 'viewer', p: 'viewer123', role: 'viewer',    color: '#37c97d' },
          ].map(d => (
            <button
              key={d.u}
              className={styles.demoBtn}
              style={{ '--demo-color': d.color }}
              onClick={() => { setUsername(d.u); setPassword(d.p) }}
              disabled={loading}
            >
              {d.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
