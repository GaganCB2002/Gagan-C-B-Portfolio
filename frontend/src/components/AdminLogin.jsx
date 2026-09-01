import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('admin_token', data.token)
        onLogin(data.token)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Could not connect to server')
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
        borderRadius: 'var(--radius)', padding: '40px', width: '100%', maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>
          Admin Login
        </h2>
        <p style={{ fontSize: '.85rem', color: 'var(--text-3)', marginBottom: '28px' }}>
          Enter credentials to view visitor details
        </p>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px',
            borderRadius: 'var(--radius-xs)', fontSize: '.85rem', marginBottom: '16px'
          }}>{error}</div>
        )}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
            Username
          </label>
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)}
            required autoFocus
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
            required
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
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
