/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { useAuth } from './auth/useAuth.js'
import LandingPage from './pages/LandingPage.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import RemoteLoader from './components/remotes/RemoteLoader.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import styles from './App.module.css'


function Shell() {
  const { activeNav, sidebarOpen } = useApp()
  const { logout, user, role }     = useAuth() 

  return (
    <div className={styles.shell}>
      <Sidebar onLogout={logout}  /> 
     <div
        className={styles.main}
        style={{ marginLeft: sidebarOpen ? 'var(--sidebar-width)' : '56px' }}
      >
        <Topbar onLogout={logout} /> 
        <main className={styles.content}>
          <RemoteLoader key={activeNav} remoteId={activeNav} />
        </main>
      </div>
    </div>
  )
}


function Root() {
  const { isAuth, loading } = useAuth()

  
  if (loading) {
    return (
      <div className={styles.bootScreen}>
        <div className={styles.bootSpinner} />
        <span className={styles.bootLabel}>devpulse initializing...</span>
      </div>
    )
  }

  
  if (!isAuth) {
    return <LandingPage onLogin={() => {}} />
  }

  
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}


export default function App() {
  return <Root />
}