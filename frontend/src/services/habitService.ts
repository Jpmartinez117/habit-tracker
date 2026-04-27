import type { Habit, CreateHabitRequest, UpdateHabitRequest } from '../types/habit'
import { authHeaders, handleUnauthorized, fetchWithTimeout } from './authService'

const BASE_URL = 'http://localhost:8000'

export async function getHabits(): Promise<Habit[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/habits`, {
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to fetch habits')
  return res.json()
}

export async function getArchivedHabits(): Promise<Habit[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/habits/archived`, {
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) throw new Error('Failed to fetch archived habits')
  return res.json()
}

export async function createHabit(data: CreateHabitRequest): Promise<Habit> {
  const res = await fetchWithTimeout(`${BASE_URL}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to create habit')
  }
  return res.json()
}

export async function updateHabit(id: number, data: UpdateHabitRequest): Promise<Habit> {
  const res = await fetchWithTimeout(`${BASE_URL}/habits/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to update habit')
  }
  return res.json()
}

export async function archiveHabit(id: number): Promise<Habit> {
  const res = await fetchWithTimeout(`${BASE_URL}/habits/${id}/archive`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to archive habit')
  }
  return res.json()
}

export async function restoreHabit(id: number): Promise<Habit> {
  const res = await fetchWithTimeout(`${BASE_URL}/habits/${id}/restore`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to restore habit')
  }
  return res.json()
}
