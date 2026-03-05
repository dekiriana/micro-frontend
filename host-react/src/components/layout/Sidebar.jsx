import React from 'react'
import { useApp } from '../../context/AppContext'
import styles from './Sidebar.module.css'


function IconFeed() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconBoard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 6.5L8 1l7 5.5V15H10v-4H6v4H1V6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
function IconCollapse() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const ICON_MAP = { feed: IconFeed, board: IconBoard, home: IconHome }

function StatusDot({ status }) {
  const colorMap = {
    online: 'var(--green)',
    offline: 'var(--red)',
    connecting: 'var(--yellow)',
  }
  return (
    <span
      className={styles.statusDot}
      style={{
        background: colorMap[status] || 'var(--text-muted)',
        boxShadow: status === 'online' ? `0 0 6px ${colorMap.online}` : 'none',
        animation: status === 'connecting' ? 'pulse 1.4s ease-in-out infinite' : 'none',
      }}
    />
  )
}

export default function Sidebar() {
  const { activeNav, navigate, sidebarOpen, setSidebarOpen, navItems, remoteStatus, user } = useApp()

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.collapsed}`}>
      <div className={styles.logo}>
        <div 
          className={styles.logoMark}
          onClick={() => !sidebarOpen && setSidebarOpen(true)}
          style={{ cursor: sidebarOpen ? 'default' : 'pointer' }}
          title={!sidebarOpen ? 'Expand sidebar' : ''}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polygon points="10,1 19,6 19,14 10,19 1,14 1,6" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-subtle)"/>
            <circle cx="10" cy="10" r="2.5" fill="var(--accent)"/>
          </svg>
        </div>

        {sidebarOpen && (
          <div className={styles.logoText}>
            <span className={styles.logoName}>DevPulse</span>
            <span className={styles.logoVersion}>v0.1.0-mvp</span>
          </div>
        )}

       
        {sidebarOpen && (
          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarOpen(false)}
            title="Collapse sidebar"
            aria-label="Toggle sidebar"
          >
            <span style={{ display: 'flex' }}>
              <IconCollapse />
            </span>
          </button>
        )}
      </div>

     
      <nav className={styles.nav}>
        {sidebarOpen && <span className={styles.sectionLabel}>// REMOTES</span>}

        {navItems.map(item => {
          const Icon = ICON_MAP[item.icon] || IconHome
          const isActive = activeNav === item.id
          const status = remoteStatus[item.id] || 'connecting'

          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => navigate(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className={styles.navIcon}>
                <Icon />
              </span>

              {sidebarOpen && (
                <>
                  <span className={styles.navContent}>
                    <span className={styles.navLabel}>{item.label}</span>
                    <span className={styles.navDesc}>{item.description}</span>
                  </span>
                  <span className={styles.navMeta}>
                    <span
                      className={styles.frameworkTag}
                      style={{ color: item.tagColor, borderColor: `${item.tagColor}33`, background: `${item.tagColor}0d` }}
                    >
                      {item.tag}
                    </span>
                    <StatusDot status={status} />
                  </span>
                </>
              )}

              {!sidebarOpen && <StatusDot status={status} />}
              {isActive && <span className={styles.activeBar} />}
            </button>
          )
        })}
      </nav>

     
      <div style={{ flex: 1 }} />

     
      {sidebarOpen && (
        <div className={styles.legend}>
          <span className={styles.sectionLabel}>// FEDERATION</span>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <StatusDot status="online" />
              <span>online</span>
            </div>
            <div className={styles.legendItem}>
              <StatusDot status="connecting" />
              <span>connecting</span>
            </div>
            <div className={styles.legendItem}>
              <StatusDot status="offline" />
              <span>offline</span>
            </div>
          </div>
        </div>
      )}

     
      <div className={styles.userSection}>
        <div className={styles.avatar}>{user.avatar}</div>
        {sidebarOpen && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
