import { useEffect, useState } from 'react'
import type { Habit } from '../types/habit'
import { getHabits } from '../services/habitService'
import { getTodayHabitLogs, getTodayMoodLog, logHabit, logMood } from '../services/logService'
import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

const MOOD_OPTIONS: { score: number; emoji: string }[] = [
  { score: 1, emoji: '😞' },
  { score: 2, emoji: '😕' },
  { score: 3, emoji: '😐' },
  { score: 4, emoji: '🙂' },
  { score: 5, emoji: '😄' },
]

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
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
      const habitCalls = habits.map(habit =>
        logHabit({
          habit_id: habit.id,
          log_date: today,
          status: toggles[habit.id] ? 'completed' : 'missed',
        })
      )

      const moodCall = moodScore !== null
        ? [logMood({ log_date: today, mood_score: moodScore, notes: note.trim() || undefined })]
        : []

      await Promise.all([...habitCalls, ...moodCall])
      setSaved(true)
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
        <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          Mood
        </h6>

        <div className="d-flex gap-2 mb-3">
          {MOOD_OPTIONS.map(({ score, emoji }) => (
            <button
              key={score}
              className={`btn btn-sm flex-fill ${moodScore === score ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setMoodScore(score)}
            >
              {emoji} {score}
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
