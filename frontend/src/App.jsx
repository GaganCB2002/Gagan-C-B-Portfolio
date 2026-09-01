import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { trackVisit, trackPageView } from './services/tracking'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import CodeTerminal from './components/CodeTerminal'
import GitHubStats from './components/GitHubStats'
import Certifications from './components/Certifications'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Loader from './components/Loader'
import BackToTop from './components/BackToTop'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOTP'
import UserDashboard from './pages/UserDashboard'
import AdminDashboardPage from './pages/AdminDashboardPage'
import Profile from './pages/Profile'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-3)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

function PortfolioPage() {
  const [loading, setLoading] = useState(true)
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      trackVisit()
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = ''

      const sections = document.querySelectorAll('section[id]')
      const navLinks = document.querySelectorAll('.nav-links a')
      const activeObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            trackPageView(id)
            navLinks.forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === '#' + id)
            })
          }
        })
      }, { rootMargin: '-40% 0px -50% 0px' })
      sections.forEach(s => activeObs.observe(s))

      const progBar = document.getElementById('progress-bar')
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight
        if (progBar) progBar.style.width = (window.scrollY / h * 100) + '%'
      }
      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        activeObs.disconnect()
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [loading])

  return (
    <>
      <div id="progress-bar" />
      {loading && <Loader onDone={() => setLoading(false)} />}
      <Nav />
      <main>
        <Hero />
        <About />
        <GitHubStats />
        <Experience />
        <Projects />
        <Skills />
        <CodeTerminal />
        <Certifications />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute adminOnly>
          <AdminDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
