import { useEffect, useRef } from 'react'

export default function Loader({ onDone }) {
  const barRef = useRef(null)
  const pctRef = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    let val = 0
    const interval = setInterval(() => {
      val += Math.random() * 30 + 14
      if (val >= 100) { val = 100; clearInterval(interval) }
      if (barRef.current) barRef.current.style.width = val + '%'
      if (pctRef.current) pctRef.current.textContent = Math.floor(val) + '%'
      if (val === 100 && !done.current) {
        done.current = true
        setTimeout(() => {
          document.body.style.overflow = ''
          onDone()
        }, 200)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div id="loader" style={{
      position:'fixed',inset:0,zIndex:8000,background:'var(--bg)',
      display:'flex',alignItems:'center',justifyContent:'center',
      transition:'opacity .6s, visibility .6s',
      opacity:1, visibility:'visible'
    }}>
      <div style={{textAlign:'center',width:280}}>
        <div style={{
          fontFamily:'var(--ff)',fontSize:'1.4rem',fontWeight:800,
          letterSpacing:'.3em',color:'var(--accent)',marginBottom:32
        }}>GAGAN C B</div>
        <div style={{height:2,background:'var(--border)',overflow:'hidden',marginBottom:16,borderRadius:2}}>
          <div ref={barRef} style={{height:'100%',width:0,background:'linear-gradient(90deg,var(--accent),var(--accent-2))',transition:'width .05s linear',borderRadius:2}} />
        </div>
        <div ref={pctRef} style={{
          fontFamily:"'DM Mono',monospace",fontSize:'.68rem',
          color:'var(--text-3)',letterSpacing:'.1em'
        }}>0%</div>
      </div>
    </div>
  )
}
