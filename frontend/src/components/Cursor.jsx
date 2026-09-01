import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mx = useRef(0)
  const my = useRef(0)
  const rx = useRef(0)
  const ry = useRef(0)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMouse = e => { mx.current = e.clientX; my.current = e.clientY }
    document.addEventListener('mousemove', onMouse, { passive: true })

    const anim = () => {
      dot.style.left = mx.current + 'px'
      dot.style.top = my.current + 'px'
      rx.current += (mx.current - rx.current) * 0.13
      ry.current += (my.current - ry.current) * 0.13
      ring.style.left = rx.current + 'px'
      ring.style.top = ry.current + 'px'
      requestAnimationFrame(anim)
    }
    requestAnimationFrame(anim)

    const addHover = () => document.body.classList.add('cursor-hover')
    const remHover = () => document.body.classList.remove('cursor-hover')
    const els = document.querySelectorAll('a, button, .cert-item, .exp-card, .proj-mockup, .skill-chip-lg, .profile-fact, .testimonial-card')
    els.forEach(el => { el.addEventListener('mouseenter', addHover); el.addEventListener('mouseleave', remHover) })

    return () => {
      document.removeEventListener('mousemove', onMouse)
      els.forEach(el => { el.removeEventListener('mouseenter', addHover); el.removeEventListener('mouseleave', remHover) })
    }
  }, [])

  return (
    <div id="cursor" style={{position:'fixed',top:0,left:0,zIndex:9999,pointerEvents:'none'}}>
      <div ref={dotRef} style={{
        position:'fixed',width:8,height:8,borderRadius:'50%',
        background:'var(--accent)',transform:'translate(-50%,-50%)',
        transition:'transform .1s,width .3s,height .3s',
        boxShadow:'0 0 14px var(--accent-glow)'
      }} />
      <div ref={ringRef} style={{
        position:'fixed',width:38,height:38,borderRadius:'50%',
        border:'1.5px solid rgba(30,58,95,0.35)',transform:'translate(-50%,-50%)',
        transition:'transform .18s cubic-bezier(0.16,1,0.3,1),width .35s,height .35s,border-color .3s'
      }} />
      <style>{`
        body.cursor-hover #cursor div:first-child{width:18px;height:18px;background:var(--accent-2)}
        body.cursor-hover #cursor div:last-child{width:56px;height:56px;border-color:var(--accent)}
        @media(max-width:480px){#cursor{display:none}}
      `}</style>
    </div>
  )
}
