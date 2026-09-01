import ScrollReveal from './ScrollReveal'
import './Certifications.css'

const certs = [
  { logo: 'D', cls: 'cl-d', name: 'Technology Job Simulation', org: 'Deloitte Australia', url: 'https://www.theforage.com/' },
  { logo: 'D', cls: 'cl-d', name: 'Cyber Security Job Simulation', org: 'Deloitte Australia', url: 'https://www.theforage.com/' },
  { logo: 'T', cls: 'cl-t', name: 'GenAI Data Analytics Simulation', org: 'Tata Group', url: 'https://www.theforage.com/' },
  { logo: 'F', cls: 'cl-f', name: 'Software Engineering Simulation', org: 'Forage', url: 'https://www.theforage.com/' },
  { logo: 'U', cls: 'cl-u', name: 'Complete Java Core for Beginners', org: 'Udemy', url: 'https://www.udemy.com/' },
  { logo: 'A', cls: 'cl-a', name: 'Claude 101 Certification', org: 'Anthropic · Skilljar', url: '/doc/certificate_claude_101.pdf' },
  { logo: 'A', cls: 'cl-a', name: 'Claude Code in Action Certification', org: 'Anthropic · Skilljar', url: '/doc/certificate_claude_code_in_action.pdf' }
]

export default function Certifications() {
  return (
    <section id="certifications" aria-label="Certifications and credentials">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">05 — CERTIFICATIONS</div>
          <h2 className="section-h2">
            Credentials & <em>continuous learning</em>
            <span className="accent-line">7 professional certifications</span>
          </h2>
        </ScrollReveal>
        <div className="certs-row">
          {certs.map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="cert-item" data-reveal data-delay={i * 60}>
              <div className={`cert-logo ${c.cls}`}>{c.logo}</div>
              <div className="cert-info">
                <div className="cert-name">{c.name}</div>
                <div className="cert-org">{c.org}</div>
              </div>
              <span className="cert-arr">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
