import { useState, useEffect, useCallback } from 'react'
import ScrollReveal from './ScrollReveal'
import './Testimonials.css'

const testimonials = [
  {
    text: "Gagan is one of the most dedicated developers I've worked with. His command of Java and Spring Boot is exceptional, and he brings an AI-first mindset to every challenge.",
    name: 'Siddharth Patil',
    role: 'Senior Developer · Palle Technologies',
    initials: 'SP'
  },
  {
    text: "Gagan has a rare ability to bridge traditional software engineering with modern AI integration. His work on the placement system was outstanding — delivered ahead of schedule.",
    name: 'Manoj R',
    role: 'Tech Lead · Archelos Intelsense',
    initials: 'MR'
  },
  {
    text: "Collaborating with Gagan on the HR portal was seamless. His microservices architecture expertise and attention to detail resulted in a system that exceeded our reliability targets.",
    name: 'Ananya Kulkarni',
    role: 'Product Manager · AIT Synergy',
    initials: 'AK'
  }
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  const next = useCallback(() => setActive(i => (i + 1) % testimonials.length), [])
  const prev = useCallback(() => setActive(i => (i - 1 + testimonials.length) % testimonials.length), [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section id="testimonials" aria-label="Testimonials from colleagues">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">06 — TESTIMONIALS</div>
          <h2 className="section-h2">
            What colleagues <em>say about me</em>
            <span className="accent-line">Trusted by peers & leaders</span>
          </h2>
        </ScrollReveal>
        <div className="test-carousel">
          {testimonials.map((t, i) => (
            <div key={i} className={`test-slide${i === active ? ' active' : ''}`} aria-hidden={i !== active}>
              <div className="testimonial-card test-carousel-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="test-controls">
            {testimonials.map((_, i) => (
              <button key={i} className={`test-dot${i === active ? ' active' : ''}`} onClick={() => setActive(i)} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
          <button className="test-arrow test-arrow-left" onClick={prev} aria-label="Previous testimonial">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15L6 9l6-6"/></svg>
          </button>
          <button className="test-arrow test-arrow-right" onClick={next} aria-label="Next testimonial">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6-6-6"/></svg>
          </button>
        </div>
        <ScrollReveal delay={100}>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}