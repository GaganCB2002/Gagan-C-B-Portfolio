import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../services/tracking'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        if (result.requiresVerification) {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
        } else {
          await trackEvent('AUTH_LOGIN', 'User logged in')
          navigate('/dashboard')
        }
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not connect to server'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '40px', width: '100%', maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>
          Welcome Back
        </h2>
        <p style={{ fontSize: '.85rem', color: 'var(--text-3)', marginBottom: '28px' }}>
          Sign in to access your dashboard
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px',
            borderRadius: 'var(--radius-xs)', fontSize: '.85rem', marginBottom: '16px',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required autoFocus placeholder="you@example.com"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)', background: 'var(--bg-2)',
              color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--ff)',
              outline: 'none', transition: 'border .3s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            required placeholder="Enter your password"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)', background: 'var(--bg-2)',
              color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--ff)',
              outline: 'none', transition: 'border .3s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

      </form>
    </div>
  )
}
