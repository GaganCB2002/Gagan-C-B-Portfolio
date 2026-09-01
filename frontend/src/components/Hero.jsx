import { useState, useEffect, useRef } from 'react'
import ResumePreview from './ResumePreview'
import './Hero.css'

const socialLinks = [
  { label: 'GitHub', url: 'https://github.com/gagancb2002', icon: 'GH' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/gagancb', icon: 'LI' },
  { label: 'Email', url: 'mailto:gagancb2002@gmail.com', icon: '@' }
]

const techStack = ['Java', 'Spring Boot', 'React', 'AI/ML', 'NLP', 'Microservices', 'PostgreSQL', 'Docker']

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles = [], mouse = { x: -9999, y: -9999 }, animId

    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const hero = document.getElementById('hero')
    const onMouseMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top
    }
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    hero?.addEventListener('mousemove', onMouseMove, { passive: true })
    hero?.addEventListener('mouseleave', onMouseLeave)

    const N = Math.min(50, Math.floor(W * H / 18000))
    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
        r: Math.random() * 2 + .5, a: Math.random() * .3 + .05,
        col: [30, 58, 95]
      })
    }

    function frame() {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) { p.vx += (dx / dist) * .2; p.vy += (dy / dist) * .2 }
        p.vx *= .95; p.vy *= .95
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.a})`
        ctx.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 150) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(30,58,95,${.025 * (1 - d / 150)})`
            ctx.lineWidth = .5; ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(frame)
    }
    frame()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); hero?.removeEventListener('mousemove', onMouseMove); hero?.removeEventListener('mouseleave', onMouseLeave) }
  }, [])

  useEffect(() => {
    const roles = ['Java Full Stack Developer','Software Engineer','Web Developer','Augmented Software Engineer','AI Systems Builder','NLP Integration Specialist']
    const el = document.getElementById('typed-role')
    if (!el) return
    let ri = 0, ci = 0, deleting = false, paused = false, timerId
    const tick = () => {
      const current = roles[ri]
      if (!deleting) {
        ci++; el.textContent = current.slice(0, ci)
        if (ci === current.length) { paused = true; timerId = setTimeout(() => { deleting = true; paused = false; tick() }, 2200); return }
      } else {
        ci--; el.textContent = current.slice(0, ci)
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; timerId = setTimeout(tick, 350); return }
      }
      if (!paused) timerId = setTimeout(tick, deleting ? 40 : 80)
    }
    timerId = setTimeout(tick, 600)
    return () => clearTimeout(timerId)
  }, [])

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  useEffect(() => {
    const strip = document.querySelector('.hero-stats-strip')
    if (!strip) return
    const frames = []
    strip.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count)
      const suffix = el.dataset.suffix || ''
      const dur = 2000, start = performance.now()
      const update = now => {
        const t = Math.min((now - start) / dur, 1)
        const ease = 1 - Math.pow(1 - t, 4)
        el.textContent = Math.floor(ease * target) + (t === 1 ? suffix : '')
        if (t < 1) frames.push(requestAnimationFrame(update))
      }
      frames.push(requestAnimationFrame(update))
    })
    return () => frames.forEach(id => cancelAnimationFrame(id))
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setModalOpen(false)
  }

  return (
    <section id="hero" aria-label="Profile hero">
      <canvas ref={canvasRef} id="hero-canvas" />
      <div className="hero-aurora" aria-hidden="true">
        <div className="aurora-blob aurora-a"></div>
        <div className="aurora-blob aurora-b"></div>
        <div className="aurora-blob aurora-c"></div>
      </div>
      <div className="hero-inner">
        <div className="hero-profile-card">
          <div className="hpc-glow" />
          <div className="hpc-avatar">
            <div className="hpc-avatar-frame" onClick={() => setModalOpen(true)} role="button" tabIndex={0} onKeyDown={handleKeyDown} aria-label="View profile photo">
              <img src="/profile.png" alt="Gagan C B — Java Full Stack Developer" className="hpc-avatar-img" loading="lazy" />
              <div className="hpc-ring-outer" />
              <div className="hpc-ring-inner" />
              <div className="hpc-avatar-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span className="hpc-click-hint">Click here to view photo</span>
              </div>
            </div>
            <div className="hpc-status">
              <span className="hpc-dot" />
              Open to Work
            </div>
          </div>
          <h1 className="hpc-name">
            <span className="hpc-name-title">Java Full Stack Developer</span>
            <span className="hpc-name-sep">–</span>
            <span className="hpc-name-first gradient-live">Gagan</span>
            <span className="hpc-name-last">C B</span>
          </h1>
          <div className="hpc-role-ticker"><span id="typed-role"></span><span className="caret">|</span></div>
          <p className="hpc-bio">
            Building intelligent, AI-powered systems at <strong>Archelos Intelsense Technologies</strong> —
            serving <strong>200+ users</strong> with <strong>85%+ accuracy</strong>.
          </p>
          <div className="hpc-actions">
            <a href="#projects" className="btn btn-primary">
              View Projects
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="/doc/Gagan_CB_Resume.pdf" download className="btn btn-ghost">Resume ↓</a>
            <button className="btn btn-ghost" onClick={() => setResumeOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview
            </button>
          </div>
          <div className="hpc-badges">
            <span className="hpc-badge">Java Full Stack</span>
            <span className="hpc-badge">Software Engineer</span>
            <span className="hpc-badge">Web Developer</span>
          </div>
          <div className="hpc-social">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="hpc-social-link" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-stats-strip">
            <div className="stat"><strong data-count="2">0</strong><span>Years Exp</span></div>
            <div className="stat"><strong data-count="5">0</strong><span>Projects</span></div>
            <div className="stat"><strong data-count="200" data-suffix="+">0</strong><span>Users Served</span></div>
            <div className="stat"><strong data-count="85" data-suffix="%">0</strong><span>AI Accuracy</span></div>
          </div>

          <div className="hero-quote-card">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--accent)" opacity="0.5"><path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4zm0 0v3a4 4 0 0 1-4 4H5"/><path d="M21 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4zm0 0v3a4 4 0 0 1-4 4h-1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            <p>Build software that thinks, scales, and delivers measurable impact.</p>
          </div>

          <div className="hero-tech-chips marquee-band">
            <div className="marquee-track">
              {[...techStack, ...techStack].map((t, i) => <span key={i}>{t}</span>)}
            </div>
          </div>

          <div className="hero-location-card">
            <span>📍</span>
            <div>
              <strong>Based in</strong>
              <span>Davanagere, Karnataka, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-wheel" />
        <span>Scroll</span>
      </div>

      {modalOpen && (
        <div className="profile-modal-overlay" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true" aria-label="Profile photo">
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setModalOpen(false)} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="profile-modal-image-wrap">
              <img src="/profile.png" alt="Gagan C B Profile Photo" className="profile-modal-image" loading="lazy" />
            </div>
            <div className="profile-modal-info">
              <h2 className="profile-modal-name">Gagan C B</h2>
              <span className="profile-modal-role">Augmented Software Engineer</span>
              <div className="profile-modal-tags">
                <span>Java</span>
                <span>Spring Boot</span>
                <span>AI/ML</span>
                <span>NLP</span>
                <span>React</span>
                <span>Microservices</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setModalOpen(false); setResumeOpen(true) }} style={{marginTop:'12px'}}>View Resume</button>
            </div>
          </div>
        </div>
      )}
      <ResumePreview open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </section>
  )
}
