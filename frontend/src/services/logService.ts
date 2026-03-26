import type { HabitLogRequest, HabitLogResponse, MoodLogRequest, MoodLogResponse } from '../types/log'

const BASE_URL = 'http://localhost:8000'

export async function getTodayHabitLogs(): Promise<HabitLogResponse[]> {
  const res = await fetch(`${BASE_URL}/habit-logs/today`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch today\'s habit logs')
  return res.json()
}

export async function getTodayMoodLog(): Promise<MoodLogResponse | null> {
  const res = await fetch(`${BASE_URL}/mood-logs/today`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch today\'s mood log')
  return res.json()
}

export async function logHabit(data: HabitLogRequest): Promise<HabitLogResponse> {
  const res = await fetch(`${BASE_URL}/habit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to log habit')
  }
  return res.json()
}

export async function logMood(data: MoodLogRequest): Promise<MoodLogResponse> {
  const res = await fetch(`${BASE_URL}/mood-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to log mood')
  }
  return res.json()
}
