import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.SUPABASE_URL        || 'https://scqoqwmkptyxwpiwhkyk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const DELAY_HOURS = 2

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, filmId, filmTitle } = req.body || {}
  if (!userId || !filmId) return res.status(400).json({ error: 'Missing data' })

  const notifyAt = new Date(Date.now() + DELAY_HOURS * 60 * 60 * 1000).toISOString()

  try {
    // Upsert — if they watch the same film again, reset the timer
    await sb.from('review_reminders').upsert({
      user_id:    userId,
      film_id:    String(filmId),
      film_title: filmTitle || '',
      notify_at:  notifyAt,
      sent:       false,
    }, { onConflict: 'user_id,film_id' })

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
