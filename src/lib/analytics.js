import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY

if (KEY) {
  posthog.init(KEY, {
    api_host:             'https://eu.i.posthog.com',
    person_profiles:      'identified_only',
    capture_pageview:     false,
    capture_pageleave:    false,
    autocapture:          false,
  })
}

export function identify(userId, props = {}) {
  if (!KEY) return
  posthog.identify(userId, props)
}

export function reset() {
  if (!KEY) return
  posthog.reset()
}

export function track(event, props = {}) {
  if (!KEY) return
  posthog.capture(event, props)
}
