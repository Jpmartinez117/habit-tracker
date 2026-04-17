import type { LoginRequest, RegisterRequest, UserResponse } from '../types/auth'

const BASE_URL = 'http://localhost:8000'
const TOKEN_KEY = 'access_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function handleUnauthorized(): never {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event('auth:logout'))
  throw new Error('Unauthorized')
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(data: LoginRequest): Promise<void> {
  // The backend uses OAuth2PasswordRequestForm which requires application/x-www-form-urlencoded,
  // not JSON. The "username" field carries the email address — this is a FastAPI convention.
  const body = new URLSearchParams()
  body.append('username', data.email)
  body.append('password', data.password)

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Login failed')
  }

  const json = await res.json()
  localStorage.setItem(TOKEN_KEY, json.access_token)
}

export async function logout(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY)
  await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
}

export async function getMe(): Promise<UserResponse> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(),
  })
  if (res.status === 401) handleUnauthorized()
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
