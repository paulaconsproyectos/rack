import { PLATFORMS } from '../constants/platforms.js'
import { GENRE_IDS_M, GENRE_IDS_T, ERA_DATES_M, ERA_DATES_T } from '../constants/quiz.js'

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

// ── Mood/Genre discovery ────────────────────────────────
export async function discoverByMood(answers) {
  const {
    formato     = 'Lo que sea',
    genero      = '',
    tiempo      = '',
    epoca       = 'Me da igual',
    plataformas = [],
  } = answers || {}

  const isMarathon = tiempo === 'Toda la noche'

  // Format → movie/TV flags
  let wMovies = true, wTV = true
  switch (formato) {
    case 'Una película':           wMovies = true;  wTV = false; break
    case 'Serie corta (1-2 temp.)': wMovies = false; wTV = true;  break
    case 'Serie larga (3+ temp.)':  wMovies = false; wTV = true;  break
    default:                        wMovies = true;  wTV = true;  break
  }
  if (isMarathon) { wMovies = true; wTV = true }

  // Runtime (movies only, when explicitly asking for a film)
  let durParam = ''
  if (wMovies && !wTV) {
    switch (tiempo) {
      case 'Menos de 1h30':  durParam = '&with_runtime.lte=90'; break
      case '1h30 — 2h':      durParam = '&with_runtime.gte=80&with_runtime.lte=130'; break
      case 'Más de 2 horas': durParam = '&with_runtime.gte=115'; break
    }
  }

  // Genre → TMDB IDs
  const genresM = GENRE_IDS_M[genero] || [18, 35, 28]
  const genresT = GENRE_IDS_T[genero] || [18, 35]
  const gM = genresM.join('|')
  const gT = genresT.join('|')

  // Era → date filter
  const eraM = ERA_DATES_M[epoca] ? `&${ERA_DATES_M[epoca]}` : ''
  const eraT = ERA_DATES_T[epoca] ? `&${ERA_DATES_T[epoca]}` : ''

  // Platforms → provider IDs
  const ALL_PIDS = [8, 384, 337, 119, 63, 350, 149, 100, 76, 531, 35]
  const pids = plataformas.length
    ? plataformas.map(p => PLATFORMS[p]?.provId).filter(Boolean)
    : ALL_PIDS
  const pParam = `&with_watch_providers=${pids.join('|')}&watch_region=ES`

  // Anti-anime: exclude animation unless genre IS animation (none in our list)
  // Also exclude kids/family genre unless "Con familia" (no such question now, just exclude)
  const noAnime = '&without_genres=16,10751,10762'

  const qual  = '&vote_average.gte=6.5&vote_count.gte=100'
  const qualT = '&vote_average.gte=6.5&vote_count.gte=50'
  const limit = 8
  // Alternate sort for variety: 70% popularity, 30% rating
  const sortBy = Math.random() < 0.7 ? 'popularity.desc' : 'vote_average.desc'
  const pg1    = Math.floor(Math.random() * 5) + 1
  const pg2    = Math.floor(Math.random() * 3) + 1

  const fetchM = async (params, pg = 1) =>
    api(`/discover/movie?sort_by=${sortBy}${qual}${params}&page=${pg}`)
      .then(d => (d.results||[]).filter(x=>x.poster_path).slice(0, limit).map(mapMovie))
      .catch(() => [])

  const fetchT = async (params, pg = 1) =>
    api(`/discover/tv?sort_by=${sortBy}${qualT}${params}&page=${pg}`)
      .then(d => (d.results||[]).filter(x=>x.poster_path).slice(0, limit).map(mapTV))
      .catch(() => [])

  let all = []

  // L1: genre + platform + era + anti-anime (random page for variety)
  const l1 = await Promise.all([
    wMovies ? fetchM(`&with_genres=${gM}${pParam}${durParam}${eraM}${noAnime}`, pg1) : Promise.resolve([]),
    wTV     ? fetchT(`&with_genres=${gT}${pParam}${eraT}${noAnime}`, pg1)            : Promise.resolve([]),
  ])
  all = l1.flat()

  // L2: genre + platform, relax era (random page)
  if (all.length < 3) {
    const l2 = await Promise.all([
      wMovies ? fetchM(`&with_genres=${gM}${pParam}${durParam}${noAnime}`, pg2) : Promise.resolve([]),
      wTV     ? fetchT(`&with_genres=${gT}${pParam}${noAnime}`, pg2)            : Promise.resolve([]),
    ])
    all = [...all, ...l2.flat()]
  }

  // L3: genre only — drop platform (biggest filter)
  if (all.length < 3) {
    const l3 = await Promise.all([
      wMovies ? fetchM(`&with_genres=${gM}${durParam}${eraM}${noAnime}`, pg2) : Promise.resolve([]),
      wTV     ? fetchT(`&with_genres=${gT}${eraT}${noAnime}`, pg2)            : Promise.resolve([]),
    ])
    all = [...all, ...l3.flat()]
  }

  // L4: genre only, relax era too
  if (all.length < 3) {
    const l4 = await Promise.all([
      wMovies ? fetchM(`&with_genres=${gM}${durParam}${noAnime}`) : Promise.resolve([]),
      wTV     ? fetchT(`&with_genres=${gT}${noAnime}`)            : Promise.resolve([]),
    ])
    all = [...all, ...l4.flat()]
  }

  // L5: no genre, no platform — just popular quality, anti-anime
  if (all.length < 3) {
    const l5 = await Promise.all([
      wMovies ? fetchM(`${durParam}${noAnime}&page=1`) : Promise.resolve([]),
      wTV     ? fetchT(`${noAnime}&page=1`)            : Promise.resolve([]),
    ])
    all = [...all, ...l5.flat()]
  }

  // L6: trending — absolute guaranteed fallback
  if (all.length < 2) {
    const l6 = await Promise.all([
      wMovies ? api('/trending/movie/week').then(d => (d.results||[]).filter(x=>x.poster_path).slice(0,8).map(mapMovie)).catch(()=>[]) : Promise.resolve([]),
      wTV     ? api('/trending/tv/week').then(d => (d.results||[]).filter(x=>x.poster_path).slice(0,8).map(mapTV)).catch(()=>[])       : Promise.resolve([]),
    ])
    all = [...all, ...l6.flat()]
  }

  // Deduplicate
  const seen = new Set()
  return all.filter(f => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return !!f.poster
  })
}
