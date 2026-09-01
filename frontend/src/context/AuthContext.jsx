/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      if (res.data.success) {
        setUser(res.data.user)
      } else {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        delete api.defaults.headers.common['Authorization']
      }
    } catch {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token, fetchUser])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.success) {
      if (res.data.requiresVerification) {
        return { success: true, requiresVerification: true, email: res.data.email }
      }
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      setUser(res.data.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      return { success: true }
    }
    return { success: false, error: res.data.error }
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password })
    if (res.data.success) {
      if (res.data.requiresVerification) {
        return { success: true, requiresVerification: true }
      }
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      setUser(res.data.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      return { success: true }
    }
    return { success: false, error: res.data.error }
  }

  async function logout() {
    try {
      if (token) {
        await api.post('/auth/logout')
      }
    } catch {
      // Continue with logout
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
