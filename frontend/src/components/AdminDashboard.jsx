import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminDashboard({ token, onLogout }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVisitors()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchVisitors() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/visitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401) {
        sessionStorage.removeItem('admin_token')
        onLogout()
        return
      }
      const data = await res.json()
      setVisitors(data)
    } catch {
      setError('Failed to load visitor data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
              Visitor Details
            </h1>
            <p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
              Auto-detected from browser — {visitors.length} visitor{visitors.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchVisitors} className="btn btn-ghost btn-sm">
              Refresh
            </button>
            <button onClick={() => { sessionStorage.removeItem('admin_token'); onLogout() }} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px 16px',
            borderRadius: 'var(--radius-xs)', fontSize: '.85rem', marginBottom: '20px'
          }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
            Loading...
          </div>
        ) : visitors.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0', color: 'var(--text-3)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No visitors yet</p>
            <p style={{ fontSize: '.85rem' }}>Visitor data will appear here when people visit your portfolio.</p>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Browser</th>
                  <th style={thStyle}>Version</th>
                  <th style={thStyle}>OS</th>
                  <th style={thStyle}>Device</th>
                  <th style={thStyle}>Screen</th>
                  <th style={thStyle}>From</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Visited</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr key={v.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: '100px',
                        fontSize: '.78rem', fontWeight: 600,
                        background: browserColor(v.browser).bg,
                        color: browserColor(v.browser).text
                      }}>
                        {v.browser}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '.82rem', color: 'var(--text-3)' }}>
                      {v.browserVersion || '—'}
                    </td>
                    <td style={tdStyle}>
                      <DeviceIcon type="os" />
                      {' '}{v.os}
                    </td>
                    <td style={tdStyle}>
                      <DeviceIcon type="device" />
                      {' '}{v.device}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '.82rem', color: 'var(--text-3)' }}>
                      {v.screen || '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '.82rem', color: 'var(--text-3)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.referrer === 'Direct' ? <span style={{ color: 'var(--text-3)' }}>Direct</span> : v.referrer}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontSize: '.8rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {formatDate(v.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle = {
  padding: '12px 16px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.08em', color: 'var(--text-3)', textAlign: 'left', whiteSpace: 'nowrap'
}

const tdStyle = {
  padding: '14px 16px', fontSize: '.85rem', color: 'var(--text)'
}

function browserColor(name) {
  const map = {
    'Chrome': { bg: 'rgba(66,133,244,0.12)', text: '#4285f4' },
    'Firefox': { bg: 'rgba(255,105,20,0.12)', text: '#ff6914' },
    'Brave': { bg: 'rgba(251,86,43,0.12)', text: '#fb562b' },
    'Edge': { bg: 'rgba(0,120,212,0.12)', text: '#0078d4' },
    'Safari': { bg: 'rgba(0,125,253,0.12)', text: '#007dfd' },
    'Opera': { bg: 'rgba(204,0,0,0.12)', text: '#cc0000' },
    'Samsung Internet': { bg: 'rgba(83,129,247,0.12)', text: '#5381f7' },
    'Vivaldi': { bg: 'rgba(232,67,72,0.12)', text: '#e84348' },
    'Yandex Browser': { bg: 'rgba(255,204,0,0.12)', text: '#ffcc00' },
    'UC Browser': { bg: 'rgba(255,165,0,0.12)', text: '#ffa500' }
  }
  return map[name] || { bg: 'var(--accent-dim)', text: 'var(--accent)' }
}

function DeviceIcon({ type }) {
  const s = { width: '14px', height: '14px', verticalAlign: 'middle', marginRight: '4px', opacity: 0.5 }
  if (type === 'os') {
    return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    )
  }
  return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/>
    </svg>
  )
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}
