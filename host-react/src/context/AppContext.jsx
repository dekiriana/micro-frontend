/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export const NAV_ITEMS = [
  { id: 'feed', label: 'The Feed', icon: 'feed', tag: 'Vue 3', tagColor: '#42b883', description: 'Tech news & articles', port: 4202 },
  { id: 'board', label: 'The Board', icon: 'board', tag: 'Angular 21', tagColor: '#dd0031', description: 'Team metrics & analytics', port: 4201 },
]

export function AppProvider({ children }) {
  const [activeNav, setActiveNav] = useState('feed')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [remoteStatus, setRemoteStatus] = useState({ feed: 'connecting', board: 'connecting' })
  
  // Data user disesuaikan
  const [user] = useState({
    name: 'Deki Riana',
    handle: '@dekiriana',
    avatar: 'DR',
    role: 'Full-Stack Developer',
  })

  const navigate = useCallback((id) => setActiveNav(id), [])
  const updateRemoteStatus = useCallback((remoteId, status) => {
    setRemoteStatus(prev => ({ ...prev, [remoteId]: status }))
  }, [])

  return (
    <AppContext.Provider value={{
      activeNav, navigate, sidebarOpen, setSidebarOpen,
      remoteStatus, updateRemoteStatus, user, navItems: NAV_ITEMS,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}