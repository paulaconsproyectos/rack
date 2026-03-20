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
  flag: (key) => {
    try { return !!localStorage.getItem(key) } catch { return false }
  },
  setFlag: (key) => {
    try { localStorage.setItem(key, '1') } catch {}
  },
}

// All localStorage keys in one place — zc_ prefix
export const KEYS = {
  // Auth / onboarding
  onboarded:    'zc_onboarded',
  ref:          'zc_ref',

  // Paywall / tests
  testsUsed:    'zc_tests_used',
  mvpCode:      'zc_mvp_code',

  // Notifications
  pushDismissed: 'zc_push_dismissed',

  // Feedback / recommendations
  feedback:     'zc_feedback',

  // User profile (persisted locally)
  streak:       'zc_streak',
  avatar:       (id) => `zc_av_${id}`,
}

// Old keys to purge from users' browsers (migration)
const STALE_KEYS = [
  'rack_auth', 'rack_user', 'rack_users', 'rack_session',
  'zc_notif', 'zc_notifF', 'zc_reviews', 'zc_inv', 'zc_search',
]

export function purgeStaleKeys() {
  STALE_KEYS.forEach(k => {
    try { localStorage.removeItem(k) } catch {}
  })
}
