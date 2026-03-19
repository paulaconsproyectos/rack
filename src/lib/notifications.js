// VAPID public key — also set VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY + VAPID_EMAIL in Vercel env vars
export const VAPID_PUBLIC_KEY = 'BKykByTYF0CyNDOu26KcqRS8sxIxZOe42JC8eCnDxlJxbr2Kr2dbMkTNBji2TqezWKPRM4ovSBoY9qoXB1CybXc'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData  = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch { return null }
}

export function canPush() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function pushPermission() {
  return Notification.permission // 'default' | 'granted' | 'denied'
}

export async function subscribePush() {
  if (!canPush()) return null
  const reg = await navigator.serviceWorker.ready
  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    return sub.toJSON()
  } catch { return null }
}

export async function savePushSubscription(userId, sub) {
  if (!sub) return
  try {
    await fetch('/api/push-subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription: sub }),
    })
  } catch {}
}

export async function requestAndSave(userId) {
  if (!canPush() || pushPermission() === 'denied') return false
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false
  const sub = await subscribePush()
  if (sub) await savePushSubscription(userId, sub)
  return !!sub
}
