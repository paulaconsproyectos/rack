import { PLATFORMS } from '../constants/platforms.js'
import { SENTIR_GENRES_M, SENTIR_GENRES_T, EVITAR_EXCL } from '../constants/quiz.js'

export const IMG_W   = 'https://image.tmdb.org/t/p/w500'
export const IMG_SM  = 'https://image.tmdb.org/t/p/w185'
export const IMG_W7  = 'https://image.tmdb.org/t/p/w780'
export const IMG_ORI = 'https://image.tmdb.org/t/p/original'

const enc = (s) => encodeURIComponent(s || '')

const api = (path) => {
  const sep = path.includes('?') ? '&' : '?'
  const pathWithLang = `${path}${sep}language=es-ES`
  return fetch(`/api/tmdb?path=${encodeURIComponent(pathWithLang)}`)
    .then((r) => r.json())
}

// ── Mappers ──────────────────────────────────────────────
export const mapMovie = (m) => ({
  id:          m.id,
  title:       m.title || m.name,
  titleEs:     m.title || m.name,
  year:        (m.release_date || '').slice(0, 4),
  type:        'Película',
  mediaType:   'movie',
  tmdbId:      m.id,
  poster:      m.poster_path  ? IMG_W  + m.poster_path  : null,
  backdrop:    m.backdrop_path ? IMG_W7 + m.backdrop_path : null,
  description: m.overview || '',
  score:       m.vote_average ? m.vote_average.toFixed(1) : '',
  streaming:   [],
  genres:      [],
})

export const mapTV = (m) => ({
  id:          m.id,
  title:       m.name || m.title,
  titleEs:     m.name || m.title,
  year:        (m.first_air_date || '').slice(0, 4),
  type:        'Serie',
  mediaType:   'tv',
  tmdbId:      m.id,
  poster:      m.poster_path  ? IMG_W  + m.poster_path  : null,
  backdrop:    m.backdrop_path ? IMG_W7 + m.backdrop_path : null,
  description: m.overview || '',
  score:       m.vote_average ? m.vote_average.toFixed(1) : '',
  streaming:   [],
  genres:      [],
})

// ── Enrich a single film with full details ─────────────
export async function enrichFilm(item) {
  try {
    const d = await api(`/${item.mediaType}/${item.tmdbId}?append_to_response=credits,watch/providers,videos,similar`)

    const prov     = d['watch/providers']?.results?.ES
    const flatrate = prov?.flatrate?.map((p) => p.provider_name) || []
    const rent     = prov?.rent?.map((p) => p.provider_name) || []

    const seen = new Set()
    const streaming = [...flatrate, ...rent].filter((n) => {
      if (seen.has(n)) return false
      seen.add(n)
      return true
    })

    const vids    = d.videos?.results || []
    const trailer = vids.find((v) => v.type === 'Trailer' && v.site === 'YouTube')
                 || vids.find((v) => v.site === 'YouTube')

    const similar = (d.similar?.results || []).slice(0, 10).map((s) => ({
      id:        s.id,
      title:     s.title || s.name,
      titleEs:   s.title || s.name,
      poster:    s.poster_path ? IMG_W + s.poster_path : null,
      mediaType: item.mediaType,
      tmdbId:    s.id,
    }))

    const crew      = d.credits?.crew || []
    const dirObj    = crew.find((c) => c.job === 'Director')
    const castArr   = (d.credits?.cast || []).slice(0, 8).map((c) => ({
      id:        c.id,
      name:      c.name,
      character: c.character || '',
      photo:     c.profile_path ? IMG_SM + c.profile_path : null,
    }))

    const mins      = d.runtime || 0
    const duration  = mins > 0
      ? `${Math.floor(mins / 60)}h ${mins % 60}m`
      : (d.episode_run_time?.[0] ? `${d.episode_run_time[0]} min` : '')

    let seriesType = 'Serie'
    if (item.mediaType === 'tv') {
      const eps  = d.number_of_episodes || 0
      const seas = d.number_of_seasons  || 1
      if (seas === 1 && eps <= 8) seriesType = 'Miniserie'
      else if (seas <= 3)          seriesType = 'Serie corta'
      else                         seriesType = 'Serie larga'
    }

    return {
      ...item,
      genres:     (d.genres || []).slice(0, 3).map((g) => g.name),
      director:   item.mediaType === 'movie'
                    ? (dirObj?.name || '')
                    : (d.created_by?.[0]?.name || ''),
      cast:       castArr,
      duration,
      seriesType,
      streaming,
      tagline:    d.tagline || '',
      trailerKey: trailer?.key || null,
      similar,
    }
  } catch {
    return item
  }
}

