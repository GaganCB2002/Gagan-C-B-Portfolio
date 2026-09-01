import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getAllUsers } from '../store.js'

const router = express.Router()

export function updateDailyAnalytics() {
  // Stub - no-op without MongoDB
}

router.get('/visit', (req, res) => {
  res.json({ success: true, message: 'Visit tracked' })
})

router.get('/user/:id', authenticate, (req, res) => {
  res.json({ success: true, events: [], pagination: { page: 1, pages: 1, total: 0 } })
})

router.get('/summary', authenticate, (req, res) => {
  const users = getAllUsers()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const allLogins = users.flatMap(u => (u.loginHistory || []).map(l => ({ ...l, userName: u.name })))

  res.json({
    success: true,
    summary: {
      totalEvents: allLogins.length,
      todayEvents: allLogins.filter(l => new Date(l.loginAt) >= todayStart).length,
      totalUsers: users.length
    }
  })
})

export default router
