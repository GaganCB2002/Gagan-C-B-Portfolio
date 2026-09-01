import { useEffect, useRef } from 'react'
import ScrollReveal from './ScrollReveal'
import SkillRadar from './SkillRadar'
import './Skills.css'

const categories = [
  {
    label: 'Languages',
    icon: '⌨',
    items: [
      { name: 'Java', level: 'Expert', pct: 92 },
      { name: 'SQL', level: 'Advanced', pct: 82 },
      { name: 'Python', level: 'Intermediate', pct: 65 },
      { name: 'HTML5 / CSS3', level: 'Advanced', pct: 80 }
    ]
  },
  {
    label: 'Frameworks & Databases',
    icon: '⚙',
    chips: ['Spring Boot','Spring Security','FastAPI','React','Tailwind CSS','MySQL','PostgreSQL','JDBC'],
    primary: ['Spring Boot','MySQL','PostgreSQL']
  },
  {
    label: 'AI & Machine Learning',
    icon: '🧠',
    chips: ['NLP / NLU','TF-IDF','Cosine Similarity','spaCy','NLTK','scikit-learn','Generative AI','TensorFlow','PyTorch','LLM Integration'],
    cls: 'ai'
  },
  {
    label: 'AI Development Tools',
    icon: '🤖',
    chips: ['Cursor AI Editor','GitHub Copilot','Claude Code','ChatGPT / GPT-4','Google Gemini','AI Agents','Cline','Windsurf','Claude AI','Prompt Engineering'],
    cls: 'ai'
  },
  {
    label: 'Cloud, Testing & Practices',
    icon: '☁',
    chips: ['Git / GitHub','Docker','AWS','Google Cloud','Manual Testing','Test Case Design','IntelliJ IDEA','VS Code','Agile / Scrum','SDLC'],
    cls: 'tools'
  }
]

export default function Skills() {
  const barsRef = useRef(null)

  useEffect(() => {
    const el = barsRef.current
    if (!el) return
    const fills = el.querySelectorAll('.skill-hero-bar-fill')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fills.forEach((bar, i) => {
            const pct = bar.getAttribute('data-pct')
            setTimeout(() => { bar.style.width = pct + '%' }, i * 120)
          })
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="skills" aria-label="Technical skills">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">04 — TECHNICAL SKILLS</div>
          <h2 className="section-h2">
            Technical <em>Skills</em>
            <span className="accent-line">Full-stack development · AI/ML · Cloud & DevOps</span>
          </h2>
        </ScrollReveal>

        {/* Core Languages + Radar Chart */}
        <div className="skills-hero-row">
          <ScrollReveal>
            <div className="skills-hero" ref={barsRef}>
              {categories[0].items.map((skill, i) => (
                <div key={i} className="skill-hero-card" style={{animationDelay: `${i * 0.1}s`}}>
                  <div className="skill-hero-header">
                    <span className="skill-hero-name">{skill.name}</span>
                    <span className="skill-hero-level">{skill.level}</span>
                  </div>
                  <div className="skill-hero-bar-track">
                    <div className="skill-hero-bar-fill" data-pct={skill.pct} style={{width: '0%', transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`}}>
                      <span className="skill-hero-pct">{skill.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <SkillRadar />
        </div>

        {/* Other Categories - Chips Grid */}
        <div className="skills-categories">
          {categories.slice(1).map((cat, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="skills-cat-card">
                <div className="skills-cat-top">
                  <span className="skills-cat-icon">{cat.icon}</span>
                  <span className="skills-cat-label">{cat.label}</span>
                </div>
                <div className="skills-cat-chips">
                  {cat.chips.map((chip, j) => (
                    <span key={j} className={`skill-chip${cat.primary?.includes(chip) ? ' primary' : ''}${cat.cls ? ' ' + cat.cls : ''}`}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}