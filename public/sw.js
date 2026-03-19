// Zine Club Service Worker — Push Notifications

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = { title: 'Zine Club', body: 'Tienes algo pendiente que ver ✦', url: '/' }
  try { data = { ...data, ...event.data.json() } } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     'zineclub',
      renotify: true,
      data:    { url: data.url },
      actions: [
        { action: 'open',    title: 'Ver ahora' },
        { action: 'dismiss', title: 'Luego' },
      ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const match = clients.find(c => c.url.includes(self.location.origin))
      if (match) return match.focus()
      return self.clients.openWindow(url)
    })
  )
})
