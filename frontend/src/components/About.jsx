import ScrollReveal from './ScrollReveal'
import './About.css'

const profiles = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    label: 'AI Engineer',
    description: 'Building intelligent systems that think, learn, and deliver — integrating LLMs, NLP pipelines, and predictive models into production.',
    tags: ['LLMs', 'NLP', 'Predictive Models', 'AI Agents']
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    label: 'Full Stack Developer',
    description: 'Crafting end-to-end applications with Spring Boot microservices, RESTful APIs, and modern frontends that scale to hundreds of users.',
    tags: ['Java', 'Spring Boot', 'React', 'MySQL', 'REST APIs']
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    label: 'Innovator & Builder',
    description: 'Driven by impact — from an AI placement system with 85% accuracy to an enterprise HR portal serving 200+ daily users with microservices.',
    tags: ['Placement System', 'E-commerce NLP', 'HR Portal', 'SDLC']
  }
]

const quickFacts = [
  { icon: '📍', label: 'Location', value: 'Davanagere, Karnataka, India' },
  { icon: '🎓', label: 'Education', value: 'B.E. Computer Science · AIT · 2021–2025' },
  { icon: '💼', label: 'Role', value: 'Augmented Software Engineer @ Archelos' },
  { icon: '⚡', label: 'Core Stack', value: 'Java · Spring Boot · AI · NLP' }
]

export default function About() {
  return (
    <section id="about" aria-label="About Gagan C B">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">01 — ABOUT ME</div>
          <h2 className="section-h2">
            About <em>Gagan C B</em>
            <span className="accent-line">Java Full Stack Developer · AI Engineer · Problem Solver</span>
          </h2>
        </ScrollReveal>

        <div className="profiles-grid">
          <ScrollReveal delay={100}>
            <div className="profile-main">
              <div className="profile-main-glow" />
              <div className="profile-main-avatar">
                <div className="pma-frame">
                  <img src="/profile.png" alt="Gagan C B — Java Full Stack Developer" className="pma-image" loading="lazy" />
                  <div className="pma-ring-1" />
                  <div className="pma-ring-2" />
                </div>
                <div className="pma-status">
                  <span className="pma-dot" />
                  Available for opportunities
                </div>
              </div>
              <div className="profile-main-body">
                <p className="profile-main-lead">
                  I'm a <mark>Full Stack Developer</mark> & <mark>AI Engineer</mark> from Davanagere, Karnataka —
                  currently delivering production-grade AI-powered software at <strong>Archelos Intelsense Technologies</strong>
                  as part of the AIT Synergy India team.
                </p>
                <p className="profile-main-text">
                  I hold a <strong>B.E. in Computer Science</strong> from Akshaya Institute of Technology (2021–2025)
                  and completed my industry internship at <strong>Palle Technologies</strong>.
                  My engineering philosophy: <em>build software that thinks, scales, and delivers measurable impact</em>.
                </p>
                <p className="profile-main-text">
                  At Archelos, I architect and deploy AI-augmented applications — from LLM integration to predictive
                  modeling — collaborating with cross-functional teams to design scalable solutions
                  that reduce delivery cycles through agile best practices and continuous integration.
                </p>
                <p className="profile-main-text">
                  During my internship at Palle Technologies, I engineered a production-grade Employee Management
                  System using Spring Boot microservices, JWT authentication, and RESTful APIs — adopted by 200+
                  employees. I optimized MySQL queries reducing API response times by 25%.
                </p>
                <p className="profile-main-text">
                  My core stack: <strong>Java, Spring Boot, React, MySQL, PostgreSQL, NLP, Docker, Microservices</strong>.
                  I've built 6 production-grade projects spanning AI placement systems with 85% accuracy,
                  NLP-driven e-commerce, enterprise HR portals, and IoT predictive maintenance.
                </p>
              </div>
              <div className="profile-main-cta">
                <a href="/doc/Gagan_C_B_1.pdf" download className="btn btn-primary btn-sm">
                  Download Resume
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              </div>
            </div>
          </ScrollReveal>

          <div className="profile-cards">
            {profiles.map((p, i) => (
              <ScrollReveal key={i} delay={150 + i * 80}>
                <div className="profile-card">
                  <div className="profile-card-accent" />
                  <div className="profile-card-icon">{p.icon}</div>
                  <h4 className="profile-card-label">{p.label}</h4>
                  <p className="profile-card-desc">{p.description}</p>
                  <div className="profile-card-tags">
                    {p.tags.map((t, j) => <span key={j}>{t}</span>)}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="profile-facts" style={{ gridColumn: '1 / -1' }}>
            {quickFacts.map((f, i) => (
              <ScrollReveal key={i} delay={300 + i * 150} className="profile-fact">
                <span className="pf-icon">{f.icon}</span>
                <div className="pf-text">
                  <strong>{f.label}</strong>
                  <span>{f.value}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
