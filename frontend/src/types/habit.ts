export interface Habit {
  id: number
  user_id: number
  name: string
  description: string | null
  frequency: string
  target_count?: number
  is_archived: boolean
  created_at: string
}

export interface CreateHabitRequest {
  name: string
  frequency: string
  target_count: number
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  frequency?: string
  target_count?: number
}
