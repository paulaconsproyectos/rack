import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.SUPABASE_URL     || 'https://scqoqwmkptyxwpiwhkyk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const BONUS = 50

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { newUserId, inviteCode } = req.body || {}
  if (!newUserId || !inviteCode) return res.status(400).json({ error: 'Missing data' })

  // Find referrer by invite_code
  const { data: referrer } = await sb
    .from('profiles')
    .select('id, score')
    .eq('invite_code', inviteCode.toUpperCase())
    .maybeSingle()

  if (!referrer || referrer.id === newUserId) return res.json({ ok: false, reason: 'not found' })

  // Award bonus to both in parallel
  await Promise.all([
    sb.from('profiles').update({ score: (referrer.score || 0) + BONUS }).eq('id', referrer.id),
    sb.from('profiles').update({ score: BONUS }).eq('id', newUserId),
  ])

  // Log referral
  await sb.from('referrals').insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    bonus:       BONUS,
  }).catch(() => {})   // silent fail if table doesn't exist yet

  res.json({ ok: true, referrerId: referrer.id })
}