// ── Person detail ─────────────────────────────────────
export async function fetchPerson(personId) {
  try {
    const d = await api(`/person/${personId}?append_to_response=combined_credits`)
    const known = (d.combined_credits?.cast || [])
      .filter((m) => m.poster_path && (m.vote_count || 0) > 200)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5)
      .map((m) => ({
        id:      m.id,
        title:   m.title || m.name,
        poster:  IMG_W + m.poster_path,
        year:    (m.release_date || m.first_air_date || '').slice(0, 4),
      }))
    return {
      id:         d.id,
      name:       d.name,
      photo:      d.profile_path ? IMG_W + d.profile_path : null,
      bio:        d.biography || '',
      birthday:   d.birthday || '',
      birthplace: d.place_of_birth || '',
      known:      known,
    }
  } catch {
    return null
  }
}

// ── Weekly trending (POTW) ─────────────────────────────
export async function fetchWeeklyPick() {
  const d = await api('/trending/all/week')
  const top = (d.results || [])[0]
  if (!top) return null
  const item = top.media_type === 'movie' ? mapMovie(top) : mapTV(top)
  return enrichFilm(item)
}

// ── Now playing ────────────────────────────────────────
export async function fetchNowPlaying() {
  const d = await api('/movie/now_playing?region=ES')
  return (d.results || [])
    .slice(0, 10)
    .filter((m) => m.poster_path)
    .map(mapMovie)
}

// ── Trending (for TikTok mode seed) ───────────────────
export async function fetchTrending(type = 'movie') {
  const d = await api(`/trending/${type}/week`)
  const mapper = type === 'movie' ? mapMovie : mapTV
  return (d.results || []).filter((m) => m.poster_path).slice(0, 12).map(mapper)
}

// ── Search ────────────────────────────────────────────
export async function searchFilms(query) {
  const d = await api(`/search/multi?query=${enc(query)}`)
  return (d.results || [])
    .filter((m) => (m.media_type === 'movie' || m.media_type === 'tv') && m.poster_path)
    .slice(0, 15)
    .map((m) => m.media_type === 'movie' ? mapMovie(m) : mapTV(m))
}

// ── Platform browse ───────────────────────────────────
export async function fetchByPlatform(platformName) {
  const p = PLATFORMS[platformName]
  if (!p?.provId) return []
  const [movies, tv] = await Promise.all([
    api(`/discover/movie?sort_by=popularity.desc&vote_average.gte=6.0&watch_region=ES&with_watch_providers=${p.provId}`)
      .then(d => (d.results || []).filter(m => m.poster_path).slice(0, 10).map(mapMovie))
      .catch(() => []),
    api(`/discover/tv?sort_by=popularity.desc&vote_average.gte=6.0&watch_region=ES&with_watch_providers=${p.provId}`)
      .then(d => (d.results || []).filter(m => m.poster_path).slice(0, 10).map(mapTV))
      .catch(() => []),
  ])
  // interleave movies and tv, deduplicate by id
  const seen = new Set()
  return [...movies, ...tv]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .filter(f => { if (seen.has(f.id)) return false; seen.add(f.id); return true })
    .slice(0, 18)
}

// ── Upcoming ─────────────────────────────────────────
export async function fetchUpcoming() {
  const today = new Date().toISOString().slice(0, 10)
  const in60  = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10)
  const [movies, tv] = await Promise.all([
    api('/movie/upcoming?region=ES')
      .then(d => (d.results || []).slice(0, 8).map(m => ({ ...mapMovie(m), releaseDate: m.release_date || '' })))
      .catch(() => []),
    api(`/discover/tv?sort_by=first_air_date.asc&first_air_date.gte=${today}&first_air_date.lte=${in60}&watch_region=ES&with_watch_providers=8|384|337|119|63|350|149`)
      .then(d => (d.results || []).filter(m => m.poster_path).slice(0, 8).map(m => ({ ...mapTV(m), releaseDate: m.first_air_date || '' })))
      .catch(() => []),
  ])
  return [...movies, ...tv]
    .filter(f => f.poster)
    .sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''))
    .slice(0, 12)
}

