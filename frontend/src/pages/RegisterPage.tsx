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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function handleChange(setter: (v: string) => void, field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!username) newErrors.username = 'Username is required'
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters'
    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setLoading(true)
    try {
      await register({ username, email, password })
      navigate('login')
    } catch (err: unknown) {
      setErrors({ server: err instanceof Error ? err.message : 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-4 text-center">Register</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                value={username}
                onChange={handleChange(setUsername, 'username')}
                autoFocus
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={handleChange(setEmail, 'email')}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={handleChange(setPassword, 'password')}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword, 'confirmPassword')}
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            {errors.server && (
              <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
                {errors.server}
              </div>
            )}
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
