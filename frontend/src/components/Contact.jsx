import { useState, useEffect } from 'react'
import ScrollReveal from './ScrollReveal'
import './Contact.css'

export default function Contact() {
  useEffect(() => {
    const bgWord = document.querySelector('.contact-bg-word')
    if (!bgWord) return
    const onScroll = () => {
      const section = bgWord.closest('section')
      if (!section) return
      const r = section.getBoundingClientRect()
      bgWord.style.transform = `translateY(${r.top * -0.06}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [sending, setSending] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address'
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required'
    } else if (!/^\+?\d{7,15}$/.test(form.phone.replace(/[\s()-]/g, ''))) {
      errs.phone = 'Enter a valid phone number (digits only, 7-15 digits)'
    }
    if (!form.subject.trim()) errs.subject = 'Subject is required'
    if (!form.message.trim()) errs.message = 'Message is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const digits = value.replace(/[^\d+\s()-]/g, '')
      setForm(prev => ({ ...prev, [name]: digits }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/[\s()-]/g, ''),
      subject: form.subject.trim(),
      message: form.message.trim()
    }
    setSending(true)
    setStatus({ type: 'sending', msg: 'Sending your message...' })
    try {
      const payload = {
        ...data,
        _subject: `New Portfolio Contact from ${data.name}`,
        _autoresponse: `Thank you for reaching out, ${data.name}!\n\nI received your message regarding "${data.subject}" and will get back to you within 24 hours.\n\nHere's a copy of your message:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nSubject: ${data.subject}\nMessage: ${data.message}\n\nBest regards,\nGagan C B`
      }
      const res = await fetch('https://formsubmit.co/ajax/gagancb2002@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (json.success) {
        setStatus({ type: 'success', msg: '✓ Message sent! Check your email for a confirmation receipt.' })
        setForm({ name: '', email: '', phone: '', subject: '', message: '' })
        setErrors({})
      } else {
        setStatus({ type: 'error', msg: 'Form service unavailable. Please email me directly:' })
      }
    } catch {
      setStatus({ type: 'error', msg: 'Form service unavailable. Please email me directly:' })
    }
    setSending(false)
  }

  return (
    <section id="contact" aria-label="Contact Gagan C B">
      <div className="contact-inner">
        <div className="contact-bg-word">HELLO</div>
        <div className="contact-content">
          <ScrollReveal>
            <div className="section-label">07 — CONTACT</div>
            <h2 className="contact-h2">Contact <em>Gagan C B</em></h2>
            <p className="contact-sub-heading">Have a project, role, or idea?</p>
            <p className="contact-sub">
              I'm actively seeking full-time opportunities, freelance projects, and collaborations
              at the intersection of AI and software engineering. I respond within <strong>24 hours</strong>.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <div className="contact-links">
              <a href="mailto:gagancb2002@gmail.com" className="contact-link primary" aria-label="Email">
                <span className="cl-icon">✉</span>
                <div><div className="cl-label">Email</div><div className="cl-val">gagancb2002@gmail.com</div></div>
                <span className="cl-arr">↗</span>
              </a>
              <a href="https://linkedin.com/in/gagancb" target="_blank" rel="noopener noreferrer" className="contact-link" aria-label="LinkedIn">
                <span className="cl-icon">in</span>
                <div><div className="cl-label">LinkedIn</div><div className="cl-val">linkedin.com/in/gagancb</div></div>
                <span className="cl-arr">↗</span>
              </a>
              <a href="https://github.com/GaganCB2002" target="_blank" rel="noopener noreferrer" className="contact-link" aria-label="GitHub">
                <span className="cl-icon">⌥</span>
                <div><div className="cl-label">GitHub</div><div className="cl-val">github.com/GaganCB2002</div></div>
                <span className="cl-arr">↗</span>
              </a>
              <a href="tel:+918618666069" className="contact-link" aria-label="Phone">
                <span className="cl-icon">☎</span>
                <div><div className="cl-label">Phone</div><div className="cl-val">+91 86186 66069</div></div>
                <span className="cl-arr">↗</span>
              </a>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="contact-form-wrap">
              <div className="form-divider"><span>Or send a message</span></div>
              <h3 className="form-heading">Send me a message</h3>
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="form-name" className="form-label">Name <span className="required">*</span></label>
                    <input type="text" id="form-name" name="name" placeholder="Your full name" required className={`form-input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={handleChange} />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="form-email" className="form-label">Email <span className="required">*</span></label>
                    <input type="email" id="form-email" name="email" placeholder="you@company.com" required className={`form-input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={handleChange} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="form-phone" className="form-label">Phone <span className="required">*</span></label>
                    <input type="tel" id="form-phone" name="phone" placeholder="+91 86186 66069" required className={`form-input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={handleChange} />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="form-subject" className="form-label">Subject <span className="required">*</span></label>
                    <input type="text" id="form-subject" name="subject" placeholder="Job opportunity / Project collaboration" required className={`form-input ${errors.subject ? 'input-error' : ''}`} value={form.subject} onChange={handleChange} />
                    {errors.subject && <span className="field-error">{errors.subject}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="form-message" className="form-label">Message <span className="required">*</span></label>
                  <textarea id="form-message" name="message" rows="5" placeholder="Tell me about your project, role, or collaboration idea..." required className={`form-input form-textarea ${errors.message ? 'input-error' : ''}`} value={form.message} onChange={handleChange} />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>
                {status.msg && (
                  <div className={`form-status ${status.type}`}>
                    {status.msg}
                    {status.type === 'error' && (
                      <a href="mailto:gagancb2002@gmail.com?subject=Job%20Opportunity%20-%20Gagan%20C%20B" className="fallback-email-btn">
                        ✉ gagancb2002@gmail.com
                      </a>
                    )}
                  </div>
                )}
                <button type="submit" className="form-submit" disabled={sending}>
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8h11M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
