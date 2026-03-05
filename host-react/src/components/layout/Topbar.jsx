import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './Topbar.module.css'

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5C5 1.5 3.5 3.5 3.5 6v3.5l-1 1h10l-1-1V6C11.5 3.5 10 1.5 7.5 1.5z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 11.5c0 .83.67 1.5 1.5 1.5S9 12.33 9 11.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2H9M9 2l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Topbar() {
  const { activeNav, navItems, remoteStatus, sidebarOpen } = useApp()
  const [search, setSearch] = useState('')

  const currentPage = navItems.find(n => n.id === activeNav)
  const status = currentPage ? remoteStatus[currentPage.id] : null

  const statusLabel = {
    online: 'remote connected',
    connecting: 'connecting...',
    offline: 'remote offline',
  }
  const statusColor = {
    online: 'var(--green)',
    connecting: 'var(--yellow)',
    offline: 'var(--red)',
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header
      className={styles.topbar}
      style={{ left: sidebarOpen ? 'var(--sidebar-width)' : '56px' }}
    >
      
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          <span className={styles.breadRoot}>devpulse</span>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>
            {currentPage?.label ?? 'overview'}
          </span>
        </div>

        {currentPage && (
          <div className={styles.remoteChip}>
            <span
              className={styles.chipDot}
              style={{
                background: statusColor[status] || 'var(--text-muted)',
                boxShadow: status === 'online' ? `0 0 5px ${statusColor.online}` : 'none',
                animation: status === 'connecting' ? 'pulse 1.4s ease-in-out infinite' : 'none',
              }}
            />
            <span
              className={styles.chipTag}
              style={{
                color: currentPage.tagColor,
                borderColor: `${currentPage.tagColor}33`,
                background: `${currentPage.tagColor}0d`,
              }}
            >
              {currentPage.tag}
            </span>
            <span className={styles.chipLabel}>
              {statusLabel[status] ?? '—'}
            </span>
          </div>
        )}
      </div>

      
      <div className={styles.searchWrap}>
        <IconSearch />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search DevPulse..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className={styles.searchKbd}>⌘K</span>
      </div>

      
      <div className={styles.right}>
        <div className={styles.clock}>
          <span className={styles.clockTime}>{timeStr}</span>
          <span className={styles.clockDate}>{dateStr}</span>
        </div>

        <button className={styles.iconBtn} title="Refresh remotes">
          <IconRefresh />
        </button>

        <button className={styles.iconBtn} title="Notifications">
          <IconBell />
          <span className={styles.notifBadge}>2</span>
        </button>
      </div>
    </header>
  )
}
