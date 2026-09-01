import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'
import geoip from 'geoip-lite'
import mongoose from 'mongoose'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import analyticsRoutes, { updateDailyAnalytics } from './routes/analytics.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'visitors.json')
const app = express()
const PORT = process.env.PORT || 3001

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gagan-portfolio'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('[DB] MongoDB connected'))
  .catch(err => {
    console.error('[DB] MongoDB connection error:', err.message)
    console.log('[DB] Falling back to JSON file storage')
  })

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later' }
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts, please try again in 15 minutes' }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

const DIST_DIR = path.join(__dirname, '..', 'dist')
if (fs.existsSync(DIST_DIR)) {
  app.use((req, res, next) => {
    const blocked = ['/.env', '/.git', '/.git/config', '/.git/HEAD', '/.gitignore', '/node_modules']
    if (blocked.some(p => req.path.startsWith(p))) {
      return res.status(404).json({ error: 'Not found' })
    }
    next()
  })
  app.use(express.static(DIST_DIR))
}

function readVisitors() {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveVisitors(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function getLocation(ip) {
  const geo = geoip.lookup(ip)
  if (!geo) return { city: 'Unknown', region: 'Unknown', country: 'Unknown' }
  return {
    city: geo.city || 'Unknown',
    region: geo.region || 'Unknown',
    country: geo.country || 'Unknown',
    ll: geo.ll || null,
    timezone: geo.timezone || 'Unknown'
  }
}

function buildEmailHtml(visit) {
  const fields = [
    ['IP Address', visit.ip],
    ['City', visit.location?.city],
    ['Region', visit.location?.region],
    ['Country', visit.location?.country],
    ['Browser', visit.browser],
    ['OS', visit.os],
    ['Device', visit.device],
    ['Screen', visit.screen],
    ['Language', visit.language],
    ['Referrer', visit.referrer || 'Direct'],
    ['Pages Visited', visit.pages?.join(', ') || 'Home'],
    ['Time on Site', visit.timeOnSite || 'Still active'],
    ['Visit Time', visit.timestamp]
  ]

  let rows = fields
    .map(([label, val]) => {
      const v = val ?? 'N/A'
      return `<tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:600;background:#f5f5f5">${label}</td><td style="padding:6px 12px;border:1px solid #ddd">${v}</td></tr>`
    })
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h2 style="color:#2563eb">New Portfolio Visitor</h2>
  <table style="border-collapse:collapse;width:100%">${rows}</table>
</body>
</html>`
}

async function sendEmailNotification(visit) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const to = process.env.NOTIFY_EMAIL
  if (!to) return

  try {
    await transporter.sendMail({
      from: `"Portfolio Tracker" <${process.env.SMTP_USER}>`,
      to,
      subject: `New Visitor: ${visit.browser || 'Unknown'} on ${visit.os || 'Unknown'}`,
      html: buildEmailHtml(visit)
    })
  } catch (err) {
    console.error('[EMAIL] Failed:', err.message)
  }
}

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.connection?.remoteAddress || '0.0.0.0'
}

app.post('/api/visit', async (req, res) => {
  try {
    const ip = getClientIp(req)
    const location = getLocation(ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' ? '8.8.8.8' : ip)
    const ua = req.headers['user-agent'] || ''

    const visit = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      ...req.body,
      ip,
      location,
      browser: req.body.browser || 'Unknown',
      os: req.body.os || 'Unknown',
      device: req.body.device || 'Unknown',
      screen: req.body.screen || 'Unknown',
      language: req.body.language || 'Unknown',
      referrer: req.body.referrer || 'Direct',
      pages: req.body.pages || ['Home'],
      timestamp: new Date().toISOString(),
      userAgent: ua
    }

    const visitors = readVisitors()
    visitors.push(visit)
    saveVisitors(visitors)

    await updateDailyAnalytics('VISIT', null, visit.id)

    await new (await import('./models/ActivityEvent.js')).default({
      sessionId: visit.id,
      eventType: 'VISIT',
      eventName: 'Portfolio visited',
      route: req.body.url || '/',
      ipAddress: ip,
      userAgent: ua,
      browser: visit.browser,
      os: visit.os,
      device: visit.device,
      metadata: {
        screen: visit.screen,
        language: visit.language,
        referrer: visit.referrer,
        pages: visit.pages
      }
    }).save()

    sendEmailNotification(visit)

    res.json({ success: true, id: visit.id })
  } catch (err) {
    console.error('[VISIT] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/visit/:id', async (req, res) => {
  try {
    const { id } = req.params
    const visitors = readVisitors()
    const index = visitors.findIndex(v => v.id === id)
    if (index !== -1) {
      visitors[index].timeOnSite = req.body.timeOnSite || visitors[index].timeOnSite
      if (req.body.pages) {
        visitors[index].pages = Array.from(new Set([...(visitors[index].pages || []), ...req.body.pages]))
      }
      saveVisitors(visitors)
      res.json({ success: true })
    } else {
      res.status(404).json({ success: false, error: 'Not found' })
    }
  } catch (err) {
    console.error('[VISIT UPDATE] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/visitors', (req, res) => {
  const visitors = readVisitors()
  res.json(visitors)
})

app.get('/api/visitors/stats', (req, res) => {
  const visitors = readVisitors()
  const total = visitors.length
  const uniqueIps = new Set(visitors.map(v => v.ip)).size
  const today = visitors.filter(v => v.timestamp?.startsWith(new Date().toISOString().slice(0, 10))).length
  res.json({ total, uniqueIps, today })
})

if (fs.existsSync(DIST_DIR)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`)
})
