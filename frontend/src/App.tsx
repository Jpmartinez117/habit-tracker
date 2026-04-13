import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ManageHabitsPage from './pages/ManageHabitsPage'
import LoggingPage from './pages/LoggingPage'

// Simple state-based routing — no router library.
// Navigating to a new page unmounts the current component and loses its local state.
export type Page = 'login' | 'register' | 'dashboard' | 'manage' | 'logging'

export default function App() {
  const [page, setPage] = useState<Page>('login')

  function navigate(next: Page) {
    setPage(next)
  }

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
  }
}
