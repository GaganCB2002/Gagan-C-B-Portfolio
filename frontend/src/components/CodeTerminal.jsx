import { useState, useEffect, useRef } from 'react'
import ScrollReveal from './ScrollReveal'
import './CodeTerminal.css'

const lines = [
  { text: '@RestController', cls: 'annotation', delay: 400 },
  { text: '@RequestMapping("/api/v1/ai")', cls: 'annotation', delay: 600 },
  { text: 'public class AIController {', cls: 'keyword', delay: 800 },
  { text: '', cls: '', delay: 100 },
  { text: '    private final AIService aiService;', cls: 'field', delay: 600 },
  { text: '', cls: '', delay: 200 },
  { text: '    public AIController(AIService aiService) {', cls: 'keyword', delay: 700 },
  { text: '        this.aiService = aiService;', cls: 'code', delay: 500 },
  { text: '    }', cls: 'code', delay: 300 },
  { text: '', cls: '', delay: 200 },
  { text: '    @PostMapping("/analyze")', cls: 'annotation', delay: 600 },
  { text: '    public ResponseEntity<AIResult> analyze(', cls: 'keyword', delay: 700 },
  { text: '            @RequestBody InputData input) {', cls: 'annotation', delay: 500 },
  { text: '', cls: '', delay: 200 },
  { text: '        AIResult result = aiService.process(input);', cls: 'code', delay: 600 },
  { text: '        return ResponseEntity.ok(result);', cls: 'code', delay: 500 },
  { text: '    }', cls: 'code', delay: 300 },
  { text: '}', cls: 'keyword', delay: 400 },
]

export default function CodeTerminal() {
  const [visible, setVisible] = useState(0)
  const restartRef = useRef(null)

  useEffect(() => {
    if (visible >= lines.length) {
      restartRef.current = setTimeout(() => setVisible(0), 4000)
      return () => clearTimeout(restartRef.current)
    }
    const timer = setTimeout(() => setVisible(v => v + 1), lines[visible].delay)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <section id="code-terminal" aria-label="Live code terminal">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">⚡ LIVE CODE</div>
          <h2 className="section-h2">
            Engineering in <em>action</em>
            <span className="accent-line">Spring Boot · AI · Microservices</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="terminal-title">AIController.java</span>
              <span className="terminal-status">● RUNNING</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line-nums">
                {lines.slice(0, visible).map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
                {visible < lines.length && <span className="line-cursor">_</span>}
              </div>
              <div className="terminal-code">
                {lines.slice(0, visible).map((l, i) => (
                  <div key={i} className={`code-line ${l.cls}`}>
                    {l.cls === 'annotation' && <span className="annotation-symbol">@</span>}
                    {l.text}
                  </div>
                ))}
                {visible < lines.length && (
                  <span className="cursor-blink">|</span>
                )}
              </div>
            </div>
            <div className="terminal-footer">
              <span className="term-prompt">java@portfolio:~$</span>
              <span className="term-cmd">mvn spring-boot:run</span>
              <span className="cursor-blink-sm">▌</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}