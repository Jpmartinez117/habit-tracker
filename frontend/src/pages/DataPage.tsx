import { useEffect, useState } from 'react'
import type { Habit } from '../types/habit'
import type { HabitSummaryResponse, OverallSummaryResponse } from '../types/log'
import { getHabits, getArchivedHabits } from '../services/habitService'
import { getHabitSummary, getOverallSummary } from '../services/logService'
import HabitCalendarGrid from '../components/HabitCalendarGrid'
import HabitMetricsPanel from '../components/HabitMetricsPanel'
import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

function currentMonthStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function DataPage({ navigate }: Props) {
  const [viewMode, setViewMode] = useState<'overall' | 'individual'>('overall')

  const [activeHabits, setActiveHabits] = useState<Habit[]>([])
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([])
  const [habitsLoaded, setHabitsLoaded] = useState(false)

  const [overallSummary, setOverallSummary] = useState<OverallSummaryResponse | null>(null)
  const [overallLoading, setOverallLoading] = useState(false)
  const [overallMonth, setOverallMonth] = useState(currentMonthStr)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [summary, setSummary] = useState<HabitSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [error, setError] = useState('')

  // Load habits on mount
  useEffect(() => {
    Promise.all([getHabits(), getArchivedHabits()])
      .then(([active, archived]) => {
        setActiveHabits(active)
        setArchivedHabits(archived)
        setHabitsLoaded(true)
      })
      .catch(() => {
        setError('Failed to load data')
        setHabitsLoaded(true)
      })
  }, [])

  // Fetch overall summary when overallMonth changes
  useEffect(() => {
    setOverallLoading(true)
    setOverallSummary(null)
    getOverallSummary(overallMonth)
      .then(setOverallSummary)
      .catch(() => setError('Failed to load overall summary'))
      .finally(() => setOverallLoading(false))
  }, [overallMonth])

  // Fetch individual summary when habit or month changes (individual mode only)
  useEffect(() => {
    if (selectedId === null || viewMode !== 'individual') return
    setSummaryLoading(true)
    setSummary(null)
    setError('')
    getHabitSummary(selectedId, selectedMonth)
      .then(setSummary)
      .catch(() => setError('Failed to load habit summary'))
      .finally(() => setSummaryLoading(false))
  }, [selectedId, selectedMonth, viewMode])

  function handleToggle(mode: 'overall' | 'individual') {
    setViewMode(mode)
    if (mode === 'individual' && selectedId === null && activeHabits.length > 0) {
      setSelectedId(activeHabits[0].id)
    }
  }

  const noHabits = habitsLoaded && activeHabits.length === 0 && archivedHabits.length === 0
  const selectedHabit = [...activeHabits, ...archivedHabits].find(h => h.id === selectedId) ?? null
  const isCurrentMonth = selectedMonth === currentMonthStr()
  const isOverallCurrentMonth = overallMonth === currentMonthStr()

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <div className="d-flex align-items-center px-4 py-3 border-bottom bg-white">
        <span className="fw-semibold">Goal Data</span>

        {/* Toggle */}
        <div className="d-flex gap-2 mx-auto">
          <button
            className={`btn btn-sm ${viewMode === 'overall' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleToggle('overall')}
          >
            Overall
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'individual' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => handleToggle('individual')}
          >
            Individual
          </button>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('dashboard')}
        >
          ← Back
        </button>
      </div>

      {/* Body */}
      {noHabits ? (
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <p className="text-muted">No habits yet — go create one</p>
        </div>
      ) : (
        <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
          {/* Left panel — habit list */}
          <div
            className="border-end bg-light p-3"
            style={{ width: '200px', flexShrink: 0, overflowY: 'auto' }}
          >
            <div className="mb-3">
              <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.7rem' }}>
                Active
              </div>
              {activeHabits.length === 0 ? (
                <span className="text-muted small fst-italic">None</span>
              ) : (
                activeHabits.map(h => (
                  <button
                    key={h.id}
                    className={`btn btn-sm w-100 text-start mb-1 ${
                      viewMode === 'individual' && selectedId === h.id
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    style={viewMode === 'overall' ? { opacity: 0.45, cursor: 'default' } : undefined}
                    disabled={viewMode === 'overall'}
                    onClick={viewMode === 'individual' ? () => setSelectedId(h.id) : undefined}
                  >
                    {h.name}
                  </button>
                ))
              )}
            </div>

            {archivedHabits.length > 0 && (
              <div>
                <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.7rem' }}>
                  Archived
                </div>
                {archivedHabits.map(h => (
                  <button
                    key={h.id}
                    className={`btn btn-sm w-100 text-start mb-1 ${
                      viewMode === 'individual' && selectedId === h.id
                        ? 'btn-secondary'
                        : 'btn-outline-secondary'
                    }`}
                    style={viewMode === 'overall' ? { opacity: 0.45, cursor: 'default' } : undefined}
                    disabled={viewMode === 'overall'}
                    onClick={viewMode === 'individual' ? () => setSelectedId(h.id) : undefined}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center panel — calendar */}
          <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
            {/* Month navigation */}
            {viewMode === 'overall' && (
              <div className="d-flex align-items-center gap-2 mb-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setOverallMonth(m => shiftMonth(m, -1))}
                >
                  ←
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={overallMonth >= currentMonthStr()}
                  onClick={() => setOverallMonth(m => shiftMonth(m, 1))}
                >
                  →
                </button>
              </div>
            )}
            {viewMode === 'individual' && (
              <div className="d-flex align-items-center gap-2 mb-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedMonth(m => shiftMonth(m, -1))}
                >
                  ←
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={selectedMonth >= currentMonthStr()}
                  onClick={() => setSelectedMonth(m => shiftMonth(m, 1))}
                >
                  →
                </button>
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            {/* Overall calendar */}
            {viewMode === 'overall' && (
              overallLoading
                ? <span className="text-muted small">Loading...</span>
                : overallSummary && (
                  <HabitCalendarGrid
                    mode="overall"
                    overallBreakdown={overallSummary.daily_breakdown}
                    month={overallMonth}
                  />
                )
            )}

            {/* Individual calendar */}
            {viewMode === 'individual' && (
              summaryLoading
                ? <span className="text-muted small">Loading...</span>
                : summary && selectedHabit && (
                  <HabitCalendarGrid
                    mode="individual"
                    dailyBreakdown={summary.daily_breakdown}
                    month={summary.month}
                    habitCreatedAt={selectedHabit.created_at.slice(0, 10)}
                    isCurrentMonth={isCurrentMonth}
                  />
                )
            )}
          </div>

          {/* Right panel — metrics */}
          <div
            className="border-start p-3"
            style={{ width: '240px', flexShrink: 0, overflowY: 'auto' }}
          >
            {viewMode === 'overall' && overallSummary && !overallLoading && (
              <HabitMetricsPanel mode="overall" summary={overallSummary} isCurrentMonth={isOverallCurrentMonth} />
            )}
            {viewMode === 'individual' && summary && !summaryLoading && (
              <HabitMetricsPanel
                mode="individual"
                summary={summary}
                isCurrentMonth={isCurrentMonth}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
