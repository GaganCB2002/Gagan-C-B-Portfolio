import jwt from 'jsonwebtoken'
import { findUserById } from '../store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'gagan-portfolio-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = findUserById(decoded.id)
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or deactivated' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' })
    }
    return res.status(500).json({ success: false, error: 'Authentication error' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }
  next()
}

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      const user = findUserById(decoded.id)
      if (user && user.isActive) {
        req.user = user
      }
    }
  } catch {
    // Continue without auth
  }
  next()
}
