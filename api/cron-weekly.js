// Runs every Friday at 18:00 UTC (20:00 Spain) via Vercel cron
// Sends a push notification to all subscribed users

export default async function handler(req, res) {
  // Vercel cron requests include this header for security
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end()
  }

  try {
    const response = await fetch(`${process.env.APP_URL || 'https://zineclub.io'}/api/push-send`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-push-secret': process.env.PUSH_SECRET || '',
      },
      body: JSON.stringify({
        title: '¿Planes para esta noche? ✦',
        body:  'Tu próxima recomendación perfecta te espera. 5 preguntas, 30 segundos.',
        url:   '/',
      }),
    })

    const data = await response.json()
    res.json({ ok: true, ...data })
  } catch (err) {
    res.status(500).json({ error: String(err) }  )
  }
}
