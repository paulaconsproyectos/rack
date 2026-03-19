import { useEffect, useState } from 'react'
import { fetchWeeklyPick, fetchNowPlaying } from '../../lib/tmdb.js'
import { IcoFlame } from '../../components/Icons.jsx'
import './Home.css'

export default function Home({ user, streak, onQuiz, onMarathon, onDetail, onInvite, showToast, lastReco }) {
  const [potw, setPotw]           = useState(null)
  const [nowPlaying, setNowPlaying] = useState([])
  const [potwLoading, setPotwLoading] = useState(true)

  useEffect(() => {
    fetchWeeklyPick()
      .then(setPotw)
      .catch(() => {})
      .finally(() => setPotwLoading(false))

    fetchNowPlaying()
      .then(setNowPlaying)
      .catch(() => {})
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'cinéfilo'

  return (
    <div className="home-wrap">
      {/* ── Header ── */}
      <div className="home-hd">
        <div className="home-hd-left">
          <div className="home-greeting">
            {getGreeting()}, <span className="home-greeting-name">{firstName}.</span>
          </div>
          <div className="home-sub">{getSubGreeting()}</div>
        </div>
        {streak?.count > 1 && (
          <div className="home-streak">
            <IcoFlame />{streak.count}
          </div>
        )}
      </div>

      {/* ── Primary CTA ── */}
      <div className="home-section px">
        <button className="home-cta-card" onClick={() => onQuiz({})}>
          <div className="home-cta-top">
            <span className="home-cta-label">5 preguntas · 30 seg</span>
            <span className="home-cta-badge">✦</span>
          </div>
          <div className="home-cta-title">Descubrir qué ver esta noche</div>
          <div className="home-cta-sub">Dinos cómo te sientes. Nosotros ponemos lo que toca.</div>
          <div className="home-cta-btn">Empezar test ✦</div>
        </button>
      </div>

      {/* ── Última recomendación ── */}
      {lastReco && (
        <div className="home-section px">
          <div className="home-sec-label">Tu última recomendación</div>
          <button className="home-last-reco" onClick={() => onDetail(lastReco, 'home')}>
            {lastReco.poster
              ? <img className="home-last-reco-poster" src={lastReco.poster} alt={lastReco.title} />
              : <div className="home-last-reco-poster-empty">🎬</div>
            }
            <div className="home-last-reco-body">
              <div className="home-last-reco-title">{lastReco.titleEs || lastReco.title}</div>
              <div className="home-last-reco-meta">{lastReco.year}</div>
            </div>
            <div className="home-last-reco-cta">¿La viste? Cuéntanos →</div>
          </button>
        </div>
      )}

      {/* ── Modo Maratón ── */}
      <div className="home-section px">
        <button className="marathon-btn" onClick={onMarathon}>
          <div className="marathon-btn-inner">
            <span className="marathon-btn-icon">🍿</span>
            <div>
              <div className="marathon-btn-title">Modo Maratón</div>
              <div className="marathon-btn-sub">Una noche entera seleccionada para ti</div>
            </div>
          </div>
          <span className="marathon-btn-arrow">→</span>
        </button>
      </div>

      {/* ── Trending esta semana ── */}
      <div className="home-section">
        <div className="home-sec-title px">Lo más visto esta semana</div>

        {potwLoading ? (
          <div className="px"><div className="potw-skeleton skeleton" /></div>
        ) : potw ? (
          <div className="px">
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
          </div>
        ) : null}
      </div>

      {/* ── En cines ahora ── */}
      {nowPlaying.length > 0 && (
        <div className="home-section">
          <div className="home-sec-title px">En cines ahora</div>
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

      {/* ── Invitar ── */}
      <div className="home-section px" style={{ paddingBottom: 8 }}>
        <button className="invite-row" onClick={onInvite}>
          <div>
            <div className="invite-title">Ver series y pelis siempre fue mejor en compañía.</div>
            <div className="invite-sub">Invita a tus amigos · Ambos ganáis 50 puntos</div>
          </div>
          <span style={{ fontSize: 18, color: 'var(--acc)' }}>→</span>
        </button>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return 'Buenas noches'
  if (h < 14) return 'Buenos días'
  if (h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

function getSubGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return '¿Qué ponemos esta noche?'
  if (h < 12) return '¿Qué ves hoy?'
  if (h < 17) return '¿Planes para esta tarde?'
  if (h < 21) return '¿Lista para esta noche?'
  return '¿Qué ponemos esta noche?'
}
