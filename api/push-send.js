import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.SUPABASE_URL || 'https://scqoqwmkptyxwpiwhkyk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
)

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'hola@zineclub.io'}`,
  process.env.VAPID_PUBLIC_KEY  || 'BKykByTYF0CyNDOu26KcqRS8sxIxZOe42JC8eCnDxlJxbr2Kr2dbMkTNBji2TqezWKPRM4ovSBoY9qoXB1CybXc',
  process.env.VAPID_PRIVATE_KEY || '1c4I6J8lgNnQ_1gJZarcGh_QXQ6jKA7bM4yU3apRZzI'
)

export default async function handler(req, res) {
  // Protect with a secret so it can only be called server-side
  const secret = req.headers['x-push-secret']
  if (secret !== process.env.PUSH_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  const { userId, title, body, url = '/' } = req.body || {}
  const payload = JSON.stringify({ title: title || 'Zine Club', body, url })

  // Get subscriptions — either for one user or all
  const query = sb.from('push_subscriptions').select('*')
  if (userId) query.eq('user_id', userId)
  const { data: subs } = await query

  if (!subs?.length) return res.json({ sent: 0 })

  let sent = 0
  const stale = []

  await Promise.all((subs).map(async (row) => {
    const pushSub = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    }
    try {
      await webpush.sendNotification(pushSub, payload)
      sent++
    } catch (err) {
      // 410 Gone = subscription expired, remove it
      if (err.statusCode === 410) stale.push(row.id)
    }
  }))

  // Clean up expired subscriptions
  if (stale.length) await sb.from('push_subscriptions').delete().in('id', stale)

  res.json({ sent, stale: stale.length })
}
