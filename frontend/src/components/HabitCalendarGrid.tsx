import type { DailyHabitBreakdown, DailyOverallBreakdown } from '../types/log'

type IndividualProps = {
  mode: 'individual'
  dailyBreakdown: DailyHabitBreakdown[]
  month: string
  habitCreatedAt: string
  isCurrentMonth: boolean
}

type OverallProps = {
  mode: 'overall'
  overallBreakdown: DailyOverallBreakdown[]
  month: string
}

type Props = IndividualProps | OverallProps

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getHeatmapColor = (percentage: number): string => {
  if (percentage === 0) return '#ffffff';
  if (percentage <= 20) return '#e8f5e9';
  if (percentage <= 40) return '#a5d6a7';
  if (percentage <= 60) return '#66bb6a';
  if (percentage <= 80) return '#388e3c';
  if (percentage < 100) return '#2e7d32';
  return '#1b5e20';
};

export default function HabitCalendarGrid(props: Props) {
  const { month } = props
  const [yearStr, monthStr] = month.split('-')
  const year = parseInt(yearStr)
  const monthIndex = parseInt(monthStr) - 1

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay()
  const offset = (firstDayOfWeek + 6) % 7 // Mon=0 ... Sun=6

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const monthHeader =
    new Date(year, monthIndex, 1).toLocaleString('default', { month: 'long' }) + ' ' + yearStr

  // ── Individual mode maps ──
  const statusMap = new Map<string, string>()
  if (props.mode === 'individual') {
    props.dailyBreakdown.forEach(d => statusMap.set(d.date, d.status))
  }

  // ── Overall mode map ──
  const percentageMap = new Map<string, number>()
  if (props.mode === 'overall') {
    props.overallBreakdown.forEach(d => percentageMap.set(d.date, d.percentage))
  }

  return (
    <div>
      <h5 className="mb-3 fw-semibold">{monthHeader}</h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* Day-of-week labels */}
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-muted small fw-semibold py-1">
            {d}
          </div>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`lead-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`

          if (props.mode === 'overall') {
            const isFuture = dateStr > todayStr
            if (isFuture) {
              // Future days — empty placeholder to preserve grid shape
              return (
                <div
                  key={dateStr}
                  className="rounded"
                  style={{ aspectRatio: '1', minHeight: '28px' }}
                />
              )
            }
            const pct = percentageMap.get(dateStr) ?? 0
            const bgColor = getHeatmapColor(pct)
            const isDark = pct > 40
            return (
              <div
                key={dateStr}
                className="rounded d-flex align-items-center justify-content-center"
                style={{
                  aspectRatio: '1',
                  minHeight: '28px',
                  fontSize: '0.65rem',
                  border: '1px solid #e9ecef',
                  backgroundColor: bgColor,
                }}
              >
                <span className={isDark ? '' : 'text-muted'}>{day}</span>
              </div>
            )
          }

          // Individual mode
          const status = statusMap.get(dateStr)
          let cls = 'rounded d-flex align-items-center justify-content-center small fw-medium'
          let showDay = true

          if (props.isCurrentMonth) {
            const isFuture = dateStr > todayStr
            const isBeforeCreation = !isFuture && status === undefined

            if (isBeforeCreation) {
              cls = 'rounded'
              showDay = false
            } else if (isFuture) {
              cls += ' text-muted'
            } else if (status === 'completed') {
              cls += ' bg-success text-white'
            } else if (status === 'missed') {
              cls += ' bg-danger text-white'
            } else {
              cls += ' bg-secondary bg-opacity-25 text-muted'
            }
          } else {
            if (status === 'completed') {
              cls += ' bg-success text-white'
            } else if (status === 'missed') {
              cls += ' bg-danger text-white'
            } else if (status === 'not_logged') {
              cls += ' bg-secondary bg-opacity-25 text-muted'
            } else if (dateStr < props.habitCreatedAt) {
              cls += ' text-muted'
            } else {
              cls += ' bg-secondary bg-opacity-25 text-muted'
            }
          }

          return (
            <div
              key={dateStr}
              className={cls}
              style={{ aspectRatio: '1', minHeight: '36px' }}
            >
              {showDay ? day : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
