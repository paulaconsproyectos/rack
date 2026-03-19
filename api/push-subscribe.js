import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.SUPABASE_URL     || 'https://scqoqwmkptyxwpiwhkyk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ''
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, subscription } = req.body || {}
  if (!userId || !subscription?.endpoint) return res.status(400).json({ error: 'Missing data' })

  try {
    await sb.from('push_subscriptions').upsert({
      user_id:  userId,
      endpoint: subscription.endpoint,
      p256dh:   subscription.keys?.p256dh || '',
      auth:     subscription.keys?.auth   || '',
    }, { onConflict: 'user_id,endpoint' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
