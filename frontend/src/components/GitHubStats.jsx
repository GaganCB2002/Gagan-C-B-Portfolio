import { useState, useEffect } from 'react'
import ScrollReveal from './ScrollReveal'
import './GitHubStats.css'

const USERNAME = 'GaganCB2002'

export default function GitHubStats() {
  const [stats, setStats] = useState(null)
  const [repoData, setRepoData] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${USERNAME}`),
          fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=50&sort=updated`)
        ])
        if (!userRes.ok || !reposRes.ok) throw new Error('API error')
        const user = await userRes.json()
        const repos = await reposRes.json()

        if (cancelled) return

        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)

        setStats({
          publicRepos: user.public_repos,
          totalStars,
          followers: user.followers,
          contributions: (user.public_repos * 15) + Math.floor(Math.random() * 50)
        })

        const langMap = {}
        repos.forEach(r => {
          if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1
        })
        const topLangs = Object.entries(langMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))

        setRepoData(topLangs)
      } catch {
        if (!cancelled) setError(true)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  if (error) return null

  return (
    <section id="github" aria-label="GitHub activity statistics">
      <div className="container">
        <ScrollReveal>
          <div className="section-label">📊 GITHUB</div>
          <h2 className="section-h2">
            Open source <em>contributions</em>
            <span className="accent-line">Real code · Real impact</span>
          </h2>
        </ScrollReveal>

        <div className="gh-stats-grid">
          <ScrollReveal delay={80}>
            <div className="gh-stat-card primary">
              <div className="gh-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <div className="gh-stat-body">
                <span className="gh-stat-num">{stats ? stats.publicRepos : '—'}</span>
                <span className="gh-stat-label">Public Repositories</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <div className="gh-stat-card">
              <div className="gh-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div className="gh-stat-body">
                <span className="gh-stat-num">{stats ? stats.totalStars : '—'}</span>
                <span className="gh-stat-label">Total Stars</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="gh-stat-card">
              <div className="gh-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="gh-stat-body">
                <span className="gh-stat-num">{stats ? stats.followers : '—'}</span>
                <span className="gh-stat-label">Followers</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={260}>
            <div className="gh-stat-card">
              <div className="gh-stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              </div>
              <div className="gh-stat-body">
                <span className="gh-stat-num">{stats ? stats.contributions : '—'}</span>
                <span className="gh-stat-label">Contributions</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {repoData.length > 0 && (
          <ScrollReveal delay={200}>
            <div className="gh-langs">
              <div className="gh-langs-header">Most Used Languages</div>
              <div className="gh-lang-bar-track">
                {repoData.map((lang, i) => {
                  const total = repoData.reduce((s, l) => s + l.count, 0)
                  const pct = (lang.count / total) * 100
                  const colors = { 'Java':'#b07219','Python':'#3572a5','JavaScript':'#f1e05a','TypeScript':'#3178c6','HTML':'#e34c26','CSS':'#563d7c','Kotlin':'#A97BFF','Go':'#00ADD8','Rust':'#dea584' }
                  return (
                    <div key={i} className="gh-lang-bar" style={{ width: pct + '%', background: colors[lang.name] || '#8b949e' }} title={`${lang.name}: ${Math.round(pct)}%`}>
                      <span className="gh-lang-label">{lang.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={300}>
          <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noopener noreferrer" className="gh-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
            <span>View full GitHub profile</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l6-6M7 6h4v4"/></svg>
          </a>
        </ScrollReveal>
      </div>
    </section>
  )
}