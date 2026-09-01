import api from './api'

let visitorId = null
let sessionId = null
let startTime = Date.now()
let pages = []

function getBrowser() {
  const ua = navigator.userAgent
  if (typeof navigator.brave !== 'undefined' && navigator.brave?.isBrave) return 'Brave'
  if (ua.includes('Edg') || ua.includes('Edge')) return 'Edge'
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  return 'Unknown'
}

function getOS() {
  const ua = navigator.userAgent
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac OS X/i.test(ua)) return 'macOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

function getDevice() {
  const ua = navigator.userAgent
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  if (/Mobile|Android|iPhone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function getScreen() {
  return `${window.screen.width}x${window.screen.height}`
}

export async function trackVisit() {
  try {
    const pagePath = window.location.pathname + window.location.hash
    if (!pages.includes(pagePath)) pages.push(pagePath)

    const payload = {
      browser: getBrowser(),
      os: getOS(),
      device: getDevice(),
      screen: getScreen(),
      language: navigator.language || '',
      referrer: document.referrer || '',
      pages,
      url: window.location.href
    }

    const res = await api.post('/visit', payload)
    if (res.data.success) {
      visitorId = res.data.id
      sessionId = res.data.id
    }
    return res.data
  } catch {
    return null
  }
}

export function trackPage(pageName) {
  if (!pages.includes(pageName)) {
    pages.push(pageName)
  }
}

export async function trackEvent(eventType, eventName, route = '', metadata = {}) {
  try {
    await api.post('/analytics/events', {
      eventType,
      eventName,
      route: route || window.location.pathname,
      metadata,
      visitorId,
      sessionId
    })
  } catch {
    // Silent fail for tracking
  }
}

export function trackPageView(pageName) {
  trackPage(pageName)
  trackEvent('PAGE_VIEW', `Viewed ${pageName}`, `/${pageName}`)
}

export function trackFeature(featureName, metadata = {}) {
  trackEvent('FEATURE_USED', featureName, window.location.pathname, metadata)
}

export function trackButtonClick(buttonName, metadata = {}) {
  trackEvent('BUTTON_CLICK', buttonName, window.location.pathname, metadata)
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (visitorId) {
      const payload = {
        timeOnSite: `${Math.floor((Date.now() - startTime) / 1000)}s`,
        pages
      }
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/visit/${visitorId}`,
        JSON.stringify(payload)
      )
    }
  })
}
