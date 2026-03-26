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
