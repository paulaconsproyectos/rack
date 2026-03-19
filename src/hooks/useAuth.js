import { useState, useEffect } from 'react'
import { sb, getProfile, getWatched, getWatchlist, getReviews, updateScore, upsertProfile,
         addWatched as addWatchedDb, removeWatched as removeWatchedDb,
         addWatchlist as addWatchlistDb, removeWatchlist as removeWatchlistDb } from '../lib/supabase.js'
import { LS, KEYS } from '../lib/storage.js'
import { genCode, computeStreak } from '../lib/utils.js'

export function useAuth() {
  const [authState, setAuthState] = useState('loading') // loading | landing | auth | app
  const [user, setUser]           = useState(null)
  const [streak, setStreak]       = useState(() => LS.get(KEYS.streak, { count: 0, lastDate: '' }))

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user)
      else setAuthState('landing')
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setAuthState('landing')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    LS.set(KEYS.streak, streak)
  }, [streak])

  async function loadProfile(authUser) {
    try {
      const [profile, watched, watchlist, reviews] = await Promise.all([
        getProfile(authUser.id),
        getWatched(authUser.id),
        getWatchlist(authUser.id),
        getReviews(authUser.id),
      ])

      if (!profile) { setAuthState('landing'); return }

      const avatar = LS.get(KEYS.avatar(profile.id), profile.avatar || null)

      setUser({
        ...profile,
        email: authUser.email,
        watched,
        watchlist,
        reviews,
        avatar,
      })
      setAuthState('app')
      updateStreakOnLogin()
    } catch (e) {
      console.error('loadProfile:', e)
      setAuthState('landing')
    }
  }

  function updateStreakOnLogin() {
    setStreak((prev) => computeStreak(prev))
  }

  async function login(email, password) {
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) {
      if (error.message.includes('Invalid login')) throw new Error('Email o contraseña incorrectos')
      throw new Error(error.message)
    }
  }

  async function register({ name, handle, email, password }) {
    const { data: existing } = await sb.from('profiles').select('id').eq('handle', handle).maybeSingle()
    if (existing) throw new Error('Ese nombre de usuario ya existe, elige otro')

    const { data, error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim(), handle } },
    })

    if (error) {
      if (error.message.includes('already registered')) throw new Error('Ese email ya tiene cuenta. Inicia sesión.')
      throw new Error(error.message)
    }

    const authUser = data?.user
    if (!authUser) throw new Error('Error en el registro. Inténtalo de nuevo.')

    await upsertProfile({ id: authUser.id, handle, name: name.trim(), score: 0, invite_code: genCode() })

    if (!data.session) {
      await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    }

    // Apply referral bonus if user came via invite link
    const refCode = localStorage.getItem('zc_ref')
    if (refCode) {
      try {
        await fetch('/api/referral', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newUserId: authUser.id, inviteCode: refCode }),
        })
        localStorage.removeItem('zc_ref')
      } catch {}
    }
  }

  async function logout() {
    await sb.auth.signOut()
  }

  function addWatchedLocal(film, pts = 10) {
    const uid        = user?.id
    const alreadySeen = (user?.watched || []).some(w => w.id === film.id)

    if (alreadySeen) {
      // Toggle off — unmark as watched
      const newScore = Math.max(0, (user?.score || 0) - pts)
      setUser((prev) => ({
        ...prev,
        watched: (prev.watched || []).filter(w => w.id !== film.id),
        score: newScore,
      }))
      if (uid) {
        removeWatchedDb(uid, film.id).catch(() => {})
        updateScore(uid, newScore).catch(() => {})
      }
    } else {
      // Mark as watched
      const score = user?.score || 0
      setUser((prev) => ({
        ...prev,
        watched: [...(prev.watched || []), film],
        score: (prev.score || 0) + pts,
      }))
      setStreak((prev) => computeStreak(prev))
      if (uid) {
        addWatchedDb(uid, film).catch(() => {})
        updateScore(uid, score + pts).catch(() => {})
      }
    }
  }

  function addWatchlistLocal(film) {
    const uid     = user?.id
    const isSaved = (user?.watchlist || []).some(w => w.id === film.id)
    if (isSaved) {
      setUser((prev) => ({
        ...prev,
        watchlist: (prev.watchlist || []).filter(w => w.id !== film.id),
      }))
      if (uid) removeWatchlistDb(uid, film.id).catch(() => {})
    } else {
      setUser((prev) => ({
        ...prev,
        watchlist: [...(prev.watchlist || []), film],
      }))
      if (uid) addWatchlistDb(uid, film).catch(() => {})
    }
  }

  function addReviewLocal(review) {
    setUser((prev) => ({
      ...prev,
      reviews: [review, ...(prev.reviews || [])],
      score: (prev.score || 0) + 50,
    }))
  }

  function updateAvatarLocal(dataUrl) {
    setUser((prev) => {
      LS.set(KEYS.avatar(prev.id), dataUrl)
      return { ...prev, avatar: dataUrl }
    })
  }

  function updateNameLocal(name) {
    setUser((prev) => ({ ...prev, name }))
  }

  async function syncScore(newScore) {
    if (!user?.id) return
    try { await updateScore(user.id, newScore) } catch {}
  }

  return {
    authState,
    setAuthState,
    user,
    streak,
    login,
    register,
    logout,
    addWatchedLocal,
    addWatchlistLocal,
    addReviewLocal,
    updateAvatarLocal,
    updateNameLocal,
    syncScore,
  }
}
