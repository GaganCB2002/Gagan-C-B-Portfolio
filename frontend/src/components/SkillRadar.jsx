import { useEffect, useRef } from 'react'

const skills = [
  { label: 'Java', value: 92 },
  { label: 'Spring Boot', value: 88 },
  { label: 'AI / ML', value: 78 },
  { label: 'React', value: 75 },
  { label: 'SQL', value: 82 },
  { label: 'Docker', value: 65 },
  { label: 'Python', value: 65 },
  { label: 'NLP', value: 72 }
]

export default function SkillRadar() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const size = Math.min(340, window.innerWidth - 48)
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.scale(dpr, dpr)
      draw(size)
    }

    const draw = (size) => {
      const cx = size / 2
      const cy = size / 2
      const maxR = size * 0.38
      const levels = 5
      const n = skills.length
      const angleStep = (Math.PI * 2) / n
      const startAngle = -Math.PI / 2

      ctx.clearRect(0, 0, size, size)

      const root = getComputedStyle(document.documentElement)
      const accentColor = root.getPropertyValue('--accent').trim() || '#2563eb'
      const textColor = root.getPropertyValue('--text-2').trim() || '#475569'
      const borderColor = root.getPropertyValue('--border').trim() || 'rgba(0,0,0,0.06)'

      // Grid levels
      for (let l = 1; l <= levels; l++) {
        const r = (maxR / levels) * l
        ctx.beginPath()
        for (let i = 0; i <= n; i++) {
          const a = startAngle + i * angleStep
          const x = cx + r * Math.cos(a)
          const y = cy + r * Math.sin(a)
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Axis lines
      for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a))
        ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

      // Data area
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const idx = i % n
        const val = skills[idx].value / 100
        const a = startAngle + idx * angleStep
        const r = maxR * val
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = accentColor + '20'
      ctx.fill()
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 2
      ctx.stroke()

      // Data points
      for (let i = 0; i < n; i++) {
        const val = skills[i].value / 100
        const a = startAngle + i * angleStep
        const r = maxR * val
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = accentColor
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Labels
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep
        const r = maxR + 22
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        const label = skills[i].label
        const pct = skills[i].value
        ctx.fillStyle = textColor
        ctx.font = '500 11px Inter, system-ui, sans-serif'
        ctx.fillText(label, x, y - 7)
        ctx.fillStyle = accentColor
        ctx.font = '700 10px Inter, system-ui, sans-serif'
        ctx.fillText(pct + '%', x, y + 8)
      }
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div className="skill-radar-wrap" data-reveal data-delay="200">
      <canvas ref={canvasRef} className="skill-radar-canvas" />
    </div>
  )
}