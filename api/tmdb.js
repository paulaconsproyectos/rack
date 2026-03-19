export default async function handler(req, res) {
  const path = req.query.path
  if (!path) return res.status(400).json({ error: 'Missing path' })

  const key = process.env.TMDB_KEY
  if (!key) return res.status(500).json({ error: 'TMDB_KEY not configured in environment variables' })

  const url = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${key}`

  try {
    const r    = await fetch(url)
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=1800')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'TMDB fetch failed' })
  }
}