// ── Mood discovery ─────────────────────────────────────
export async function discoverByMood(answers) {
  const {
    sentir = '',
    formato = 'Lo que sea, sorpréndeme',
    tiempo = '',
    compania = '',
    evitar = [],
    plataformas = [],
  } = answers || {}

  const isMarathon  = tiempo === 'Tengo toda la noche'
  const evitarList  = Array.isArray(evitar) ? evitar : []
  const noSurprises = evitarList.length === 0 || evitarList.includes('Nada, sorpréndeme')

  // Format → movie/TV flags
  let wMovies = true, wTV = true
  switch (formato) {
    case 'Película':                     wMovies = true;  wTV = false; break
    case 'Miniserie (pocos episodios)':  wMovies = false; wTV = true;  break
    case 'Serie corta (1-2 temporadas)': wMovies = false; wTV = true;  break
    case 'Serie larga (3+ temporadas)':  wMovies = false; wTV = true;  break
    default:                             wMovies = true;  wTV = true;  break
  }
  if (isMarathon) { wMovies = true; wTV = true }

  // Runtime filter only when explicitly asking for movies with a time constraint
  let durParam = ''
  if (wMovies && !wTV) {
    switch (tiempo) {
      case 'Menos de 1h30':             durParam = '&with_runtime.lte=90'; break
      case 'Película normal (1h30–2h)': durParam = '&with_runtime.gte=80&with_runtime.lte=130'; break
      case 'Película larga (2h+)':      durParam = '&with_runtime.gte=110'; break
    }
  }

  // Sentir → genre IDs
  const genresM = SENTIR_GENRES_M[sentir] || [18, 35, 28]
  const genresT = SENTIR_GENRES_T[sentir] || [18, 35]
  const gM = genresM.join('|')
  const gT = genresT.join('|')

  // Platforms → provider IDs
  // NOTE: no flatrate filter — TMDB ES flatrate data is incomplete and would kill results
  const ALL_PIDS = [8, 384, 337, 119, 63, 350, 149, 76, 531, 100, 35]
  const pids = plataformas.length
    ? plataformas.map(p => PLATFORMS[p]?.provId).filter(Boolean)
    : ALL_PIDS
  const pParam = `&with_watch_providers=${pids.join('|')}&watch_region=ES`

  // Family / kids filter
  const isFamily = compania === 'Con familia / niños'
  const noKidsM  = isFamily ? '' : '&without_genres=10751'
  const noKidsT  = isFamily ? '' : '&without_genres=10751,10762'

  // Evitar → genre exclusions
  let exclM = '', exclT = ''
  if (!noSurprises) {
    const exclSet = new Set()
    evitarList.forEach(e => (EVITAR_EXCL[e] || []).forEach(g => exclSet.add(g)))
    if (isFamily) exclSet.delete(10751)
    if (exclSet.size) { exclM = `&without_genres=${[...exclSet].join(',')}`; exclT = exclM }
  }

  const qual  = '&vote_average.gte=6.0'
  const limit = isMarathon ? 8 : 6
  const pg    = Math.floor(Math.random() * 3) + 1

  const fetchM = async (params) => {
    try {
      const d = await api(`/discover/movie?sort_by=popularity.desc&vote_count.gte=100${qual}${params}`)
      return (d.results || []).filter(x => x.poster_path).slice(0, limit).map(mapMovie)
    } catch { return [] }
  }

  const fetchT = async (params) => {
    try {
      const d = await api(`/discover/tv?sort_by=popularity.desc&vote_count.gte=50${qual}${params}`)
      return (d.results || []).filter(x => x.poster_path).slice(0, limit).map(mapTV)
    } catch { return [] }
  }

  let all = []

  // L1: genre + platform + exclusions + runtime
  const l1 = await Promise.all([
    wMovies ? fetchM(`&with_genres=${gM}${pParam}${durParam}${noKidsM}${exclM}&page=${pg}`) : Promise.resolve([]),
    wTV     ? fetchT(`&with_genres=${gT}${pParam}${noKidsT}${exclT}&page=${pg}`) : Promise.resolve([]),
  ])
  all = l1.flat()

  // L2: single leading genre + platform (drop multi-genre and exclusions)
  if (all.length < 3) {
    const l2 = await Promise.all([
      wMovies ? fetchM(`&with_genres=${genresM[0]}${pParam}${noKidsM}${durParam}&page=${pg}`) : Promise.resolve([]),
      wTV     ? fetchT(`&with_genres=${genresT[0]}${pParam}${noKidsT}&page=${pg}`) : Promise.resolve([]),
    ])
    all = [...all, ...l2.flat()]
  }

  // L3: genre only — drop platform filter entirely
  if (all.length < 3) {
    const l3 = await Promise.all([
      wMovies ? fetchM(`&with_genres=${gM}${noKidsM}${durParam}&page=1`) : Promise.resolve([]),
      wTV     ? fetchT(`&with_genres=${gT}${noKidsT}&page=1`) : Promise.resolve([]),
    ])
    all = [...all, ...l3.flat()]
  }

  // L4: no genre, no platform — just popular quality content
  if (all.length < 3) {
    const l4 = await Promise.all([
      wMovies ? fetchM(`${noKidsM}${durParam}&page=1`) : Promise.resolve([]),
      wTV     ? fetchT(`${noKidsT}&page=1`) : Promise.resolve([]),
    ])
    all = [...all, ...l4.flat()]
  }

  // L5: trending — absolute guaranteed fallback
  if (all.length < 2) {
    const l5 = await Promise.all([
      wMovies ? api('/trending/movie/week').then(d => (d.results||[]).filter(x=>x.poster_path).slice(0,6).map(mapMovie)).catch(()=>[]) : Promise.resolve([]),
      wTV     ? api('/trending/tv/week').then(d => (d.results||[]).filter(x=>x.poster_path).slice(0,6).map(mapTV)).catch(()=>[]) : Promise.resolve([]),
    ])
    all = [...all, ...l5.flat()]
  }

  // Deduplicate
  const seen = new Set()
  return all.filter(f => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return !!f.poster
  })
}
