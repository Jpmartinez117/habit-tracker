import { useEffect, useState } from 'react'
import type { Habit } from '../types/habit'
import { getHabits } from '../services/habitService'
import { getTodayHabitLogs, getTodayMoodLog, logHabit, deleteHabitLog, logMood } from '../services/logService'
import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

const MOOD_OPTIONS: { score: number; emoji: string; label: string }[] = [
  { score: 1, emoji: '😞', label: 'Terrible' },
  { score: 2, emoji: '😕', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Excellent' },
]

// Uses the local date (not UTC) to match the backend's date.today() which is also local.
// If we used new Date().toISOString(), users in UTC- timezones would log to the wrong date after midnight UTC.
function getTodayISO(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function getTodayDisplay(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function LoggingPage({ navigate }: Props) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [toggles, setToggles] = useState<Record<number, boolean>>({})
  const [todayLogs, setTodayLogs] = useState<import('../types/log').HabitLogResponse[]>([])
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const today = getTodayISO()
  const todayDisplay = getTodayDisplay()

  useEffect(() => {
    Promise.all([getHabits(), getTodayHabitLogs(), getTodayMoodLog()])
      .then(([fetched, todayLogs, todayMood]) => {
        setHabits(fetched)

        // Pre-populate toggles from today's existing logs so re-opening the page
        // shows the user's previous selections rather than resetting everything to off (missed).
        setTodayLogs(todayLogs)
        const initial: Record<number, boolean> = {}
        fetched.forEach(h => {
          const existing = todayLogs.find(l => l.habit_id === h.id)
          initial[h.id] = existing?.status === 'completed'
        })
        setToggles(initial)

        if (todayMood) {
          setMoodScore(todayMood.mood_score)
          setNote(todayMood.notes ?? '')
        }
      })
      .catch(() => setError('Failed to load logging data'))
  }, [])

  function handleToggle(habitId: number) {
    setToggles(prev => ({ ...prev, [habitId]: !prev[habitId] }))
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const habitCalls = habits.map(habit => {
        const wasLogged = todayLogs.find(l => l.habit_id === habit.id)
        const isChecked = toggles[habit.id]
        if (isChecked) return logHabit({ habit_id: habit.id, log_date: today, status: 'completed' })
        if (wasLogged) return deleteHabitLog(habit.id, today)
        return Promise.resolve()
      })

      const moodCall = moodScore !== null
        ? [logMood({ log_date: today, mood_score: moodScore, notes: note.trim() || undefined })]
        : []

      const results = await Promise.allSettled([...habitCalls, ...moodCall])
      const failures = results.filter(r => r.status === 'rejected')

      if (failures.length === results.length) {
        setError('Failed to save. Please check your connection and try again.')
      } else if (failures.length > 0) {
        setError(`Saved with ${failures.length} error(s) — some entries may not have been recorded.`)
        setSaved(true)
      } else {
        setSaved(true)
      }
      const refreshed = await getTodayHabitLogs()
      setTodayLogs(refreshed)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Header */}
      <div className="d-flex align-items-center px-4 py-3 border-bottom bg-white">
        <div className="flex-fill">
          <span className="fw-semibold">Log for: {todayDisplay}</span>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('dashboard')}>
          Back
        </button>
      </div>

      {/* Body */}
      <div className="container py-4" style={{ maxWidth: '640px' }}>

        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">{error}</div>
        )}

        {/* Habits section */}
        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Active Goals ({habits.length})
        </h6>

        {habits.length === 0 ? (
          <p className="text-muted small mb-4">No active goals. Add some in Manage.</p>
        ) : (
          <div className="mb-4">
            {habits.map(habit => (
              <div key={habit.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span>{habit.name}</span>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={`toggle-${habit.id}`}
                    checked={toggles[habit.id] ?? false}
                    onChange={() => handleToggle(habit.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mood section */}
        <div className="d-flex align-items-baseline gap-2 mb-2">
          <h6 className="text-uppercase text-muted mb-0" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Mood</h6>
          <span className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>(optional)</span>
        </div>

        <div className="d-flex gap-2 mb-3">
          {MOOD_OPTIONS.map(({ score, emoji, label }) => (
            <button
              key={score}
              className={`btn btn-sm flex-fill ${moodScore === score ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setMoodScore(score)}
            >
              {score}. {label} {emoji}
            </button>
          ))}
        </div>

        <textarea
          className="form-control mb-4"
          rows={2}
          placeholder="Today I..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <button
          className="btn btn-primary w-100"
          onClick={handleSave}
          disabled={loading || habits.length === 0}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {saved && (
          <div className="alert alert-success py-2 mt-3 mb-0" role="alert">
            Saved: {todayDisplay}
          </div>
        )}

      </div>
    </div>
  )
}
