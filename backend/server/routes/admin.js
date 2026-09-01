import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { getAllUsers, findUserById, updateUser } from '../store.js'

const router = express.Router()

router.use(authenticate)
router.use(requireAdmin)

router.get('/analytics/summary', (req, res) => {
  try {
    const users = getAllUsers()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const totalUsers = users.length
    const activeToday = users.filter(u => u.lastActive && new Date(u.lastActive) >= todayStart).length
    const newToday = users.filter(u => u.createdAt && new Date(u.createdAt) >= todayStart).length

    const allLogins = users.flatMap(u => (u.loginHistory || []).map(l => ({ ...l, userName: u.name })))
    const recentLogins = allLogins.sort((a, b) => new Date(b.loginAt) - new Date(a.loginAt)).slice(0, 20)
    const todayLogins = allLogins.filter(l => new Date(l.loginAt) >= todayStart).length

    res.json({
      success: true,
      summary: {
        totalUsers,
        activeToday,
        newToday,
        activeWeek: activeToday,
        activeMonth: activeToday,
        totalSessions: users.reduce((sum, u) => sum + (u.totalSessions || 0), 0),
        todaySessions: todayLogins,
        todayEvents: todayLogins,
        todayPageViews: 0,
        todayVisitors: 0,
        todayLogins,
        todayRegistrations: newToday,
        todayErrors: 0
      },
      recentLogins,
      recentActivity: []
    })
  } catch (err) {
    console.error('[Admin] Summary error:', err)
    res.status(500).json({ success: false, error: 'Failed to load summary' })
  }
})

router.get('/analytics/daily', (req, res) => {
  res.json({ success: true, daily: [] })
})

router.get('/analytics/activity', (req, res) => {
  res.json({ success: true, events: [], pagination: { page: 1, pages: 1, total: 0 } })
})

router.get('/users', (req, res) => {
  try {
    const users = getAllUsers()
    const safe = users.map(({ password, ...rest }) => rest)
    res.json({
      success: true,
      users: safe,
      pagination: { page: 1, pages: 1, total: safe.length }
    })
  } catch (err) {
    console.error('[Admin] Users error:', err)
    res.status(500).json({ success: false, error: 'Failed to load users' })
  }
})

router.get('/users/:id', (req, res) => {
  try {
    const user = findUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    const { password, ...safe } = user
    res.json({
      success: true,
      user: safe,
      stats: { totalEvents: 0, activeDays: 0 },
      sessions: []
    })
  } catch (err) {
    console.error('[Admin] User detail error:', err)
    res.status(500).json({ success: false, error: 'Failed to load user' })
  }
})

router.put('/users/:id/status', (req, res) => {
  try {
    const user = findUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    updateUser(user.email, { isActive: req.body.isActive })
    res.json({ success: true, message: 'Status updated' })
  } catch (err) {
    console.error('[Admin] Status error:', err)
    res.status(500).json({ success: false, error: 'Failed to update status' })
  }
})

export default router
