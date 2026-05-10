import type { HabitLogRequest, HabitLogResponse, HabitSummaryResponse, MoodLogRequest, MoodLogResponse, OverallSummaryResponse } from '../types/log'
import { authHeaders, handleUnauthorized, fetchWithTimeout } from './authService'

const BASE_URL = 'http://localhost:8000'

export async function getTodayHabitLogs(): Promise<HabitLogResponse[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/habit-logs/today`, {
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to fetch today\'s habit logs')
  return res.json()
}

export async function getTodayMoodLog(): Promise<MoodLogResponse | null> {
  const res = await fetchWithTimeout(`${BASE_URL}/mood-logs/today`, {
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to fetch today\'s mood log')
  return res.json()
}

export async function logHabit(data: HabitLogRequest): Promise<HabitLogResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/habit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to log habit')
  }
  return res.json()
}

export async function deleteHabitLog(habitId: number, logDate: string): Promise<void> {
  const res = await fetchWithTimeout(`${BASE_URL}/habit-logs/${habitId}/${logDate}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to delete habit log')
}

export async function getHabitSummary(habitId: number, month?: string): Promise<HabitSummaryResponse> {
  const url = month
    ? `${BASE_URL}/habit-logs/${habitId}/summary?month=${month}`
    : `${BASE_URL}/habit-logs/${habitId}/summary`
  const res = await fetchWithTimeout(url, { headers: authHeaders() })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to fetch habit summary')
  return res.json()
}

export async function getOverallSummary(month?: string): Promise<OverallSummaryResponse> {
  const url = month
    ? `${BASE_URL}/habit-logs/overall/summary?month=${month}`
    : `${BASE_URL}/habit-logs/overall/summary`
  const res = await fetchWithTimeout(url, { headers: authHeaders() })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to fetch overall summary')
  return res.json()
}

export async function logMood(data: MoodLogRequest): Promise<MoodLogResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/mood-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to log mood')
  }
  return res.json()
}
