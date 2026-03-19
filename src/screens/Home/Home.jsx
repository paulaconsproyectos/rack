import { useEffect, useState } from 'react'
import { fetchWeeklyPick, fetchNowPlaying } from '../../lib/tmdb.js'
import { initials } from '../../lib/utils.js'
import { getBadge } from '../../constants/badges.js'
import { IcoFlame } from '../../components/Icons.jsx'

const MOOD_CHIPS = [
  { label: 'Eufórico',    emoji: '⚡', color: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.22)',  text: '#FCD34D' },
  { label: 'Melancólico', emoji: '🌧', color: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.22)',  text: '#93C5FD' },
  { label: 'Relajado',    emoji: '🛋', color: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.22)',   text: '#86EFAC' },
  { label: 'Intenso',     emoji: '🔥', color: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)',   text: '#FCA5A5' },
  { label: 'Romántico',   emoji: '🕯', color: 'rgba(201,169,110,0.10)', border: 'rgba(201,169,110,0.28)', text: '#DFC08A' },
  { label: 'Curioso',     emoji: '🔍', color: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.22)',  text: '#D8B4FE' },
]

export default function Home({ user, streak, onQuiz, onMarathon, onDetail, onInvite, onProfile, showToast }) {
  const [potw, setPotw]         = useState(null)
  const [nowPlaying, setNowPlaying] = useState([])
  const [potwLoading, setPotwLoading] = useState(true)

  const badge = user ? getBadge(user.score || 0) : null

  useEffect(() => {
    fetchWeeklyPick()
      .then(setPotw)
      .catch(() => {})
      .finally(() => setPotwLoading(false))

    fetchNowPlaying()
      .then(setNowPlaying)
      .catch(() => {})
  }, [])

  function handleMoodQuiz(mood) {
    onQuiz({ prefillMood: mood })
  }

  return (
    <div className="home-wrap">
      {/* ── Logo bar ── */}
      <div className="home-logo-bar">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} className="home-logo-icon" alt="" />
        <span className="home-logo-text">ZINE CLUB</span>
      </div>

      {/* ── Greeting ── */}
      <div className="home-top">
        <div className="home-greeting-row">
          <div>
            <div className="home-greeting">Hola,</div>
            <div className="home-name">{user?.name?.split(' ')[0] || 'cinéfilo'}</div>
          </div>
          {streak?.count > 1 && (
            <div className="home-streak">
              <IcoFlame />{streak.count}
            </div>
          )}
        </div>
      </div>

      {/* ── Primary CTA ── */}
      <div className="home-section" style={{ padding: '0 20px 0' }}>
        <button className="home-quiz-btn" onClick={() => onQuiz({})}>
          <div className="home-quiz-btn-inner">
            <span className="home-quiz-btn-icon">🎬</span>
            <div>
              <div className="home-quiz-btn-title">Todo lo que mereces ver</div>
              <div className="home-quiz-btn-sub">Sin scrolling infinito · solo lo tuyo</div>
            </div>
          </div>
          <span className="home-quiz-btn-arrow">→</span>
        </button>
      </div>

      {/* ── Mood chips ── */}
      <div className="home-section">
        <div className="home-sec-title" style={{ padding: '0 20px' }}>¿Cómo estás ahora?</div>
        <div className="mood-chips-row">
          {MOOD_CHIPS.map(({ label, emoji, color, border, text }) => (
            <button
              key={label}
              className="mood-chip"
              style={{ background: color, borderColor: border, color: text }}
              onClick={() => handleMoodQuiz(label)}
            >
              <span className="mood-chip-emoji">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="home-section" style={{ padding: '0 20px' }}>
        <div className="home-stats-row">
          <div className="home-stat-card" onClick={onProfile}>
            <div className="home-stat-icon">🎬</div>
            <div className="home-stat-n">{(user?.watched || []).length}</div>
            <div className="home-stat-l">Vistas</div>
          </div>
          <div className="home-stat-card" onClick={onProfile}>
            <div className="home-stat-icon">🔖</div>
            <div className="home-stat-n">{(user?.watchlist || []).length}</div>
            <div className="home-stat-l">Guardadas</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon">{badge?.emoji || '👁'}</div>
            <div className="home-stat-n">{user?.score || 0}</div>
            <div className="home-stat-l">Puntos</div>
          </div>
        </div>
      </div>

      {/* ── Película de la semana ── */}
      <div className="home-section" style={{ padding: '0 20px' }}>
        <div className="home-sec-title">Lo más visto esta semana</div>

        {potwLoading ? (
          <div className="potw-skeleton skeleton" style={{ height: 200, borderRadius: 16 }} />
        ) : potw ? (
          <div className="potw-card" onClick={() => onDetail(potw, 'home')}>
            <img className="potw-bg" src={potw.backdrop || potw.poster} alt={potw.title} loading="lazy" />
            <div className="potw-overlay">
              <div className="potw-tag">⭐ Ahora trending</div>
              <div className="potw-title">{potw.titleEs || potw.title}</div>
              <div className="potw-meta">
                {potw.year}{potw.score ? ` · ${potw.score}` : ''}{potw.genres?.[0] ? ` · ${potw.genres[0]}` : ''}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Modo Maratón ── */}
      <div className="home-section" style={{ padding: '0 20px' }}>
        <button className="marathon-btn" onClick={onMarathon}>
          <div className="marathon-btn-inner">
            <span className="marathon-btn-icon">🍿</span>
            <div>
              <div className="marathon-btn-title">Modo Maratón</div>
              <div className="marathon-btn-sub">No más scrolling. Una noche seleccionada para ti</div>
            </div>
          </div>
          <span className="marathon-btn-arrow">→</span>
        </button>
      </div>

      {/* ── En cines ahora ── */}
      {nowPlaying.length > 0 && (
        <div className="home-section">
          <div className="home-sec-title" style={{ padding: '0 20px' }}>En cines ahora</div>
          <div className="now-playing-scroll">
            {nowPlaying.map((film) => (
              <button
                key={film.id}
                className="now-playing-card"
                onClick={() => onDetail(film, 'home')}
              >
                {film.poster
                  ? <img src={film.poster} alt={film.title} className="now-playing-poster" loading="lazy" />
                  : <div className="now-playing-poster-empty">🎬</div>
                }
                <div className="now-playing-title">{film.titleEs || film.title}</div>
                {film.score && <div className="now-playing-score">★ {film.score}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Invitar amigos ── */}
      <div className="home-section" style={{ padding: '0 20px 8px' }}>
        <button className="invite-row" onClick={onInvite}>
          <div>
            <div className="invite-title">Invita a tus amigos</div>
            <div className="invite-sub">Comparte todo lo que mereces ver</div>
          </div>
          <span style={{ fontSize: 20 }}>→</span>
        </button>
      </div>
    </div>
  )
}
