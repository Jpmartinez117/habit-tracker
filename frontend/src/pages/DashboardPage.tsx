import { useEffect, useState } from 'react'
import type { Habit } from '../types/habit'
import { getHabits } from '../services/habitService'
import { getMe, logout } from '../services/authService'
import { getTodayHabitLogs } from '../services/logService'
import HabitListItem from '../components/HabitListItem'
import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function DashboardPage({ navigate }: Props) {
  const [username, setUsername] = useState('')
  const [habits, setHabits] = useState<Habit[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [error, setError] = useState('')
  const [now, setNow] = useState(new Date())
  const [lastUpdated] = useState(new Date())

  useEffect(() => {
    Promise.all([getHabits(), getMe(), getTodayHabitLogs()])
      .then(([fetchedHabits, user, todayLogs]) => {
        setHabits(fetchedHabits)
        setUsername(user.username)
        setCompletedCount(todayLogs.filter(l => l.status === 'completed').length)
      })
      .catch(() => setError('Failed to load dashboard'))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('login')
  }

  const total = habits.length
  const completed = completedCount
  const progressPct = total > 0 ? (completed / total) * 100 : 0

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Header */}
      <div className="d-flex align-items-center px-4 py-3 border-bottom bg-white">
        <div className="flex-fill">
          <span className="fw-semibold">Welcome, {username}</span>
        </div>
        <div className="flex-fill text-center">
          <span className="text-muted small">{formatDateTime(now)}</span>
        </div>
        <div className="flex-fill d-flex justify-content-end">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="container-fluid px-4 py-4 flex-grow-1">
        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">{error}</div>
        )}

        <div className="row g-4">

          {/* Left panel */}
          <div className="col-md-8">
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="small text-muted">Goals completed today</span>
                <span className="small fw-medium">{completed} / {total}</span>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progressPct}%` }}
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              {completed === total && total > 0 && (
                <div className="alert alert-success py-2 mt-2 mb-0 small" role="alert">
                  All goals completed today — great work!
                </div>
              )}
            </div>

            <div>
              {habits.length === 0 ? (
                <p className="text-muted small">No active goals. Go to Manage to add some.</p>
              ) : (
                habits.map((habit, i) => (
                  <HabitListItem key={habit.id} habit={habit} index={i + 1} />
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="col-md-4">
            <div className="d-flex flex-column gap-3">

              <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                <span className="text-muted small">Active Goals</span>
                <span className="fw-semibold">{total}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                <span className="text-muted small">Mood</span>
                <span className="text-muted small fst-italic">Not logged</span>
              </div>

              <div className="d-flex flex-column gap-2">
                <button className="btn btn-primary btn-sm w-100" onClick={() => navigate('logging')}>
                  Log +
                </button>
                <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                  Data
                </button>
                <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => navigate('manage')}>
                  Manage
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                <span className="text-muted small">Last updated</span>
                <span className="text-muted small">
                  {lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Consecutive days</span>
                <span className="fw-semibold">0</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
