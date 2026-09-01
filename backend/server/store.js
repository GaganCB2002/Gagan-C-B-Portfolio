import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return []
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  } catch { return [] }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

export function findUserByEmail(email) {
  const users = readUsers()
  return users.find(u => u.email === email.toLowerCase()) || null
}

export function findUserById(id) {
  const users = readUsers()
  return users.find(u => u.id === id) || null
}

export function createUser({ name, email, password, role = 'user', isVerified = false }) {
  const users = readUsers()
  const existing = users.find(u => u.email === email.toLowerCase())
  if (existing) throw new Error('Email already registered')

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  const hashedPassword = bcrypt.hashSync(password, 12)

  const user = {
    id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    isVerified,
    isActive: true,
    lastLogin: null,
    lastActive: new Date().toISOString(),
    totalSessions: 0,
    totalVisits: 0,
    loginAttempts: 0,
    lockedUntil: null,
    loginHistory: [],
    createdAt: new Date().toISOString()
  }

  users.push(user)
  writeUsers(users)
  return user
}

export function updateUser(email, updates) {
  const users = readUsers()
  const idx = users.findIndex(u => u.email === email.toLowerCase())
  if (idx === -1) return null
  Object.assign(users[idx], updates)
  writeUsers(users)
  return users[idx]
}

export function comparePasswordSync(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword)
}

export function getAllUsers() {
  return readUsers()
}

export function seedAdmin() {
  const users = readUsers()
  const exists = users.find(u => u.email === 'gagancb2002@gmail.com')
  if (!exists) {
    createUser({
      name: 'Gagan C B',
      email: 'gagancb2002@gmail.com',
      password: 'Gagan@2002@2026',
      role: 'admin',
      isVerified: true
    })
    console.log('[FALLBACK] Admin user seeded')
  }
}
