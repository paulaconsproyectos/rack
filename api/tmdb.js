export default async function handler(req, res) {
  const path = req.query.path
  if (!path) return res.status(400).json({ error: 'Missing path' })

  const url = `https://api.themoviedb.org/3${path}${path.includes('?') ? '&' : '?'}api_key=${process.env.TMDB_KEY}`

  try {
    const r = await fetch(url)
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=3600')
    res.json(data)
  } catch {
    res.status(500).json({ error: 'TMDB error' })
  }
}
