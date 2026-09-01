import express from 'express'
import { generateToken, authenticate } from '../middleware/auth.js'
import {
  findUserByEmail, findUserById, createUser, updateUser,
  comparePasswordSync, getAllUsers, seedAdmin
} from '../store.js'

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

  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'

  if (/Mobile|Android|iPhone/i.test(ua)) device = 'Mobile'
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet'

  return { browser, os, device }
}

seedAdmin()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }

    const existing = findUserByEmail(email)
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' })
    }

    const user = createUser({ name, email, password })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    })
  } catch (err) {
    console.error('[Auth] Register error:', err)
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const user = findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' })
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > Date.now()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - Date.now()) / 60000)
      return res.status(429).json({
        success: false,
        error: `Account locked. Try again in ${remainingMinutes} minutes.`,
        locked: true
      })
    }

    if (user.lockedUntil && new Date(user.lockedUntil) <= Date.now()) {
      updateUser(email, { loginAttempts: 0, lockedUntil: null })
      user.loginAttempts = 0
      user.lockedUntil = null
    }

    const isMatch = comparePasswordSync(password, user.password)
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1
      const updates = { loginAttempts: attempts }

      if (attempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      }

      updateUser(email, updates)

      const remainingAttempts = 5 - attempts
      if (remainingAttempts > 0) {
        return res.status(401).json({
          success: false,
          error: `Invalid credentials. ${remainingAttempts} attempts remaining.`
        })
      } else {
        return res.status(429).json({
          success: false,
          error: 'Account locked due to too many failed attempts. Try again in 4 hours.',
          locked: true
        })
      }
    }

    updateUser(email, {
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalSessions: (user.totalSessions || 0) + 1,
      $pushLoginHistory: {
        loginAt: new Date().toISOString(),
        ipAddress: getClientIp(req),
        ...parseUserAgent(req.headers['user-agent'] || ''),
        success: true
      }
    })

    const updatedUser = findUserByEmail(email)
    const loginRecord = {
      loginAt: new Date().toISOString(),
      ipAddress: getClientIp(req),
      ...parseUserAgent(req.headers['user-agent'] || ''),
      success: true
    }
    const history = [...(updatedUser.loginHistory || []), loginRecord].slice(-20)
    updateUser(email, { loginHistory: history })

    const token = generateToken(user.id)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: new Date().toISOString(),
        loginHistory: history
      }
    })
  } catch (err) {
    console.error('[Auth] Login error:', err)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' })
    }

    const user = findUserByEmail(email)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Account already verified' })
    }

    if (!user.otp || user.otp !== otp || new Date(user.otpExpires) < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' })
    }

    updateUser(email, { isVerified: true, otp: null, otpExpires: null })

    res.json({ success: true, message: 'Email verified successfully' })
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err)
    res.status(500).json({ success: false, error: 'Verification failed' })
  }
})

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' })
    }

    const user = findUserByEmail(email)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Account already verified' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    updateUser(email, { otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString() })

    res.json({ success: true, message: 'OTP resent successfully' })
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err)
    res.status(500).json({ success: false, error: 'Failed to resend OTP' })
  }
})

router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

router.get('/me', authenticate, (req, res) => {
  const user = findUserById(req.user.id)
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastActive: user.lastActive,
      totalSessions: user.totalSessions || 0,
      totalVisits: user.totalVisits || 0,
      loginHistory: user.loginHistory || []
    }
  })
})

export default router
