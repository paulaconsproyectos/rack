export default async function handler(req, res) {
  const key = process.env.TMDB_KEY
  if (!key) {
    return res.status(200).json({ ok: false, error: 'TMDB_KEY missing' })
  }

  try {
    const url = `https://api.themoviedb.org/3/movie/popular?language=es-ES&page=1&api_key=${key}`
    const r = await fetch(url)
    const data = await r.json()
    return res.status(200).json({
      ok: r.ok,
      status: r.status,
      tmdb_status: data.status_code,
      tmdb_message: data.status_message,
      results_count: data.results?.length ?? 0,
      first_title: data.results?.[0]?.title ?? null,
    })
  } catch (err) {
    return res.status(200).json({ ok: false, error: String(err) })
  }
}
