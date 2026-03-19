import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://scqoqwmkptyxwpiwhkyk.supabase.co'
const SUPA_KEY = 'sb_publishable_GPGtFCLX8xNSIvyCznVDrg_K3xhtb4N'

export const sb = createClient(SUPA_URL, SUPA_KEY)

export async function getProfile(userId) {
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function upsertProfile(fields) {
  return sb.from('profiles').upsert(fields)
}

export async function getWatched(userId) {
  const { data } = await sb.from('watched').select('film_data').eq('user_id', userId)
  return (data || []).map((r) => r.film_data)
}

export async function getWatchlist(userId) {
  const { data } = await sb.from('watchlist').select('film_data').eq('user_id', userId)
  return (data || []).map((r) => r.film_data)
}

export async function getReviews(userId) {
  const { data } = await sb
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data || []).map((r) => ({
    id:         r.id,
    film_id:    r.film_id,
    film_title: r.film_title,
    rating:     r.rating,
    body:       r.body,
  }))
}

export async function getAllReviews() {
  const { data } = await sb
    .from('reviews')
    .select('*, profiles(name, avatar)')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data || []).map((r) => ({
    id:         r.id,
    film_title: r.film_title,
    rating:     r.rating,
    body:       r.body,
    profile:    r.profiles || { name: r.user_name },
  }))
}

export async function getLeaderboard(limit = 20) {
  const { data } = await sb
    .from('profiles')
    .select('id, name, handle, avatar, score')
    .order('score', { ascending: false })
    .limit(limit)
  return data || []
}

export async function addWatched(userId, film) {
  await sb.from('watched').insert({
    user_id: userId,
    film_id: String(film.id),
    film_title: film.titleEs || film.title,
    film_data: film,
  })
}

export async function addWatchlist(userId, film) {
  await sb.from('watchlist').insert({
    user_id: userId,
    film_id: String(film.id),
    film_title: film.titleEs || film.title,
    film_data: film,
  })
}

export async function removeWatchlist(userId, filmId) {
  await sb.from('watchlist').delete().eq('user_id', userId).eq('film_id', String(filmId))
}

export async function removeWatched(userId, filmId) {
  await sb.from('watched').delete().eq('user_id', userId).eq('film_id', String(filmId))
}

export async function addReview(userId, filmId, rating, body = '', filmTitle = '') {
  const { data, error } = await sb.from('reviews').insert({
    user_id:    userId,
    film_id:    String(filmId),
    film_title: filmTitle || null,
    rating,
    body:       body || null,
  }).select().single()
  if (error) throw error
  return data
}

export async function updateScore(userId, score) {
  await sb.from('profiles').update({ score }).eq('id', userId)
}
