// localStorage helpers with try/catch safety
export const LS = {
  get: (key, def) => {
    try {
      const v = localStorage.getItem(key)
      return v != null ? JSON.parse(v) : def
    } catch {
      return def
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {}
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {}
  },
}

// Key constants — use zc_ prefix (migrated from rack_ prefix)
export const KEYS = {
  streak:   'zc_streak',
  notif:    'zc_notif',
  notifF:   'zc_notifF',
  reviews:  'zc_reviews',
  inv:      'zc_inv',
  search:   'zc_search',
  avatar:   (id) => `zc_av_${id}`,
}
