import { useEffect, useState } from 'react'
import { fetchWeeklyPick, fetchNowPlaying } from '../../lib/tmdb.js'
import { initials } from '../../lib/utils.js'
import { getBadge } from '../../constants/badges.js'
import { IcoFlame } from '../../components/Icons.jsx'

const MOOD_CHIPS = [
  { label: 'Eufórico',    emoji: '⚡', color: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  text: '#FCD34D' },
  { label: 'Melancólico', emoji: '🌧', color: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  text: '#93C5FD' },
  { label: 'Relajado',    emoji: '🛋', color: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   text: '#86EFAC' },
  { label: 'Intenso',     emoji: '🔥', color: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#FCA5A5' },
  { label: 'Romántico',   emoji: '🕯', color: 'rgba(201,169,110,0.15)', border: 'rgba(201,169,110,0.3)', text: '#DFC08A' },
  { label: 'Curioso',     emoji: '🔍', color: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  text: '#D8B4FE' },
]

export default function Home({ user, streak, onQuiz, onMarathon, onDetail, onInvite, showToast }) {
  const [potw, setPotw]         = useState(null)
  const [nowPlaying, setNowPlaying] = useState([])
  const [potwLoading, setPotwLoading] = useState(true)

  const badge = user ? getBadge(user.score || 0) : null
  const hour  = new Date().getHours()
  const greeting =
    hour < 6  ? 'Buenas noches' :
    hour < 13 ? 'Buenos días'   :
    hour < 20 ? 'Buenas tardes' : 'Buenas noches'

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
      {/* ── Greeting ── */}
      <div className="home-top">
        <div className="home-greeting-row">
          <div>
            <div className="home-greeting">{greeting},</div>
            <div className="home-name">{user?.name?.split(' ')[0] || 'cinéfilo'}</div>
          </div>
          <div className="home-badge-col">
            <div className="home-user-av">
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{initials(user?.name)}</span>
              }
            </div>
            {streak?.count > 1 && (
              <div className="home-streak">
                <IcoFlame />{streak.count}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Primary CTA ── */}
      <div className="home-section" style={{ padding: '0 20px 0' }}>
        <button className="home-quiz-btn" onClick={() => onQuiz({})}>
          <div className="home-quiz-btn-inner">
            <span className="home-quiz-btn-icon">🎬</span>
            <div>
              <div className="home-quiz-btn-title">¿Qué mood tienes hoy?</div>
              <div className="home-quiz-btn-sub">6 preguntas · tu película perfecta</div>
            </div>
          </div>
          <span className="home-quiz-btn-arrow">→</span>
        </button>
      </div>

      {/* ── Mood chips ── */}
      <div className="home-section">
        <div className="home-sec-title" style={{ padding: '0 20px' }}>Empezar por mood</div>
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
          <div className="home-stat-card" onClick={() => onQuiz({})}>
            <div className="home-stat-icon">🎬</div>
            <div className="home-stat-n">{(user?.watched || []).length}</div>
            <div className="home-stat-l">Vistas</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon">🔖</div>
            <div className="home-stat-n">{(user?.watchlist || []).length}</div>
            <div className="home-stat-l">Guardadas</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-icon">{badge?.emoji || '👁'}</div>
            <div className="home-stat-n" style={{ fontSize: 14, marginTop: 2 }}>{badge?.label || 'Espectador'}</div>
            <div className="home-stat-l">{user?.score || 0} pts</div>
          </div>
        </div>
      </div>

      {/* ── Película de la semana ── */}
      <div className="home-section" style={{ padding: '0 20px' }}>
        <div className="home-sec-label">POTW</div>
        <div className="home-sec-title">Película de la semana</div>

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
              <div className="marathon-btn-sub">Una sesión entera, curada para ti</div>
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
              <div
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Invitar amigos ── */}
      <div className="home-section" style={{ padding: '0 20px 8px' }}>
        <button className="invite-row" onClick={onInvite}>
          <div>
            <div className="invite-title">Invita a tus amigos</div>
            <div className="invite-sub">Ambos ganáis 100 puntos al registrarse</div>
          </div>
          <span style={{ fontSize: 20 }}>→</span>
        </button>
      </div>
    </div>
  )
}
