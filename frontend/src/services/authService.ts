import type { LoginRequest, RegisterRequest, UserResponse } from '../types/auth'

const BASE_URL = 'http://localhost:8000'

export async function login(data: LoginRequest): Promise<void> {
  const body = new URLSearchParams()
  body.append('username', data.email)
  body.append('password', data.password)

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'include',
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Login failed')
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getMe(): Promise<UserResponse> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function register(data: RegisterRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Registration failed')
  }
}
