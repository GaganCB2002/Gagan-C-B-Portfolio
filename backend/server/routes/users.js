import express from 'express'
import User from '../models/User.js'
import Session from '../models/Session.js'
import ActivityEvent from '../models/ActivityEvent.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
      lastActive: req.user.lastActive,
      totalSessions: req.user.totalSessions,
      totalVisits: req.user.totalVisits
    }
  })
})

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, avatar } = req.body
    const updates = {}
    if (name) updates.name = name
    if (avatar !== undefined) updates.avatar = avatar

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    })
  } catch (err) {
    console.error('[User] Update error:', err)
    res.status(500).json({ success: false, error: 'Update failed' })
  }
})

router.get('/me/activity', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const events = await ActivityEvent.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-userAgent -__v')

    const total = await ActivityEvent.countDocuments({ userId: req.user._id })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const [todayCount, weekCount, monthCount] = await Promise.all([
      ActivityEvent.countDocuments({ userId: req.user._id, createdAt: { $gte: todayStart } }),
      ActivityEvent.countDocuments({ userId: req.user._id, createdAt: { $gte: weekAgo } }),
      ActivityEvent.countDocuments({ userId: req.user._id, createdAt: { $gte: monthAgo } })
    ])

    const featureUsage = await ActivityEvent.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$eventName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    const activeDays = await ActivityEvent.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        }
      },
      { $count: 'total' }
    ])

    res.json({
      success: true,
      stats: {
        todayActivity: todayCount,
        weekActivity: weekCount,
        monthActivity: monthCount,
        totalEvents: total,
        activeDays: activeDays[0]?.total || 0,
        featureUsage
      },
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('[User] Activity error:', err)
    res.status(500).json({ success: false, error: 'Failed to load activity' })
  }
})

router.get('/me/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isActive: true
    })
      .sort({ lastActivity: -1 })
      .select('-token -__v')

    res.json({ success: true, sessions })
  } catch (err) {
    console.error('[User] Sessions error:', err)
    res.status(500).json({ success: false, error: 'Failed to load sessions' })
  }
})

export default router
