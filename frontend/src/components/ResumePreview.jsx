import { useEffect } from 'react'
import './ResumePreview.css'

export default function ResumePreview({ open, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="resume-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Resume preview">
      <div className="resume-modal" onClick={e => e.stopPropagation()}>
        <div className="resume-modal-header">
          <span className="resume-modal-title">Gagan C B — Resume</span>
          <div className="resume-modal-actions">
            <a href="/doc/Gagan_CB_Resume.pdf" download className="resume-dl-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
            <button className="resume-close-btn" onClick={onClose} aria-label="Close resume preview">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div className="resume-modal-body">
          <iframe
            src="/doc/Gagan_CB_Resume.pdf#toolbar=0&navpanes=0"
            className="resume-iframe"
            title="Gagan C B Resume"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}