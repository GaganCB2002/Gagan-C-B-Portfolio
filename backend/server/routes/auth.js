import express from 'express'
import User from '../models/User.js'
import Session from '../models/Session.js'
import ActivityEvent from '../models/ActivityEvent.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import { sendOTP, sendWelcomeEmail } from '../services/email.js'

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

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' })
    }

    const user = new User({ name, email, password })
    const otp = user.generateOTP()
    await user.save()

    const ip = getClientIp(req)
    const ua = req.headers['user-agent'] || ''
    const { browser, os, device } = parseUserAgent(ua)

    const token = generateToken(user._id)
    const session = new Session({
      userId: user._id,
      token,
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device
    })
    await session.save()

    user.totalSessions += 1
    user.totalVisits += 1
    user.lastLogin = new Date()
    user.lastActive = new Date()
    await user.save()

    await new ActivityEvent({
      userId: user._id,
      sessionId: session._id.toString(),
      eventType: 'AUTH_REGISTER',
      eventName: 'User registered',
      route: '/register',
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device,
      metadata: { email, name }
    }).save()

    await sendOTP(email, otp, name)

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Account created. Please check your email for the verification code.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    })
  } catch (err) {
    console.error('[Auth] Register error:', err)
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires')
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Account already verified' })
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' })
    }

    user.isVerified = true
    user.clearOTP()
    await user.save()

    await sendWelcomeEmail(user.email, user.name)

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    })
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

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Account already verified' })
    }

    const otp = user.generateOTP()
    await user.save()

    await sendOTP(email, otp, user.name)

    res.json({ success: true, message: 'OTP resent successfully' })
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err)
    res.status(500).json({ success: false, error: 'Failed to resend OTP' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +lockedUntil +loginAttempts')
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' })
    }

    // Rate limiting: check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - Date.now()) / 60000)
      return res.status(429).json({
        success: false,
        error: `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        locked: true,
        lockedUntil: user.lockedUntil
      })
    }

    // If lock expired, reset attempts
    if (user.lockedUntil && user.lockedUntil <= Date.now()) {
      user.loginAttempts = 0
      user.lockedUntil = null
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1

      // Lock after 5 failed attempts for 4 hours
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
      }
      await user.save()

      await new ActivityEvent({
        eventType: 'AUTH_FAILURE',
        eventName: 'Failed login attempt',
        route: '/login',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || '',
        success: false,
        metadata: { email, attempts: user.loginAttempts }
      }).save()

      const remainingAttempts = 5 - user.loginAttempts
      if (remainingAttempts > 0) {
        return res.status(401).json({
          success: false,
          error: `Invalid credentials. ${remainingAttempts} attempts remaining.`
        })
      } else {
        return res.status(429).json({
          success: false,
          error: 'Account locked due to too many failed attempts. Try again in 4 hours.',
          locked: true,
          lockedUntil: user.lockedUntil
        })
      }
    }

    // Successful login - reset attempts
    user.loginAttempts = 0
    user.lockedUntil = null

    if (!user.isVerified) {
      const otp = user.generateOTP()
      await user.save()
      await sendOTP(email, otp, user.name)

      return res.json({
        success: true,
        requiresVerification: true,
        message: 'Please verify your email first. A new OTP has been sent.',
        email: user.email
      })
    }

    const token = generateToken(user._id)
    const ip = getClientIp(req)
    const ua = req.headers['user-agent'] || ''
    const { browser, os, device } = parseUserAgent(ua)

    const session = new Session({
      userId: user._id,
      token,
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device
    })
    await session.save()

    user.totalSessions += 1
    user.lastLogin = new Date()
    user.lastActive = new Date()

    // Save login history
    user.loginHistory.push({
      loginAt: new Date(),
      ipAddress: ip,
      browser,
      os,
      device,
      success: true
    })
    // Keep only last 20 login records
    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(-20)
    }

    await user.save()

    await new ActivityEvent({
      userId: user._id,
      sessionId: session._id.toString(),
      eventType: 'AUTH_LOGIN',
      eventName: 'User logged in',
      route: '/login',
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device,
      metadata: { email, loginTime: new Date().toISOString() }
    }).save()

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        loginHistory: user.loginHistory
      }
    })
  } catch (err) {
    console.error('[Auth] Login error:', err)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]

    await Session.findOneAndUpdate(
      { token, isActive: true },
      { isActive: false }
    )

    await new ActivityEvent({
      userId: req.user._id,
      sessionId: req.session?._id?.toString() || '',
      eventType: 'AUTH_LOGOUT',
      eventName: 'User logged out',
      route: '/logout',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || ''
    }).save()

    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    console.error('[Auth] Logout error:', err)
    res.status(500).json({ success: false, error: 'Logout failed' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select('+loginAttempts +lockedUntil')
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastActive: user.lastActive,
      totalSessions: user.totalSessions,
      totalVisits: user.totalVisits,
      loginHistory: user.loginHistory || [],
      loginAttempts: user.loginAttempts || 0,
      lockedUntil: user.lockedUntil
    }
  })
})

export default router
