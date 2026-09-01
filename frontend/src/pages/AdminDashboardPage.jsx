/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
        fontFamily: 'var(--ff-mono)', fontSize: '.9rem', color: 'var(--text)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#10b981', boxShadow: '0 0 8px #10b981',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        <span style={{ fontWeight: 700 }}>{now.toLocaleTimeString('en-US', { hour12: true })}</span>
        <span style={{ color: 'var(--text-3)', fontSize: '.8rem' }}>|</span>
        <span style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }`}</style>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [daily, setDaily] = useState([])
  const [users, setUsers] = useState([])
  const [usersPagination, setUsersPagination] = useState(null)
  const [activity, setActivity] = useState([])
  const [activityPagination, setActivityPagination] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [search, setSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [activityFilter, setActivityFilter] = useState('')

  const loadSummary = useCallback(async () => {
    try {
      const res = await api.get('/admin/analytics/summary')
      if (res.data.success) {
        setSummary({ ...res.data.summary, recentLogins: res.data.recentLogins })
      }
    } catch (err) {
      console.error('Summary error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDaily = useCallback(async () => {
    try {
      let url = `/admin/analytics/daily?days=${dateRange}`
      if (dateRange === 'custom' && customStart && customEnd) {
        url = `/admin/analytics/daily?startDate=${customStart}&endDate=${customEnd}`
      }
      const res = await api.get(url)
      if (res.data.success) setDaily(res.data.daily)
    } catch (err) {
      console.error('Daily error:', err)
    }
  }, [dateRange, customStart, customEnd])

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users?page=${userPage}&limit=20&search=${search}`)
      if (res.data.success) {
        setUsers(res.data.users)
        setUsersPagination(res.data.pagination)
      }
    } catch (err) {
      console.error('Users error:', err)
    }
  }, [userPage, search])

  const loadActivity = useCallback(async () => {
    try {
      let url = `/admin/analytics/activity?page=${activityPage}&limit=30`
      if (activityFilter) url += `&eventType=${activityFilter}`
      const res = await api.get(url)
      if (res.data.success) {
        setActivity(res.data.events)
        setActivityPagination(res.data.pagination)
      }
    } catch (err) {
      console.error('Activity error:', err)
    }
  }, [activityPage, activityFilter])

  const loadUserDetail = useCallback(async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`)
      if (res.data.success) {
        setUserDetail(res.data)
        setTab('user-detail')
      }
    } catch (err) {
      console.error('User detail error:', err)
    }
  }, [])

  const toggleUserStatus = useCallback(async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive })
      loadUsers()
    } catch (err) {
      console.error('Status update error:', err)
    }
  }, [loadUsers])

  useEffect(() => {
    loadSummary()
    loadDaily()
  }, [loadSummary, loadDaily])

  useEffect(() => {
    if (tab === 'users') loadUsers()
  }, [tab, loadUsers])

  useEffect(() => {
    if (tab === 'activity') loadActivity()
  }, [tab, loadActivity])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-3)' }}>Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>Admin Dashboard</h1>
          <p style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Welcome, {user?.name}</p>
        </div>
        <LiveClock />
        <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
        <div style={{
          width: '220px', background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
          padding: '16px 0', flexShrink: 0
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'daily', label: 'Daily Analytics', icon: '📈' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'activity', label: 'Activity Log', icon: '📝' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setUserDetail(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '10px 20px', border: 'none', background: tab === item.id ? 'var(--accent-dim)' : 'transparent',
                color: tab === item.id ? 'var(--accent)' : 'var(--text-2)',
                fontSize: '.85rem', fontWeight: tab === item.id ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--ff)',
                borderRight: tab === item.id ? '2px solid var(--accent)' : '2px solid transparent'
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {tab === 'overview' && <OverviewTab summary={summary} />}
          {tab === 'daily' && (
            <DailyTab
              daily={daily} dateRange={dateRange} setDateRange={setDateRange}
              customStart={customStart} setCustomStart={setCustomStart}
              customEnd={customEnd} setCustomEnd={setCustomEnd}
            />
          )}
          {tab === 'users' && (
            <UsersTab
              users={users} pagination={usersPagination} search={search} setSearch={setSearch}
              userPage={userPage} setUserPage={setUserPage}
              onViewUser={loadUserDetail} onToggleStatus={toggleUserStatus}
            />
          )}
          {tab === 'activity' && (
            <ActivityTab
              events={activity} pagination={activityPagination}
              activityPage={activityPage} setActivityPage={setActivityPage}
              filter={activityFilter} setFilter={setActivityFilter}
            />
          )}
          {tab === 'user-detail' && userDetail && (
            <UserDetailTab userDetail={userDetail} onBack={() => setTab('users')} />
          )}
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ summary }) {
  if (!summary) return <div style={{ color: 'var(--text-3)' }}>Loading...</div>

  const cards = [
    { label: 'Total Users', value: summary.totalUsers, color: '#3b82f6' },
    { label: 'Active Today', value: summary.activeToday, color: '#10b981' },
    { label: 'New Today', value: summary.newToday, color: '#f59e0b' },
    { label: 'Active This Week', value: summary.activeWeek, color: '#8b5cf6' },
    { label: 'Active This Month', value: summary.activeMonth, color: '#ec4899' },
    { label: 'Total Sessions', value: summary.totalSessions, color: '#06b6d4' },
    { label: 'Events Today', value: summary.todayEvents, color: '#3b82f6' },
    { label: 'Logins Today', value: summary.todayLogins, color: '#10b981' }
  ]

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>
        Overview
      </h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {summary.recentLogins?.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '24px'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>Recent Login History</h3>
            <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Last 20 logins</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                {['User', 'Date & Time', 'IP Address', 'Browser', 'OS', 'Device', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.recentLogins.map((login, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontSize: '.82rem', color: 'var(--text)', fontWeight: 500 }}>{login.userName || 'Unknown'}</td>
                  <td style={{ padding: '10px 16px', fontSize: '.8rem', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                    {new Date(login.loginAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '.8rem', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>
                    {login.ipAddress}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '.82rem', color: 'var(--text-2)' }}>{login.browser}</td>
                  <td style={{ padding: '10px 16px', fontSize: '.82rem', color: 'var(--text-2)' }}>{login.os}</td>
                  <td style={{ padding: '10px 16px', fontSize: '.82rem', color: 'var(--text-2)' }}>{login.device}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      fontSize: '.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
                      background: login.success ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: login.success ? '#10b981' : '#ef4444'
                    }}>
                      {login.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary.recentActivity?.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>Recent Activity</h3>
          </div>
          {summary.recentActivity.map((event) => (
            <div key={event._id} style={{
              padding: '12px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: event.success !== false ? 'var(--accent)' : '#ef4444',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.85rem', color: 'var(--text)', fontWeight: 500 }}>
                  {event.eventName}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>
                  {event.userId?.name || 'Anonymous'} &middot; {new Date(event.createdAt).toLocaleString()}
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
    </div>
  )
}

function DailyTab({ daily, dateRange, setDateRange, customStart, setCustomStart, customEnd, setCustomEnd }) {
  const chartData = daily.map(d => ({
    date: d.date.slice(5),
    visitors: d.totalVisitors,
    users: d.uniqueUsers,
    sessions: d.sessions,
    pageViews: d.pageViews,
    logins: d.loginCount,
    registrations: d.registrationCount
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>Daily Analytics</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['7', '14', '30', '90'].map(d => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`btn btn-sm ${dateRange === d ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: '.75rem' }}
            >
              {d}d
            </button>
          ))}
          <input
            type="date" value={customStart} onChange={e => { setCustomStart(e.target.value); setDateRange('custom') }}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: '.75rem' }}
          />
          <span style={{ color: 'var(--text-3)' }}>to</span>
          <input
            type="date" value={customEnd} onChange={e => { setCustomEnd(e.target.value); setDateRange('custom') }}
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: '.75rem' }}
          />
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '24px', marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Visitors & Users</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.85rem' }} />
            <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} dot={false} name="Visitors" />
            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} name="Unique Users" />
            <Line type="monotone" dataKey="sessions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Sessions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '24px', marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Page Views & Logins</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.85rem' }} />
            <Bar dataKey="pageViews" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Page Views" />
            <Bar dataKey="logins" fill="#10b981" radius={[4, 4, 0, 0]} name="Logins" />
            <Bar dataKey="registrations" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Registrations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              {['Date', 'Visitors', 'Unique Users', 'Sessions', 'Page Views', 'Logins', 'Registrations', 'Errors'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...daily].reverse().map((d) => (
              <tr key={d.date} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)', fontWeight: 500 }}>{d.date}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)' }}>{d.totalVisitors}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)' }}>{d.uniqueUsers}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)' }}>{d.sessions}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)' }}>{d.pageViews}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)' }}>{d.loginCount}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)' }}>{d.registrationCount}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: d.errorCount > 0 ? '#ef4444' : 'var(--text)' }}>{d.errorCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab({ users, pagination, search, setSearch, userPage, setUserPage, onViewUser, onToggleStatus }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>Users</h2>
        <input
          type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setUserPage(1) }}
          style={{
            padding: '8px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)',
            background: 'var(--bg-2)', color: 'var(--text)', fontSize: '.85rem', width: '250px'
          }}
        />
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              {['Name', 'Email', 'Role', 'Status', 'Last Active', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text-2)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '.7rem', fontWeight: 600, padding: '2px 10px', borderRadius: '100px',
                    background: u.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'var(--accent-dim)',
                    color: u.role === 'admin' ? '#f59e0b' : 'var(--accent)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '.7rem', fontWeight: 600, padding: '2px 10px', borderRadius: '100px',
                    background: u.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    color: u.isActive ? '#10b981' : '#ef4444'
                  }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '.8rem', color: 'var(--text-3)' }}>
                  {u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Never'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => onViewUser(u._id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 12px', fontSize: '.75rem' }}>
                      View
                    </button>
                    <button onClick={() => onToggleStatus(u._id, u.isActive)} className="btn btn-ghost btn-sm" style={{ padding: '4px 12px', fontSize: '.75rem', color: u.isActive ? '#ef4444' : '#10b981' }}>
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination?.pages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="btn btn-ghost btn-sm" style={{ opacity: userPage === 1 ? 0.5 : 1 }}>
              Previous
            </button>
            <span style={{ padding: '10px 16px', fontSize: '.85rem', color: 'var(--text-3)' }}>
              Page {userPage} of {pagination.pages}
            </span>
            <button onClick={() => setUserPage(p => Math.min(pagination.pages, p + 1))} disabled={userPage === pagination.pages} className="btn btn-ghost btn-sm" style={{ opacity: userPage === pagination.pages ? 0.5 : 1 }}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityTab({ events, pagination, activityPage, setActivityPage, filter, setFilter }) {
  const eventTypes = ['AUTH_LOGIN', 'AUTH_LOGOUT', 'AUTH_REGISTER', 'PAGE_VIEW', 'VISIT', 'FEATURE_USED', 'ERROR']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>Activity Log</h2>
        <select
          value={filter} onChange={e => { setFilter(e.target.value); setActivityPage(1) }}
          style={{
            padding: '8px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)',
            background: 'var(--bg-2)', color: 'var(--text)', fontSize: '.85rem'
          }}
        >
          <option value="">All Events</option>
          {eventTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              {['Event', 'Type', 'User', 'Route', 'Time', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e._id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '.85rem', color: 'var(--text)', fontWeight: 500 }}>{e.eventName}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
                    background: 'var(--accent-dim)', color: 'var(--accent)'
                  }}>
                    {e.eventType}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '.82rem', color: 'var(--text-2)' }}>
                  {e.userId?.name || 'Anonymous'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '.82rem', color: 'var(--text-3)' }}>{e.route}</td>
                <td style={{ padding: '12px 16px', fontSize: '.8rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: e.success !== false ? '#10b981' : '#ef4444'
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination?.pages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setActivityPage(p => Math.max(1, p - 1))} disabled={activityPage === 1} className="btn btn-ghost btn-sm" style={{ opacity: activityPage === 1 ? 0.5 : 1 }}>
              Previous
            </button>
            <span style={{ padding: '10px 16px', fontSize: '.85rem', color: 'var(--text-3)' }}>
              Page {activityPage} of {pagination.pages}
            </span>
            <button onClick={() => setActivityPage(p => Math.min(pagination.pages, p + 1))} disabled={activityPage === pagination.pages} className="btn btn-ghost btn-sm" style={{ opacity: activityPage === pagination.pages ? 0.5 : 1 }}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function UserDetailTab({ userDetail, onBack }) {
  const { user, stats, sessions } = userDetail

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
        &larr; Back to Users
      </button>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)'
          }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{user.name}</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>{user.email}</p>
          </div>
          <span style={{
            fontSize: '.7rem', fontWeight: 600, padding: '4px 12px', borderRadius: '100px',
            background: user.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'var(--accent-dim)',
            color: user.role === 'admin' ? '#f59e0b' : 'var(--accent)',
            marginLeft: 'auto'
          }}>
            {user.role}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Registered</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Last Login</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
          </div>
          <div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Sessions</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{user.totalSessions}</div>
          </div>
          <div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Events</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{stats.totalEvents}</div>
          </div>
          <div>
            <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Active Days</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>{stats.activeDays}</div>
          </div>
        </div>
      </div>

      {sessions?.length > 0 && (
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
                IP: {s.ipAddress} &middot; Last active: {new Date(s.lastActivity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
