/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function UserDashboard() {
  const { user } = useAuth()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.get(`/users/me/activity?page=${page}&limit=20`)
      if (res.data.success) {
        setActivity(res.data)
      }
    } catch (err) {
      console.error('Failed to load activity:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-3)', fontSize: '1rem' }}>Loading dashboard...</div>
      </div>
    )
  }

  const stats = activity?.stats
  const featureData = stats?.featureUsage?.map(f => ({ name: f._id, count: f.count })) || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
            Welcome, {user?.name}!
          </h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>
            Your activity overview
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '32px'
        }}>
          <StatCard label="Today" value={stats?.todayActivity || 0} color="var(--accent)" />
          <StatCard label="This Week" value={stats?.weekActivity || 0} color="var(--accent)" />
          <StatCard label="This Month" value={stats?.monthActivity || 0} color="var(--accent)" />
          <StatCard label="Total Events" value={stats?.totalEvents || 0} color="var(--gold)" />
          <StatCard label="Active Days" value={stats?.activeDays || 0} color="var(--accent-2)" />
        </div>

        {featureData.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '24px', marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
              Feature Usage
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-3)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-3)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '8px', fontSize: '.85rem'
                  }}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
              Recent Activity
            </h3>
          </div>

          {activity?.events?.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
              No activity recorded yet
            </div>
          ) : (
            <div>
              {activity?.events?.map((event) => (
                <div key={event._id} style={{
                  padding: '14px 24px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: event.success ? 'var(--accent)' : '#ef4444',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.85rem', color: 'var(--text)', fontWeight: 500 }}>
                      {event.eventName}
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                      {event.route} &middot; {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '.7rem', fontWeight: 600, padding: '2px 8px',
                    borderRadius: '100px', background: 'var(--accent-dim)', color: 'var(--accent)'
                  }}>
                    {event.eventType}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activity?.pagination?.pages > 1 && (
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost btn-sm"
                style={{ opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ padding: '10px 16px', fontSize: '.85rem', color: 'var(--text-3)' }}>
                Page {page} of {activity?.pagination?.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(activity?.pagination?.pages, p + 1))}
                disabled={page === activity?.pagination?.pages}
                className="btn btn-ghost btn-sm"
                style={{ opacity: page === activity?.pagination?.pages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: color || 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}
