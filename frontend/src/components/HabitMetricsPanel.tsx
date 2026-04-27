import type { DailyHabitBreakdown, DailyOverallBreakdown, HabitSummaryResponse, OverallSummaryResponse } from '../types/log'

type IndividualProps = {
  mode: 'individual'
  summary: HabitSummaryResponse
  isCurrentMonth: boolean
}

type OverallProps = {
  mode: 'overall'
  summary: OverallSummaryResponse
  isCurrentMonth: boolean
}

type Props = IndividualProps | OverallProps

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
      <span className="text-muted small">{label}</span>
      <span className="fw-medium small">{value}</span>
    </div>
  )
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calcCurrentMonthMetrics(breakdown: DailyHabitBreakdown[]) {
  const today = new Date()
  const todayStr = toDateStr(today)

  const daysElapsed = today.getDate()
  const completedCount = breakdown.filter(d => d.date <= todayStr && d.status === 'completed').length
  const missedThisMonth = daysElapsed - completedCount
  const completionPct = +(completedCount / daysElapsed * 100).toFixed(1)

  const dayOfWeek = today.getDay()
  const daysFromMonday = (dayOfWeek + 6) % 7

  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - daysFromMonday)
  const thisMondayStr = toDateStr(thisMonday)

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  const lastMondayStr = toDateStr(lastMonday)

  const lastSunday = new Date(thisMonday)
  lastSunday.setDate(thisMonday.getDate() - 1)
  const lastSundayStr = toDateStr(lastSunday)

  const daysElapsedThisWeek = daysFromMonday + 1

  const thisWeekCompleted = breakdown.filter(
    d => d.date >= thisMondayStr && d.date <= todayStr && d.status === 'completed'
  ).length
  const thisWeekPct = +(thisWeekCompleted / daysElapsedThisWeek * 100).toFixed(1)

  const lastWeekCompleted = breakdown.filter(
    d => d.date >= lastMondayStr && d.date <= lastSundayStr && d.status === 'completed'
  ).length
  const lastWeekPct = +(lastWeekCompleted / 7 * 100).toFixed(1)

  const weekChange = +(thisWeekPct - lastWeekPct).toFixed(1)

  return { completedCount, missedThisMonth, completionPct, thisWeekPct, lastWeekPct, weekChange }
}

function calcOverallWeekMetrics(breakdown: DailyOverallBreakdown[], dailyHabitCount: number) {
  const today = new Date()
  const todayStr = toDateStr(today)
  const dayOfWeek = today.getDay()
  const daysFromMonday = (dayOfWeek + 6) % 7 // Mon=0 ... Sun=6

  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() - daysFromMonday)
  const thisMondayStr = toDateStr(thisMonday)

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  const lastMondayStr = toDateStr(lastMonday)

  const lastSunday = new Date(thisMonday)
  lastSunday.setDate(thisMonday.getDate() - 1)
  const lastSundayStr = toDateStr(lastSunday)

  const daysElapsedThisWeek = daysFromMonday + 1

  const thisWeekCompleted = breakdown
    .filter(d => d.date >= thisMondayStr && d.date <= todayStr)
    .reduce((sum, d) => sum + d.completed, 0)
  const thisWeekDenominator = daysElapsedThisWeek * dailyHabitCount
  const thisWeekPct = thisWeekDenominator > 0
    ? +(thisWeekCompleted / thisWeekDenominator * 100).toFixed(1)
    : 0

  const lastWeekCompleted = breakdown
    .filter(d => d.date >= lastMondayStr && d.date <= lastSundayStr)
    .reduce((sum, d) => sum + d.completed, 0)
  const lastWeekDenominator = 7 * dailyHabitCount
  const lastWeekPct = lastWeekDenominator > 0
    ? +(lastWeekCompleted / lastWeekDenominator * 100).toFixed(1)
    : 0

  const weekChange = +(thisWeekPct - lastWeekPct).toFixed(1)
  return { thisWeekPct, lastWeekPct, weekChange }
}

