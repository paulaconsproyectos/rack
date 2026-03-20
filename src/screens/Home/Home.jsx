import { useEffect, useState } from 'react'
import { fetchWeeklyPick, fetchNowPlaying } from '../../lib/tmdb.js'
import { IcoFlame } from '../../components/Icons.jsx'
import { canPush, pushPermission, requestAndSave } from '../../lib/notifications.js'
import { track } from '../../lib/analytics.js'
import { LS, KEYS } from '../../lib/storage.js'
import './Home.css'

export default function Home({ user, streak, onQuiz, onMarathon, onDetail, onInvite, showToast, lastReco, isWatched }) {
  const [potw, setPotw]                 = useState(null)
  const [nowPlaying, setNowPlaying]     = useState([])
  const [potwLoading, setPotwLoading]   = useState(true)
  const [pushDismissed, setPushDismissed] = useState(() => LS.flag(KEYS.pushDismissed))

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

  // Pick one unwatched watchlist item to suggest
  const watchlist = user?.watchlist || []
  const watchlistPick = watchlist.find(f => !isWatched?.(f))

  // Show push banner if: can push, not granted yet, not dismissed, user has some activity
  const showPushBanner = canPush()
    && pushPermission() === 'default'
    && !pushDismissed
    && (watchlist.length > 0 || (user?.watched || []).length > 0)

  async function handleEnableNotifs() {
    const ok = await requestAndSave(user?.id)
    if (ok) { track('notification_enabled'); showToast?.('Notificaciones activadas ✓') }
    else showToast?.('No se han podido activar')
    setPushDismissed(true)
    LS.setFlag(KEYS.pushDismissed)
  }

  function dismissPush() {
    setPushDismissed(true)
    LS.setFlag(KEYS.pushDismissed)
  }

  return (
    <div className="home-wrap">
      {/* ── Header ── */}
      <div className="home-hd">
        <div className="home-hd-left">
          <div className="home-greeting">
            {getGreeting()}, <span className="home-greeting-name">{firstName}.</span>
          </div>
          <div className="home-sub">¿Qué ponemos?</div>
        </div>
        {streak?.count > 1 && (
          <div className="home-streak">
            <IcoFlame />{streak.count}
          </div>
        )}
      </div>

      {/* ── Push notification banner ── */}
      {showPushBanner && (
        <div className="home-section px">
          <div className="home-push-banner">
            <div className="home-push-icon">🔔</div>
            <div className="home-push-body">
              <div className="home-push-title">Activa las notificaciones</div>
              <div className="home-push-sub">Te avisamos cuando haya algo perfecto para esta noche.</div>
            </div>
            <div className="home-push-actions">
              <button className="home-push-btn" onClick={handleEnableNotifs}>Activar</button>
              <button className="home-push-dismiss" onClick={dismissPush}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Primary CTA ── */}
      <div className="home-section px">
        <button className="home-cta-card" onClick={() => onQuiz({})}>
          <div className="home-cta-top">
            <span className="home-cta-label">5 preguntas · 30 seg</span>
            <span className="home-cta-badge">✦</span>
          </div>
          <div className="home-cta-title">Tu próxima recomendación en 5 preguntas</div>
          <div className="home-cta-sub">Sin scroll. Sin algoritmos. Solo lo que te toca ver.</div>
          <div className="home-cta-btn">Empezar ✦</div>
        </button>
      </div>

      {/* ── Retoma tu lista ── */}
      {watchlistPick && (
        <div className="home-section px">
          <div className="home-sec-label">Pendiente en tu lista</div>
          <button className="home-watchlist-pick" onClick={() => onDetail(watchlistPick, 'home')}>
            {watchlistPick.poster
              ? <img className="home-watchlist-poster" src={watchlistPick.poster} alt={watchlistPick.title} loading="lazy" />
              : <div className="home-watchlist-poster-empty">🎬</div>
            }
            <div className="home-watchlist-body">
              <div className="home-watchlist-title">{watchlistPick.titleEs || watchlistPick.title}</div>
              <div className="home-watchlist-meta">{watchlistPick.year}{watchlistPick.genres?.[0] ? ` · ${watchlistPick.genres[0]}` : ''}</div>
              <div className="home-watchlist-cta">Esta noche podría ser →</div>
            </div>
          </button>
        </div>
      )}

      {/* ── Última recomendación ── */}
      {lastReco && !watchlistPick && (
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
