import { useRef, useEffect } from 'react'

export default function ScrollReveal({ children, delay = 0, type = 'up', className = '', style = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('revealed'), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const attr = type === 'left' ? 'data-reveal-left' :
    type === 'right' ? 'data-reveal-right' :
    type === 'scale' ? 'data-reveal-scale' :
    type === 'none' ? 'data-reveal-none' : 'data-reveal'

  return (
    <div ref={ref} {...{ [attr]: '' }} data-delay={delay} className={className} style={style}>
      {children}
    </div>
  )
}

export function StaggerReveal({ children, baseDelay = 0, staggerBy = 80, type = 'up' }) {
  return (
    <div className="stagger-wrap">
      {children.map((child, i) => (
        <ScrollReveal key={i} delay={baseDelay + i * staggerBy} type={type}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  )
}