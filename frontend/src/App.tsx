import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ManageHabitsPage from './pages/ManageHabitsPage'
import LoggingPage from './pages/LoggingPage'

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
