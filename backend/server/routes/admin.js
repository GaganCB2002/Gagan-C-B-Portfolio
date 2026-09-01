import express from 'express'
import User from '../models/User.js'
import Session from '../models/Session.js'
import ActivityEvent from '../models/ActivityEvent.js'
import DailyAnalytics from '../models/DailyAnalytics.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)
router.use(requireAdmin)

router.get('/analytics/summary', async (req, res) => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeToday,
      activeWeek,
      activeMonth,
      newToday,
      newWeek,
      newMonth,
      totalSessions,
      todaySessions,
      todayEvents,
      todayPageViews,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ lastActive: { $gte: todayStart } }),
      User.countDocuments({ lastActive: { $gte: weekAgo } }),
      User.countDocuments({ lastActive: { $gte: monthAgo } }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: monthAgo } }),
      Session.countDocuments({ isActive: true }),
      Session.countDocuments({ createdAt: { $gte: todayStart } }),
      ActivityEvent.countDocuments({ createdAt: { $gte: todayStart } }),
      ActivityEvent.countDocuments({ eventType: 'PAGE_VIEW', createdAt: { $gte: todayStart } }),
      ActivityEvent.find().sort({ createdAt: -1 }).limit(10).select('-userAgent -__v')
    ])

    const todayAnalytics = await DailyAnalytics.findOne({
      date: todayStart.toISOString().split('T')[0]
    })

    res.json({
      success: true,
      summary: {
        totalUsers,
        activeToday,
        activeWeek,
        activeMonth,
        newToday,
        newWeek,
        newMonth,
        totalSessions,
        todaySessions,
        todayEvents,
        todayPageViews,
        todayVisitors: todayAnalytics?.totalVisitors || 0,
        todayLogins: todayAnalytics?.loginCount || 0,
        todayRegistrations: todayAnalytics?.registrationCount || 0,
        todayErrors: todayAnalytics?.errorCount || 0
      },
      recentActivity
    })
  } catch (err) {
    console.error('[Admin] Summary error:', err)
    res.status(500).json({ success: false, error: 'Failed to load summary' })
  }
})

router.get('/analytics/daily', async (req, res) => {
  try {
    const { startDate, endDate, days = 30 } = req.query

    let start, end
    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
    } else {
      end = new Date()
      start = new Date(end - parseInt(days) * 24 * 60 * 60 * 1000)
    }

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    const analytics = await DailyAnalytics.find({
      date: { $gte: startStr, $lte: endStr }
    }).sort({ date: 1 })

    const dateMap = {}
    analytics.forEach(a => { dateMap[a.date] = a })

    const result = []
    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      const data = dateMap[dateStr]
      result.push({
        date: dateStr,
        totalVisitors: data?.totalVisitors || 0,
        uniqueUsers: data?.uniqueUsers || 0,
        activeUsers: data?.activeUsers || 0,
        newUsers: data?.newUsers || 0,
        returningUsers: data?.returningUsers || 0,
        sessions: data?.sessions || 0,
        pageViews: data?.pageViews || 0,
        loginCount: data?.loginCount || 0,
        logoutCount: data?.logoutCount || 0,
        registrationCount: data?.registrationCount || 0,
        errorCount: data?.errorCount || 0,
        featureUsage: data?.featureUsage || {}
      })
      current.setDate(current.getDate() + 1)
    }

    res.json({ success: true, daily: result })
  } catch (err) {
    console.error('[Admin] Daily analytics error:', err)
    res.status(500).json({ success: false, error: 'Failed to load daily analytics' })
  }
})

router.get('/analytics/activity', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit
    const { eventType, userId, startDate, endDate } = req.query

    const filter = {}
    if (eventType) filter.eventType = eventType
    if (userId) filter.userId = userId
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z')
    }

    const events = await ActivityEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .select('-userAgent -__v')

    const total = await ActivityEvent.countDocuments(filter)

    res.json({
      success: true,
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('[Admin] Activity error:', err)
    res.status(500).json({ success: false, error: 'Failed to load activity' })
  }
})

router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const { search, sort = '-createdAt', role, status } = req.query

    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (role) filter.role = role
    if (status === 'active') filter.isActive = true
    if (status === 'inactive') filter.isActive = false

    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('[Admin] Users list error:', err)
    res.status(500).json({ success: false, error: 'Failed to load users' })
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v')
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    const [sessions, totalEvents, eventTypeCounts] = await Promise.all([
      Session.find({ userId: user._id, isActive: true })
        .sort({ lastActivity: -1 })
        .limit(10)
        .select('-token -__v'),
      ActivityEvent.countDocuments({ userId: user._id }),
      ActivityEvent.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ])

    const activeDays = await ActivityEvent.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      { $count: 'total' }
    ])

    const featureUsage = await ActivityEvent.aggregate([
      { $match: { userId: user._id, eventType: 'FEATURE_USED' } },
      { $group: { _id: '$eventName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    res.json({
      success: true,
      user,
      stats: {
        totalEvents,
        activeDays: activeDays[0]?.total || 0,
        totalSessions: sessions.length,
        eventTypeCounts,
        featureUsage
      },
      sessions
    })
  } catch (err) {
    console.error('[Admin] User detail error:', err)
    res.status(500).json({ success: false, error: 'Failed to load user' })
  }
})

router.get('/users/:id/activity', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 30
    const skip = (page - 1) * limit

    const events = await ActivityEvent.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-userAgent -__v')

    const total = await ActivityEvent.countDocuments({ userId: req.params.id })

    res.json({
      success: true,
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('[Admin] User activity error:', err)
    res.status(500).json({ success: false, error: 'Failed to load user activity' })
  }
})

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-__v')

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (err) {
    console.error('[Admin] User status error:', err)
    res.status(500).json({ success: false, error: 'Failed to update user status' })
  }
})

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-__v')

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (err) {
    console.error('[Admin] User role error:', err)
    res.status(500).json({ success: false, error: 'Failed to update user role' })
  }
})

export default router
