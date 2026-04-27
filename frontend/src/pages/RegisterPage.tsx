import { useState } from 'react'
import { register } from '../services/authService'
import type { Page } from '../App'

interface Props {
  navigate: (page: Page) => void
}

export default function RegisterPage({ navigate }: Props) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const usernameTooShort = username.length > 0 && username.length < 3
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  function handleChange<T>(setter: (v: T) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value as T)
      setError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register({ username, email, password })
      navigate('login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-4 text-center">Register</h1>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className={`form-control ${usernameTooShort ? 'is-invalid' : ''}`}
                value={username}
                onChange={handleChange(setUsername)}
                required
                minLength={3}
                autoFocus
              />
              {usernameTooShort && (
                <div className="invalid-feedback">Username must be at least 3 characters</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={handleChange(setEmail)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={handleChange(setPassword)}
                required
                minLength={8}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-control ${passwordMismatch ? 'is-invalid' : ''}`}
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword)}
                required
              />
              {passwordMismatch && (
                <div className="invalid-feedback">Passwords do not match</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0 small">
            Already have an account?{' '}
            <button
              className="btn btn-link p-0 small align-baseline"
              onClick={() => navigate('login')}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
