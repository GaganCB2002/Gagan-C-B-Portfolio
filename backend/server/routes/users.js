import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { findUserById, updateUser } from '../store.js'

const router = express.Router()

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

router.put('/me', authenticate, (req, res) => {
  try {
    const updates = {}
    if (req.body.name) updates.name = req.body.name
    if (req.body.avatar) updates.avatar = req.body.avatar
    updateUser(req.user.email, updates)
    res.json({ success: true, message: 'Profile updated' })
  } catch (err) {
    console.error('[Users] Update error:', err)
    res.status(500).json({ success: false, error: 'Update failed' })
  }
})

export default router
