// Runs every 2 hours via Vercel cron
// Sends push notification to users who watched a film 2h ago but haven't reviewed it

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.SUPABASE_URL        || 'https://scqoqwmkptyxwpiwhkyk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end()
  }

  // Get pending reminders that are due and not yet sent
  const { data: reminders } = await sb
    .from('review_reminders')
    .select('*')
    .eq('sent', false)
    .lte('notify_at', new Date().toISOString())
    .limit(100)

  if (!reminders?.length) return res.json({ sent: 0 })

  let sent = 0
  const appUrl = process.env.APP_URL || 'https://zineclub.io'

  // Get film IDs that already have feedback so we skip them
  const filmIds = reminders.map(r => r.film_id)
  const { data: alreadyReviewed } = await sb
    .from('feedback')
    .select('user_id, film_id')
    .in('film_id', filmIds)

  const reviewed = new Set((alreadyReviewed || []).map(f => `${f.user_id}:${f.film_id}`))

  await Promise.all(reminders.map(async (r) => {
    // Skip if already reviewed
    if (reviewed.has(`${r.user_id}:${r.film_id}`)) {
      await sb.from('review_reminders').update({ sent: true }).eq('id', r.id)
      return
    }
    try {
      await fetch(`${appUrl}/api/push-send`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'x-push-secret': process.env.PUSH_SECRET || '',
        },
        body: JSON.stringify({
          userId: r.user_id,
          title:  '¿Qué te pareció? ✦',
          body:   `Cuéntanos qué te pareció "${r.film_title}". Tu opinión mejora las próximas recomendaciones.`,
          url:    '/',
        }),
      })
      await sb.from('review_reminders').update({ sent: true }).eq('id', r.id)
      sent++
    } catch {}
  }))

  res.json({ sent })
}
