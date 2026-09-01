import { useState, useEffect, useRef } from 'react'

export default function BackToTop() {
  const [scrollPercent, setScrollPercent] = useState(0)
  const [visible, setVisible] = useState(false)
  const [atBottom, setAtBottom] = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        setScrollPercent(percent)
        setVisible(percent > 5)
        setAtBottom(percent > 90)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleClick = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const nextSection = document.querySelector('section[id]')
      if (nextSection) {
        const navBar = document.getElementById('nav')
        const offset = (navBar?.offsetHeight || 72) + 12
        const targetY = nextSection.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top: targetY, behavior: 'smooth' })
      }
    }
  }

  const circumference = 2 * Math.PI * 18
  const dashOffset = circumference - (scrollPercent / 100) * circumference

  return (
    <button
      id="back-to-top"
      aria-label={atBottom ? 'Scroll to top' : 'Scroll down'}
      onClick={handleClick}
      style={{
        position: 'fixed', bottom: 30, right: 30, zIndex: 500,
        width: 56, height: 56,
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: 'all .35s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: visible ? 'auto' : 'none',
        borderRadius: '50%',
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-sm)',
        padding: 0,
        color: 'var(--text-2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--accent)'
        e.currentTarget.style.color = '#fff'
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)'
        e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-glow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ''
        e.currentTarget.style.color = ''
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle
          cx="28" cy="28" r="18"
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
          opacity="0.3"
        />
        <circle
          cx="28" cy="28" r="18"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset .15s ease-out' }}
        />
      </svg>
      <svg
        width="18" height="18" viewBox="0 0 18 18"
        aria-hidden="true"
        style={{
          transition: 'transform .4s cubic-bezier(0.34,1.56,0.64,1)',
          transform: atBottom ? 'rotate(180deg)' : 'rotate(0deg)',
          position: 'relative', zIndex: 1
        }}
      >
        <path d="M9 15V3M4 8l5-5 5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
