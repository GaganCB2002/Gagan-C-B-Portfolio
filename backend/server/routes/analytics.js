import express from 'express'
import ActivityEvent from '../models/ActivityEvent.js'
import DailyAnalytics from '../models/DailyAnalytics.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.connection?.remoteAddress || '0.0.0.0'
}

function parseUserAgent(ua) {
  let browser = 'Unknown'
  let os = 'Unknown'
  let device = 'Desktop'

  if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) browser = 'Chrome'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Edg/i.test(ua)) browser = 'Edge'
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera'

  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'

  if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile'
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet'

  return { browser, os, device }
}

async function updateDailyAnalytics(eventType, userId = null, visitorId = null, metadata = {}) {
  try {
    const today = new Date().toISOString().split('T')[0]
    let analytics = await DailyAnalytics.findOne({ date: today })
    if (!analytics) {
      analytics = new DailyAnalytics({ date: today })
    }

    switch (eventType) {
      case 'VISIT':
        analytics.totalVisitors += 1
        if (visitorId && !analytics.visitorIds.includes(visitorId)) {
          analytics.uniqueUsers += 1
          analytics.visitorIds.push(visitorId)
        }
        if (userId && !analytics.userIds.some(id => id.toString() === userId.toString())) {
          analytics.userIds.push(userId)
          analytics.uniqueUsers = analytics.userIds.length
        }
        break
      case 'PAGE_VIEW':
        analytics.pageViews += 1
        break
      case 'SESSION_START':
        analytics.sessions += 1
        break
      case 'AUTH_LOGIN':
        analytics.loginCount += 1
        break
      case 'AUTH_LOGOUT':
        analytics.logoutCount += 1
        break
      case 'AUTH_REGISTER':
        analytics.registrationCount += 1
        analytics.newUsers += 1
        break
      case 'FEATURE_USED':
        if (metadata.feature) {
          const current = analytics.featureUsage[metadata.feature] || 0
          analytics.featureUsage[metadata.feature] = current + 1
        }
        break
      case 'ERROR':
        analytics.errorCount += 1
        break
    }

    await analytics.save()
  } catch (err) {
    console.error('[DailyAnalytics] Update error:', err.message)
  }
}

router.post('/events', async (req, res) => {
  try {
    const {
      eventType, eventName, route, metadata,
      visitorId, sessionId
    } = req.body

    if (!eventType || !eventName) {
      return res.status(400).json({ success: false, error: 'eventType and eventName are required' })
    }

    const ip = getClientIp(req)
    const ua = req.headers['user-agent'] || ''
    const { browser, os, device } = parseUserAgent(ua)

    let userId = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken')
        const token = authHeader.split(' ')[1]
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'gagan-portfolio-secret-key-change-in-production')
        userId = decoded.id
      } catch {
        // Continue without userId
      }
    }

    const event = new ActivityEvent({
      userId,
      sessionId: sessionId || '',
      eventType,
      eventName,
      route: route || '',
      metadata: metadata || {},
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device,
      success: metadata?.success !== false
    })

    await event.save()

    await updateDailyAnalytics(eventType, userId, visitorId, metadata)

    res.json({ success: true, id: event._id })
  } catch (err) {
    console.error('[Analytics] Event error:', err)
    res.status(500).json({ success: false, error: 'Failed to record event' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  try {
    const events = await ActivityEvent.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-userAgent -__v')

    const totalEvents = await ActivityEvent.countDocuments({ userId: req.user._id })

    const eventTypeCounts = await ActivityEvent.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    res.json({
      success: true,
      events,
      totalEvents,
      eventTypeCounts
    })
  } catch (err) {
    console.error('[Analytics] Me error:', err)
    res.status(500).json({ success: false, error: 'Failed to load analytics' })
  }
})

export { updateDailyAnalytics }
export default router
