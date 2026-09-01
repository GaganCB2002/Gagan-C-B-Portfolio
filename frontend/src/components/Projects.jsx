import { useEffect, useRef } from 'react'
import ScrollReveal from './ScrollReveal'
import './Projects.css'

const projects = [
  {
    num: '01',
    title: 'AI-Powered Student Placement System',
    desc: 'Enterprise placement platform using machine learning to match candidates with opportunities. Microservices architecture with a dedicated AI engine achieving 85% prediction accuracy.',
    img: '/images/project_placement.png',
    ach: [{ v: '85', l: 'Prediction accuracy', suffix: '%' }, { v: '500', l: 'Resumes parsed via NLP', suffix: '+' }],
    points: ['TF-IDF + Cosine Similarity for intelligent candidate-job matching','Microservices: Spring Boot (Java 17) + FastAPI AI engine + React 19 frontend','NLP resume parser via spaCy, NLTK, scikit-learn','Real-time analytics dashboard with Tailwind CSS','Role-based security via Spring Security & JWT'],
    stack: ['Java 17','Spring Boot','FastAPI','PostgreSQL','Python','React 19','spaCy','TF-IDF','JWT']
  },
  {
    num: '02',
    title: 'NexaCart — AI-Powered E-Commerce Platform',
    desc: 'Intelligent e-commerce platform with NLP-driven recommendations that learn user behavior. Cuts product search time by 35% with personalized suggestion engines.',
    img: '/images/project_nexacart.png',
    ach: [{ v: '35', l: 'Faster discovery', suffix: '%' }, { v: 'NLP', l: 'Recommendations' }],
    points: ['NLP-powered product recommendation engine tailored to user behaviour','Scalable REST APIs for auth, cart, orders & AI recommendations','Responsive UI with dark mode, micro-interactions, advanced filtering','Optimized data structures for high-traffic performance'],
    stack: ['Java','Spring Boot','MySQL','Python','NLP','REST APIs']
  },
  {
    num: '03',
    title: 'AuraHR — Enterprise Resource Portal',
    desc: 'Production-grade microservices-based HR management portal built for enterprise scale. Features role-based gateway routing, biometric authentication, and real-time auditing.',
    img: '/images/project_aurahr.png',
    ach: [{ v: '30', l: 'Efficiency boost', suffix: '%' }, { v: 'JWT', l: 'Centralized auth' }],
    points: ['Spring Cloud Gateway & JWT for secure cross-service auth','Role-based portals (Employee, HR, Tech Lead) with data isolation','Real-time activity auditing tracking logins, changes & biometrics','Dockerized microservices with PostgreSQL replication'],
    stack: ['Java','Spring Boot','Spring Cloud','MySQL','React','Docker','JWT']
  },
  {
    num: '04',
    title: 'AI-Driven Predictive Maintenance System',
    desc: 'IoT-enabled platform predicting machine failure through real-time sensor telemetry analysis. Custom LSTM neural networks reduce factory downtime by 40%.',
    img: '/images/project_predictive_maintenance.png',
    ach: [{ v: '40', l: 'Downtime reduction', suffix: '%' }, { v: '94', l: 'Detection accuracy', suffix: '%' }],
    points: ['Real-time sensor data ingestion via MQTT and InfluxDB','LSTM neural network with 94% anomaly detection accuracy','Interactive dashboard with Chart.js visualizations','Automated SMS/Email alerting via Spring Boot dispatcher'],
    stack: ['Python','FastAPI','TensorFlow','Spring Boot','InfluxDB','PostgreSQL','React','Chart.js']
  },
  {
    num: '05',
    title: 'SentinX — AI Cybersecurity Command Center',
    desc: 'Real-time network anomaly detection using NLP and generative AI to parse log streams and identify zero-day threats with 99.2% recall rate.',
    img: '/images/project_cybersecurity_threat.png',
    ach: [{ v: '99.2', l: 'Threat recall', suffix: '%' }, { v: 'Real-time', l: 'Log analysis' }],
    points: ['Deep learning classification analyzing network packet logs real-time','ELK Stack for rapid indexing and log visualization','Interactive node-graph mapping network connections & threats','Generative AI assistant summarizing threats & mitigations'],
    stack: ['Python','PyTorch','Java','Spring Security','Elasticsearch','Logstash','Kibana','React']
  },
  {
    num: '06',
    title: 'SmartQuote — Enterprise B2B Quotation Engine',
    desc: 'Architected and developed a dynamic enterprise quotation system that automates complex pricing models and B2B logic. The platform revolutionized the sales workflow, reducing quote generation time from hours to minutes while guaranteeing 100% pricing accuracy.',
    img: '/images/project_quotation.png',
    ach: [{ v: '85', l: 'Time Saved', suffix: '%' }, { v: '100', l: 'Pricing Accuracy', suffix: '%' }],
    points: [
      'Engineered a high-performance Spring Boot microservice to handle dynamic, multi-tiered pricing logic, regional taxation, and volume discounts',
      'Implemented an asynchronous event-driven architecture using RabbitMQ for reliable multi-level managerial approval workflows',
      'Automated the generation of pixel-perfect, secure PDF business proposals using Apache PDFBox, eliminating manual data entry errors',
      'Architected a highly responsive React.js frontend, enabling sales representatives to track quote lifecycles via an interactive dashboard',
      'Optimized PostgreSQL database schemas to seamlessly support high-concurrency read/write operations during peak sales periods'
    ],
    stack: ['Java 17', 'Spring Boot', 'React', 'PostgreSQL', 'RabbitMQ', 'PDFBox', 'Microservices']
  },
  {
    num: '07',
    title: 'Text-2-SQL — AI Query Generator',
    desc: 'AI-powered tool that converts plain English into production-ready database schemas and queries. Generates complete SQL/NoSQL schemas with auto-built ER diagrams in seconds, ready to copy into any project.',
    img: '/images/project_text2sql.png',
    ach: [{ v: '3', l: 'Second avg. generation', suffix: 's' }, { v: '100', l: 'Schema accuracy', suffix: '%' }],
    points: [
      'Natural language to SQL schema generation — describe a DB, get production-ready DDL',
      'Auto-generated ER diagrams with 1:1, 1:N and N:M relationships',
      'Dual NoSQL (MongoDB) and relational (PostgreSQL) schema generation',
      'One-click export to SQL, MongoDB, JSON for instant project integration',
      'JWT-based authentication securing all schema and admin endpoints',
      'Real-time usage dashboard tracking storage consumption and active users'
    ],
    stack: ['React 19', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'JWT', 'OpenAI API', 'Chart.js', 'Prisma']
  },
  {
    num: '08',
    title: 'ColdReach — Cold Email Generator',
    desc: 'AI job-application engine that turns any job description into a personalized cold email, auto-syncs everything to Gmail, segregates leads, tracks applications and schedules interviews — all in one connected workflow.',
    img: '/images/project_coldemail.png',
    ach: [{ v: '68', l: 'Open rate', suffix: '%' }, { v: '12', l: 'Emails automated', suffix: 'K+' }],
    points: [
      'Paste a JD and get a tailored cold email generated instantly with AI',
      'Automatic Gmail sync — outgoing emails, replies and contacts collected in real time',
      'Auto-segregates leads by source (LinkedIn, referral, website, Gmail) with statuses',
      'Application & status tracking: New, Contacted, Replied, Interview, Offer, Rejected',
      'Interviews auto-scheduled into the calendar with regular notifications',
      'Built-in AI Resume Builder generating latest ATS-friendly resumes on demand'
    ],
    stack: ['React 19', 'Node.js', 'Express', 'Gmail API', 'MongoDB', 'Node-Cron', 'JWT', 'OpenAI API', 'Nodemailer']
  }
]

