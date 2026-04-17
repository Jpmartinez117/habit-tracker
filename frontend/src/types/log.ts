export interface HabitLogRequest {
  habit_id: number
  log_date: string
  status: 'completed' | 'missed'
  notes?: string
}

export interface HabitLogResponse {
  id: number
  habit_id: number
  log_date: string
  status: string
  notes: string | null
  created_at: string
}

export interface MoodLogRequest {
  log_date: string
  mood_score: number
  notes?: string
}

export interface MoodLogResponse {
  id: number
  user_id: number
  log_date: string
  mood_score: number
  mood_label: string | null
  notes: string | null
  created_at: string
}

export interface DailyOverallBreakdown {
  date: string
  completed: number
  total_daily_habits: number
  percentage: number
}

export interface OverallSummaryResponse {
  month: string
  daily_habit_count: number
  total_completed: number
  total_missed: number
  completion_percentage: number
  this_week_percentage: number | null
  last_week_percentage: number | null
  week_change: number | null
  average_mood: number | null
  daily_breakdown: DailyOverallBreakdown[]
}

export interface DailyHabitBreakdown {
  date: string
  status: 'completed' | 'missed' | 'not_logged'
}

export interface HabitSummaryResponse {
  habit_id: number
  habit_name: string
  frequency: string
  is_archived: boolean
  month: string
  days_since_created: number
  total_completed: number
  total_missed: number
  completion_percentage: number
  this_week_percentage: number
  last_week_percentage: number
  week_change: number
  current_streak: number
  daily_breakdown: DailyHabitBreakdown[]
}
