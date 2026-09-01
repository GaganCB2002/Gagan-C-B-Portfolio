/* eslint-disable react-hooks/refs */
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const scrollAnim = useRef(null)
  const cancelHandlers = useRef([])
  const isHome = location.pathname === '/'

  const cleanUpAnimation = () => {
    if (scrollAnim.current) {
      cancelAnimationFrame(scrollAnim.current)
      scrollAnim.current = null
    }
    cancelHandlers.current.forEach(({ type, fn }) => window.removeEventListener(type, fn))
    cancelHandlers.current = []
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cleanUpAnimation()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const slowScrollTo = (e, targetId) => {
    e.preventDefault()
    cleanUpAnimation()
    setMenuOpen(false)

    if (!isHome) {
      navigate('/')
      setTimeout(() => {
        const target = document.getElementById(targetId)
        if (target) target.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }

    const target = document.getElementById(targetId)
    if (!target) return

    const navBar = document.getElementById('nav')
    const offset = (navBar?.offsetHeight || 72) + 12
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset
    const startY = window.scrollY
    const distance = targetY - startY

    if (Math.abs(distance) < 2) return

    const duration = Math.min(2400, Math.max(1200, Math.abs(distance) * 0.5))
    // eslint-disable-next-line react-hooks/purity
    const start = Date.now()
    const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    const cancelOnUserScroll = ev => {
      if (ev.type === 'keydown' && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(ev.key)) return
      cleanUpAnimation()
    }
    ;['wheel', 'touchstart', 'keydown'].forEach(type => {
      window.addEventListener(type, cancelOnUserScroll, { passive: true })
      cancelHandlers.current.push({ type, fn: cancelOnUserScroll })
    })

    const frame = () => {
      const t = Math.min((Date.now() - start) / duration, 1)
      window.scrollTo(0, startY + distance * easeInOutCubic(t))
      if (t < 1) {
        scrollAnim.current = requestAnimationFrame(frame)
      } else {
        scrollAnim.current = null
        cancelHandlers.current.forEach(({ type, fn }) => window.removeEventListener(type, fn))
        cancelHandlers.current = []
      }
    }
    scrollAnim.current = requestAnimationFrame(frame)
  }

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav id="nav" className={scrolled ? 'scrolled' : ''} role="navigation" aria-label="Main navigation">
      <Link to="/" className="nav-brand" aria-label="Home">Gagan C B<span> . Dev</span></Link>
      <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
        {isHome && navLinks.map(link => (
          <li key={link.id}>
            <a href={'#' + link.id} onClick={e => slowScrollTo(e, link.id)}>{link.label}</a>
          </li>
        ))}
        {!isHome && (
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>
        )}
      </ul>
      <div className="nav-actions">
        <button
          className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className="theme-toggle-icon">
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </span>
        </button>

        {user ? (
          <div className="nav-user-menu" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin && (
              <Link to="/admin" className="btn btn-ghost btn-sm" style={{ padding: '6px 14px', fontSize: '.78rem' }}>
                Admin
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: '6px 14px', fontSize: '.78rem' }}>
              Dashboard
            </Link>
            <Link to="/profile" className="nav-user-avatar" style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.8rem', fontWeight: 700, color: '#fff', cursor: 'pointer'
            }}>
              {user.name?.[0]?.toUpperCase()}
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '.78rem' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '.78rem' }}>
              Sign In
            </Link>
          </div>
        )}

        <a href="/doc/Gagan_CB_Resume.pdf" download className="nav-resume">Resume ↓</a>
        <button
          className="hamburger"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span style={{transform: menuOpen ? 'rotate(45deg) translate(0,8px)' : ''}}></span>
          <span style={{opacity: menuOpen ? 0 : 1}}></span>
          <span style={{transform: menuOpen ? 'rotate(-45deg) translate(0,-8px)' : ''}}></span>
        </button>
      </div>
    </nav>
  )
}