function useCountUp(refs) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('[data-count-val]')
          items.forEach(item => {
            const target = parseFloat(item.dataset.countVal)
            const suffix = item.dataset.countSuffix || ''
            const dur = 1800, start = performance.now()
            const update = now => {
              const t = Math.min((now - start) / dur, 1)
              const ease = 1 - Math.pow(1 - t, 4)
              const display = suffix ? Math.floor(ease * target) : (ease * target).toFixed(1)
              item.textContent = display + (t === 1 ? suffix : '')
              if (t < 1) requestAnimationFrame(update)
            }
            requestAnimationFrame(update)
          })
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.2 })
    refs.current.forEach(ref => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [refs])
}

function useTilt(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const blocks = el.querySelectorAll('.proj-block')
    const handlers = []
    blocks.forEach(b => {
      const onMove = (e) => {
        const r = b.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        b.style.setProperty('--tx', x * 4 + 'deg')
        b.style.setProperty('--ty', y * -4 + 'deg')
      }
      const onLeave = () => {
        b.style.setProperty('--tx', '0deg')
        b.style.setProperty('--ty', '0deg')
      }
      b.addEventListener('mousemove', onMove)
      b.addEventListener('mouseleave', onLeave)
      handlers.push({ el: b, onMove, onLeave })
    })
    return () => handlers.forEach(({ el, onMove, onLeave }) => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) })
  }, [ref])
}

export default function Projects() {
  const countRefs = useRef([])
  const tiltRef = useRef(null)
  const itemRefs = useRef([])

  useCountUp(countRefs)
  useTilt(tiltRef)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    itemRefs.current.forEach(ref => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" aria-label="Software projects portfolio">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">03 — PROJECTS</div>
          <h2 className="section-h2">
            Software <em>Projects</em>
            <span className="accent-line">8 production-grade apps built for real impact</span>
          </h2>
        </ScrollReveal>
      </div>
      <div className="projects-timeline container" ref={tiltRef}>
        {projects.map((p, i) => (
          <div
            key={i}
            className="proj-item"
            ref={el => itemRefs.current[i] = el}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className="proj-block">
              <div className="proj-num">{p.num}</div>
              <div className="proj-visual">
                <div className="proj-mockup">
                  <div className="mock-bar"><span /><span /><span /></div>
                  <div className="mock-image-wrap">
                    <img src={p.img} alt={p.title} className="proj-img" loading="lazy" onError={e => { e.target.style.display='none'; const ph = document.createElement('div'); ph.className='img-placeholder'; ph.textContent='⊞'; e.target.parentElement.appendChild(ph) }} />
                  </div>
                </div>
              </div>
              <div className="proj-info">
                <h3 className="proj-title">{p.title}</h3>
                <p className="proj-desc">{p.desc}</p>
                <h4 className="proj-achs-heading">Key achievements</h4>
                <div className="proj-achs" ref={el => countRefs.current[i] = el}>
                  {p.ach.map((a, j) => (
                    <div key={j} className="pa">
                      <span className="pav" data-count-val={a.v} data-count-suffix={a.suffix || ''}>{a.v}{a.suffix || ''}</span>
                      <span className="pal">{a.l}</span>
                    </div>
                  ))}
                </div>
                <ul className="proj-ul">
                  {p.points.map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
                <div className="proj-stack">
                  {p.stack.map((s, j) => <span key={j}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