function calcPastMonthMetrics(breakdown: DailyHabitBreakdown[]) {
  const denominator = breakdown.length
  const completed = breakdown.filter(d => d.status === 'completed').length
  const missed = denominator - completed
  const completionPct = denominator > 0 ? +(completed / denominator * 100).toFixed(1) : 0
  return { completed, missed, completionPct }
}

export default function HabitMetricsPanel(props: Props) {
  if (props.mode === 'overall') {
    const { summary: s, isCurrentMonth } = props

    if (!isCurrentMonth) {
      return (
        <div>
          <h6 className="fw-semibold mb-3">That Month</h6>
          <MetricRow label="Active Daily Goals" value={s.daily_habit_count} />
          <MetricRow label="Completed" value={s.total_completed} />
          <MetricRow label="Missed" value={s.total_missed} />
          <MetricRow label="Completion %" value={`${s.completion_percentage}%`} />
          <MetricRow
            label="Avg Mood"
            value={
              s.average_mood !== null
                ? s.average_mood
                : <span className="text-muted fst-italic">No mood logged</span>
            }
          />
        </div>
      )
    }

    const { thisWeekPct, lastWeekPct, weekChange } =
      calcOverallWeekMetrics(s.daily_breakdown, s.daily_habit_count)
    const sign = weekChange >= 0 ? '+' : ''
    const changeColor = weekChange > 0 ? 'text-success' : weekChange < 0 ? 'text-danger' : ''

    return (
      <div>
        <h6 className="fw-semibold mb-3">This Month</h6>
        <MetricRow label="Active Daily Goals" value={s.daily_habit_count} />
        <MetricRow label="Completed this month" value={s.total_completed} />
        <MetricRow label="Missed this month" value={s.total_missed} />
        <MetricRow label="Completion %" value={`${s.completion_percentage}%`} />
        <MetricRow label="This Week" value={`${thisWeekPct}%`} />
        <MetricRow label="Last Week" value={`${lastWeekPct}%`} />
        <MetricRow
          label="Week Change"
          value={<span className={changeColor}>{sign}{weekChange}%</span>}
        />
        <MetricRow
          label="Avg Mood"
          value={
            s.average_mood !== null
              ? s.average_mood
              : <span className="text-muted fst-italic">No mood logged</span>
          }
        />
      </div>
    )
  }

  // Individual mode
  const { summary, isCurrentMonth } = props

  if (isCurrentMonth) {
    const { completedCount, missedThisMonth, completionPct, thisWeekPct, lastWeekPct, weekChange } =
      calcCurrentMonthMetrics(summary.daily_breakdown)

    const sign = weekChange >= 0 ? '+' : ''
    const changeColor = weekChange > 0 ? 'text-success' : weekChange < 0 ? 'text-danger' : ''

    return (
      <div>
        <h6 className="fw-semibold mb-3">{summary.habit_name}</h6>
        <MetricRow label="Completed this month" value={completedCount} />
        <MetricRow label="Missed this month" value={missedThisMonth} />
        <MetricRow label="Completion %" value={`${completionPct}%`} />
        <MetricRow label="This Week" value={`${thisWeekPct}%`} />
        <MetricRow label="Last Week" value={`${lastWeekPct}%`} />
        <MetricRow
          label="Week Change"
          value={<span className={changeColor}>{sign}{weekChange}%</span>}
        />
        <MetricRow label="Current Streak" value={`${summary.current_streak} days`} />
        <MetricRow label="Days Since Created" value={summary.days_since_created} />
        <MetricRow label="Total Completed" value={summary.total_completed} />
        <MetricRow label="Total Missed" value={summary.total_missed} />
      </div>
    )
  }

  const { completed, missed, completionPct } = calcPastMonthMetrics(summary.daily_breakdown)

  return (
    <div>
      <h6 className="fw-semibold mb-3">{summary.habit_name}</h6>
      <MetricRow label="Completed" value={completed} />
      <MetricRow label="Missed" value={missed} />
      <MetricRow label="Completion %" value={`${completionPct}%`} />
    </div>
  )
}
