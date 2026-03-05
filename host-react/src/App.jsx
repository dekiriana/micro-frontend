import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import RemoteLoader from './components/remotes/RemoteLoader'
import styles from './App.module.css'

function Shell() {
  const { activeNav, sidebarOpen } = useApp()

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div
        className={styles.main}
        style={{ marginLeft: sidebarOpen ? 'var(--sidebar-width)' : '56px' }}
      >
        <Topbar />
        <main className={styles.content}>
          <RemoteLoader key={activeNav} remoteId={activeNav} />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}