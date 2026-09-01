import { useRef, useEffect, useState, useCallback } from 'react'
import ScrollReveal from './ScrollReveal'
import './Experience.css'

const jobs = [
  {
    current: true,
    period: 'Mar 2026 — Present',
    badge: 'CURRENT',
    role: 'Augmented Software Engineer',
    company: 'Archelos Intelsense Technologies Pvt Ltd',
    location: ' · AIT Synergy India · Bengaluru',
    points: [
      'Architecting and deploying AI-augmented software applications that serve cross-functional teams, driving AI and software development initiatives at AIT Synergy India.',
      'Collaborating with product and engineering teams to design scalable, high-quality solutions — reducing delivery cycles through agile best practices and continuous integration.',
      'Researching and implementing emerging AI technologies to enhance product capabilities, resulting in smarter, more adaptive software systems.'
    ],
    tags: ['AI Development','Software Architecture','Agile','Cross-functional Leadership']
  },
  {
    period: 'Feb 2025 — May 2025',
    role: 'Full Stack Developer Intern',
    company: 'Palle Technologies',
    location: ' · Bengaluru, Karnataka',
    highlights: ['30% Efficiency Gain','25% Faster APIs','200+ Users Served'],
    points: [
      'Engineered a production-grade Employee Management System using Spring Boot microservices with RESTful APIs for onboarding, leave tracking, and role-based access — adopted by 200+ employees.',
      'Implemented JWT-based authentication and optimized MySQL queries, reducing API response times by 25% and improving system throughput.',
      'Owned full Agile lifecycle: sprint planning, daily standups, peer code reviews, and retrospectives — shipping on-time deliveries across 4 sprints.',
      'Authored technical documentation and implemented bug fixes following SDLC best practices, reducing production defects by 40%.'
    ],
    tags: ['Java','Spring Boot','MySQL','JWT','REST APIs','Agile']
  }
]

export default function Experience() {
  const sectionRef = useRef(null)
  const [lineHeight, setLineHeight] = useState(0)
  const itemRefs = useRef([])

  const onScroll = useCallback(() => {
    const section = sectionRef.current
    if (!section) return
    const rect = section.getBoundingClientRect()
    const sectionTop = rect.top
    const sectionHeight = rect.height
    const viewHeight = window.innerHeight
    const scrolled = Math.max(0, Math.min(1, (viewHeight - sectionTop) / (sectionHeight + viewHeight)))
    setLineHeight(scrolled * 100)

    itemRefs.current.forEach(ref => {
      if (!ref) return
      const r = ref.getBoundingClientRect()
      if (r.top < viewHeight - 60) {
        ref.classList.add('revealed')
      }
    })
  }, [])

  useEffect(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return (
    <section id="experience" ref={sectionRef} aria-label="Work experience">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">02 — EXPERIENCE</div>
          <h2 className="section-h2">
            Work <em>Experience</em>
            <span className="accent-line">2 years building production systems</span>
          </h2>
        </ScrollReveal>
        <div className="exp-timeline">
          <div className="exp-line-track">
            <div className="exp-line-fill" style={{ height: `${lineHeight}%` }} />
          </div>
          {jobs.map((job, i) => (
            <div
              key={i}
              className="exp-item"
              ref={el => itemRefs.current[i] = el}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="exp-connector">
                <div className={`exp-node ${job.current ? 'current-node' : ''}`}>
                  {job.current && <div className="node-ping" />}
                </div>
              </div>
              <div className="exp-card">
                <div className="exp-header">
                  {job.badge && <div className="exp-badge">{job.badge}</div>}
                  <div className="exp-period">{job.period}</div>
                </div>
                <h3 className="exp-role">{job.role}</h3>
                <h4 className="exp-company">
                  <span className="company-name">{job.company}</span>
                  <span className="company-loc">{job.location}</span>
                </h4>
                {job.highlights && (
                  <div className="exp-highlights">
                    {job.highlights.map((h, j) => (
                      <div key={j} className="hl-chip">{h}</div>
                    ))}
                  </div>
                )}
                <ul className="exp-points">
                  {job.points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
                <div className="exp-tags">
                  {job.tags.map((t, j) => <span key={j}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
