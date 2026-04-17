import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ManageHabitsPage from './pages/ManageHabitsPage'
import LoggingPage from './pages/LoggingPage'
import DataPage from './pages/DataPage'

// Simple state-based routing — no router library.
// Navigating to a new page unmounts the current component and loses its local state.
export type Page = 'login' | 'register' | 'dashboard' | 'manage' | 'logging' | 'data'

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const token = localStorage.getItem('access_token')
    return token ? 'dashboard' : 'login'
  })

  function navigate(next: Page) {
    setPage(next)
  }

  useEffect(() => {
    function handleAuthLogout() {
      navigate('login')
    }
    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [])

  switch (page) {
    case 'login':
      return <LoginPage navigate={navigate} />
    case 'register':
      return <RegisterPage navigate={navigate} />
    case 'dashboard':
      return <DashboardPage navigate={navigate} />
    case 'manage':
      return <ManageHabitsPage navigate={navigate} />
    case 'logging':
      return <LoggingPage navigate={navigate} />
    case 'data':
      return <DataPage navigate={navigate} />
  }
}
