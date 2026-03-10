// Initials from name
export const initials = (name) =>
  (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

// Random alphanumeric code
export const genCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase()

// Clamp number
export const clamp = (n, a, b) => Math.min(Math.max(n, a), b)

// Encode URI component safely
export const enc = (s) => encodeURIComponent(s || '')

// Format runtime
export const formatRuntime = (mins) => {
  if (!mins) return ''
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

// Points for watching a film (based on score)
export const watchPoints = (film) => Math.round((parseFloat(film.score) || 5) * 10)

// Vibrate (safe)
export const vibrate = (pattern = [30, 20, 60]) => {
  try { navigator.vibrate?.(pattern) } catch {}
}

// Share (safe)
export const shareFilm = (film) => {
  const title = film.titleEs || film.title
  const url   = 'https://paulaconsproyectos.github.io/zineclub/'
  const text  = `Mira "${title}" en Zine Club`
  if (navigator.share) {
    navigator.share({ title: 'Zine Club', text, url }).catch(() => {})
  } else {
    try { navigator.clipboard.writeText(`${text} ${url}`) } catch {}
  }
}

// Update streak
export const computeStreak = (prev) => {
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (prev.lastDate === today) return prev
  const count = prev.lastDate === yesterday ? prev.count + 1 : 1
  return { count, lastDate: today }
}

// Type pill styles
export const typePillStyle = (item) => {
  if (!item) return {}
  if (item.mediaType === 'movie') return { bg: 'rgba(201,169,110,0.12)', color: '#DFC08A' }
  const t = item.seriesType || 'Serie'
  const map = {
    Miniserie:    { bg: 'rgba(168,85,247,0.15)',  color: '#C084FC' },
    'Serie corta': { bg: 'rgba(96,165,250,0.15)',  color: '#93C5FD' },
    'Serie larga': { bg: 'rgba(249,115,22,0.15)',  color: '#FB923C' },
    Serie:         { bg: 'rgba(96,165,250,0.15)',  color: '#93C5FD' },
  }
  return map[t] || map['Serie']
}
