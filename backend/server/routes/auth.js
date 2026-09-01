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

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      await new ActivityEvent({
        eventType: 'AUTH_FAILURE',
        eventName: 'Failed login attempt',
        route: '/login',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || '',
        success: false,
        metadata: { email }
      }).save()

      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

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
      metadata: { email }
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
        lastLogin: user.lastLogin
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

router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
      lastActive: req.user.lastActive,
      totalSessions: req.user.totalSessions,
      totalVisits: req.user.totalVisits
    }
  })
})

export default router
