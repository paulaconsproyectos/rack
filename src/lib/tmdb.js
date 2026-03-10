import { PLATFORMS, } from '../constants/platforms.js'
import { MOOD_GENRES, MOOD_GENRES_TV, VIBE_GENRES } from '../constants/quiz.js'

const KEY  = '10f1051018046e4262a70010b517415c'
const BASE = 'https://api.themoviedb.org/3'

export const IMG_W   = 'https://image.tmdb.org/t/p/w500'
export const IMG_SM  = 'https://image.tmdb.org/t/p/w185'
export const IMG_W7  = 'https://image.tmdb.org/t/p/w780'
export const IMG_ORI = 'https://image.tmdb.org/t/p/original'

const enc = (s) => encodeURIComponent(s || '')

const api = (path) =>
  fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${KEY}&language=es-ES`)
    .then((r) => r.json())

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
      name:  c.name,
      photo: c.profile_path ? IMG_SM + c.profile_path : null,
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
  const d = await api(
    `/discover/movie?sort_by=popularity.desc&watch_region=ES&with_watch_providers=${p.provId}`
  )
  return (d.results || [])
    .filter((m) => m.poster_path)
    .slice(0, 12)
    .map(mapMovie)
}

// ── Upcoming ─────────────────────────────────────────
export async function fetchUpcoming() {
  const d = await api('/movie/upcoming?region=ES')
  return (d.results || [])
    .slice(0, 10)
    .map((m) => ({ ...mapMovie(m), releaseDate: m.release_date || '' }))
}

// ── Mood discovery (6-level fallback) ─────────────────
export async function discoverByMood(answers) {
  const { mood = '', format = 'Me da igual', time = '', vibe = '',
          era = 'Me da igual', platform: platforms = [] } = answers

  const isMarathon = time === 'Toda la noche'
  const isShort    = time === 'Menos de 1h'
  const wMovies    = format === 'Película'    || format === 'Me da igual' || isMarathon
  const wTV        = format === 'Serie'       || format === 'Me da igual' || isMarathon

  // Era params
  let eraM = '', eraT = ''
  if (era === 'Actual (2015+)')       { eraM = '&primary_release_date.gte=2015-01-01'; eraT = '&first_air_date.gte=2015-01-01' }
  if (era === 'Clásicos (90s–2000s)') { eraM = '&primary_release_date.gte=1990-01-01&primary_release_date.lte=2014-12-31'; eraT = '&first_air_date.gte=1990-01-01&first_air_date.lte=2014-12-31' }
  if (era === 'Retro (antes del 90)') { eraM = '&primary_release_date.lte=1989-12-31'; eraT = '&first_air_date.lte=1989-12-31' }

  const moodGM = (MOOD_GENRES[mood]    || [18, 35, 12]).slice(0, 2)
  const moodGT = (MOOD_GENRES_TV[mood] || [18, 35]).slice(0, 2)
  const vibeG  = VIBE_GENRES[vibe] || []

  const allGM = [...new Set([...moodGM, ...vibeG])].slice(0, 3)
  const allGT = [...new Set([...moodGT, ...vibeG])].slice(0, 2)

  const todoMeVale = !platforms.length || platforms.includes('Todo me vale')
  const pids       = todoMeVale ? [] : platforms.map((p) => PLATFORMS[p]?.provId).filter(Boolean)
  const pParamM    = pids.length ? `&with_watch_providers=${pids.join('|')}&watch_region=ES` : ''
  const pParamT    = pids.length ? `&with_watch_providers=${pids.join('|')}&watch_region=ES` : ''
  const durParam   = isShort ? '&with_runtime.lte=90' : ''
  const limit      = isMarathon ? 8 : 6
  const pg         = Math.floor(Math.random() * 4) + 1

  const fetchM = async (genres, provP, durP, eraP, page, minVotes = 150) => {
    try {
      const url = `/discover/movie?sort_by=vote_average.desc&vote_count.gte=${minVotes}&with_genres=${genres}${provP}${durP}${eraP}&page=${page}`
      const d = await api(url)
      return (d.results || []).filter((x) => x.poster_path && x.vote_count > 50).slice(0, limit).map(mapMovie)
    } catch { return [] }
  }

  const fetchT = async (genres, provP, eraP, page, minVotes = 50) => {
    try {
      const url = `/discover/tv?sort_by=vote_average.desc&vote_count.gte=${minVotes}&with_genres=${genres}${provP}${eraP}&page=${page}`
      const d = await api(url)
      return (d.results || []).filter((x) => x.poster_path && x.vote_count > 20).slice(0, limit).map(mapTV)
    } catch { return [] }
  }

  let all = []

  // Level 1: full filters
  const l1 = await Promise.all([
    wMovies ? fetchM(allGM.join(','), pParamM, durParam, eraM, pg, 150) : [],
    wTV     ? fetchT(allGT.join(','), pParamT, eraT, pg, 50) : [],
  ])
  all = l1.flat()

  // Level 2: relax genres
  if (all.length < 4) {
    const l2 = await Promise.all([
      wMovies ? fetchM(moodGM.join(','), pParamM, durParam, eraM, pg, 80) : [],
      wTV     ? fetchT(moodGT.join(','), pParamT, eraT, pg, 20) : [],
    ])
    all = [...all, ...l2.flat()]
  }

  // Level 3: single genre, keep platform, drop era
  if (all.length < 4) {
    const l3 = await Promise.all([
      wMovies ? fetchM(String(moodGM[0] || 18), pParamM, '', '', 1, 30) : [],
      wTV     ? fetchT(String(moodGT[0] || 18), pParamT, '', 1, 10) : [],
    ])
    all = [...all, ...l3.flat()]
  }

  // Level 4: platform by popularity
  if (all.length < 4 && pids.length) {
    try {
      const l4 = await Promise.all([
        wMovies ? api(`/discover/movie?sort_by=popularity.desc${pParamM}&watch_region=ES`).then((d) => (d.results || []).filter((x) => x.poster_path).slice(0, 6).map(mapMovie)) : [],
        wTV     ? api(`/discover/tv?sort_by=popularity.desc${pParamT}&watch_region=ES`).then((d) => (d.results || []).filter((x) => x.poster_path).slice(0, 6).map(mapTV)) : [],
      ])
      all = [...all, ...l4.flat()]
    } catch {}
  }

  // Level 5: no platform
  if (all.length < 6) {
    const l5 = await Promise.all([
      wMovies ? fetchM(String(moodGM[0] || 18), '', '', '', 1, 30) : [],
      wTV     ? fetchT(String(moodGT[0] || 18), '', '', 1, 10) : [],
    ])
    const l5f = l5.flat()
    all = todoMeVale ? [...all, ...l5f] : (all.length < 4 ? [...all, ...l5f] : all)
  }

  // Level 6: trending (guaranteed)
  if (all.length < 4) {
    try {
      const l6 = await Promise.all([
        wTV     ? api('/trending/tv/week').then((d) => (d.results || []).filter((x) => x.poster_path).slice(0, 6).map(mapTV)) : [],
        wMovies ? api('/trending/movie/week').then((d) => (d.results || []).filter((x) => x.poster_path).slice(0, 6).map(mapMovie)) : [],
      ])
      all = [...all, ...l6.flat()]
    } catch {}
  }

  // Deduplicate
  const seen = new Set()
  return all.filter((f) => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return f.poster
  })
}
