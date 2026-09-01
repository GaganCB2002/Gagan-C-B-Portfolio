const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const isDev = import.meta.env.DEV
const debug = (...args) => { if (isDev) console.debug('[Tracker]', ...args) }
const warn = (...args) => { if (isDev) console.warn('[Tracker]', ...args) }

function getBrowser() {
  const ua = navigator.userAgent

  if (typeof navigator.brave !== 'undefined' && navigator.brave?.isBrave) {
    return 'Brave'
  }
  if (ua.includes('YaBrowser')) return 'Yandex Browser'
  if (ua.includes('Vivaldi')) return 'Vivaldi'
  if (ua.includes('UCBrowser') || ua.includes('UCWEB')) return 'UC Browser'
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet'
  if (ua.includes('Edg') || ua.includes('Edge')) return 'Edge'
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Chromium')) return 'Chromium'

  return 'Unknown'
}

function getBrowserVersion() {
  const ua = navigator.userAgent
  const match = ua.match(/(Chrome|Firefox|Safari|Edg|OPR|YaBrowser|Vivaldi|SamsungBrowser|UCBrowser|Chromium)\/([\d.]+)/)
  if (match) return match[2]
  const fxFox = ua.match(/Firefox\/([\d.]+)/)
  if (fxFox) return fxFox[1]
  return ''
}

function getOS() {
  const ua = navigator.userAgent
  if (/Windows NT 11/i.test(ua)) return 'Windows 11'
  if (/Windows NT 10/i.test(ua)) return 'Windows 10'
  if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1'
  if (/Windows NT 6\.2/i.test(ua)) return 'Windows 8'
  if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac OS X ([\d_]+)/i.test(ua)) return 'macOS ' + ua.match(/Mac OS X ([\d_]+)/i)[1].replace(/_/g, '.')
  if (/Mac/i.test(ua)) return 'macOS'
  if (/Android ([\d.]+)/i.test(ua)) return 'Android ' + ua.match(/Android ([\d.]+)/i)[1]
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const osv = ua.match(/OS ([\d_]+)/)
    return 'iOS ' + (osv ? osv[1].replace(/_/g, '.') : '')
  }
  if (/CrOS/i.test(ua)) return 'ChromeOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return navigator.platform || 'Unknown'
}

function getDevice() {
  const ua = navigator.userAgent
  if (/iPad/i.test(ua)) return 'Tablet'
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return 'Tablet'
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function getScreen() {
  return `${window.screen.width}x${window.screen.height}`
}

function getConnectionType() {
  if (!navigator.connection) return 'N/A'
  const conn = navigator.connection
  const type = conn.effectiveType || ''
  const downlink = conn.downlink ? `${conn.downlink}Mbps` : ''
  return [type, downlink].filter(Boolean).join(' ')
}

let visitId = null
let startTime = Date.now()
let pages = []

function getTimeOnSite() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  if (elapsed < 60) return `${elapsed}s`
  const min = Math.floor(elapsed / 60)
  const sec = elapsed % 60
  return `${min}m ${sec}s`
}

function getPerformanceMetrics() {
  try {
    const nav = performance.getEntriesByType('navigation')[0]
    if (nav) {
      return {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        loadTime: Math.round(nav.loadEventEnd),
        domInteractive: Math.round(nav.domInteractive)
      }
    }
  } catch (err) {
    debug('Performance metrics unavailable:', err)
  }
  return {}
}

export async function trackVisit() {
  try {
    const pagePath = window.location.pathname + window.location.hash
    if (!pages.includes(pagePath)) {
      pages.push(pagePath)
    }

    const payload = {
      browser: getBrowser(),
      browserVersion: getBrowserVersion(),
      os: getOS(),
      device: getDevice(),
      screen: getScreen(),
      language: navigator.language || navigator.userLanguage || '',
      platform: navigator.platform || '',
      cores: navigator.hardwareConcurrency || '',
      referrer: document.referrer || '',
      pages,
      timeOnSite: getTimeOnSite(),
      connection: getConnectionType(),
      doNotTrack: navigator.doNotTrack || window.doNotTrack || 'unspecified',
      touchScreen: 'ontouchstart' in window,
      cookiesEnabled: navigator.cookieEnabled,
      pageLoadTime: getPerformanceMetrics().loadTime || '',
      url: window.location.href
    }

    const res = await fetch(`${API_BASE}/api/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (data.success) {
      visitId = data.id
    }
    return data
  } catch (err) {
    warn('Failed to record visit:', err.message)
    return null
  }
}

export function getVisitId() {
  return visitId
}

export function updateVisit() {
  if (!visitId) return
  const payload = {
    timeOnSite: getTimeOnSite(),
    pages
  }
  fetch(`${API_BASE}/api/visit/${visitId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: 'omit'
  }).catch(err => debug('updateVisit failed:', err))
}

export function trackPage(pageName) {
  if (!pages.includes(pageName)) {
    pages.push(pageName)
    updateVisit()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      updateVisit()
    }
  })
  window.addEventListener('beforeunload', () => {
    updateVisit()
  })
}
