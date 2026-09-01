import './Footer.css'

export default function Footer() {
  return (
    <footer role="contentinfo">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-brand">Gagan<span>.</span></div>
            <div className="footer-role">Augmented Software Engineer · Full Stack Developer · AI Enthusiast</div>
          </div>
          <div className="footer-links">
            <a href="https://linkedin.com/in/gagancb" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
            <a href="https://github.com/GaganCB2002" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>
            <a href="mailto:gagancb2002@gmail.com" aria-label="Email">Email</a>
            <a href="/doc/Gagan_CB_Resume.pdf" download className="footer-dl" aria-label="Download resume">Resume ↓</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Gagan C B. Built with Java, Spring Boot & an AI mindset.</span>
          <span className="footer-meta" style={{ display: 'block', marginTop: '8px', fontSize: '0.85em', color: '#888' }}>
            Published: June 2025 &middot; Updated: June 2026 &middot; Author: Gagan C B
          </span>
          <span className="privacy-notice" style={{ display: 'block', marginTop: '6px', fontSize: '0.85em', color: '#888' }}>
            This site collects anonymous usage data to improve user experience. No personal information is collected.
          </span>
        </div>
      </div>
    </footer>
  )
}
