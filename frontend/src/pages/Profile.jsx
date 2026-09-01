/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Profile() {
  const { user, fetchUser } = useAuth()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [sessions, setSessions] = useState([])
  const [activity, setActivity] = useState([])

  const loadSessions = useCallback(async () => {
    try {
      const res = await api.get('/users/me/sessions')
      if (res.data.success) setSessions(res.data.sessions)
    } catch (err) {
      console.error('Sessions error:', err)
    }
  }, [])

  const loadActivity = useCallback(async () => {
    try {
      const res = await api.get('/users/me/activity?limit=10')
      if (res.data.success) setActivity(res.data.events)
    } catch (err) {
      console.error('Activity error:', err)
    }
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name)
      loadSessions()
      loadActivity()
    }
  }, [user, loadSessions, loadActivity])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await api.put('/users/me', { name })
      if (res.data.success) {
        setMessage('Profile updated!')
        setEditing(false)
        fetchUser()
      }
    } catch {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-3)' }}>Loading profile...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '32px' }}>Profile</h1>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '32px', marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#fff'
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>{user.name}</h2>
              <p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>{user.email}</p>
              <span style={{
                fontSize: '.7rem', fontWeight: 600, padding: '2px 10px', borderRadius: '100px',
                background: user.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'var(--accent-dim)',
                color: user.role === 'admin' ? '#f59e0b' : 'var(--accent)'
              }}>
                {user.role}
              </span>
            </div>
          </div>

          {message && (
            <div style={{
              background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              color: message.includes('Failed') ? '#ef4444' : '#10b981',
              padding: '10px 14px', borderRadius: 'var(--radius-xs)', fontSize: '.85rem', marginBottom: '16px'
            }}>
              {message}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
              Name
            </label>
            {editing ? (
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)', background: 'var(--bg-2)',
                  color: 'var(--text)', fontSize: '.9rem', fontFamily: 'var(--ff)', outline: 'none'
                }}
              />
            ) : (
              <div style={{ padding: '10px 0', fontSize: '.9rem', color: 'var(--text)' }}>{user.name}</div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>
              Email
            </label>
            <div style={{ padding: '10px 0', fontSize: '.9rem', color: 'var(--text-3)' }}>{user.email}</div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Joined</div>
              <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Last Login</div>
              <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Sessions</div>
              <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{user.totalSessions}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); setName(user.name) }} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {sessions.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '24px'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>Active Sessions</h3>
            </div>
            {sessions.map(s => (
              <div key={s._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>
                  {s.browser} on {s.os} ({s.device})
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                  Last active: {new Date(s.lastActivity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {activity.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>Recent Activity</h3>
            </div>
            {activity.map(e => (
              <div key={e._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.success !== false ? 'var(--accent)' : '#ef4444', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{e.eventName}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{new Date(e.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
