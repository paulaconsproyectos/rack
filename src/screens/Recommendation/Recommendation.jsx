import { useState, useEffect } from 'react'
import { track } from '../../lib/analytics.js'
import { LS, KEYS } from '../../lib/storage.js'
import { discoverByMood, enrichFilm, IMG_W7 } from '../../lib/tmdb.js'
import { generateShareCard } from '../../lib/shareCard.js'
import { PLATFORMS } from '../../constants/platforms.js'
import { SENTIR_TAGLINES } from '../../constants/quiz.js'
import './Recommendation.css'

const IcoPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IcoX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const LOADING_PHRASES = [
  'Buscando lo perfecto\npara esta noche...',
  'Analizando tu mood...',
  'Casi está...',
]

export default function Recommendation({
  answers,
  onBack,
  onSave,
  onWatch,
  onDetail,
  isSaved,
  isWatched,
  showToast,
  onFilmLoaded,
}) {
  const [films, setFilms]       = useState([])
  const [idx, setIdx]           = useState(0)
  const [film, setFilm]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [enriching, setEnriching] = useState(false)
  const [error, setError]       = useState(false)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [showTrailer, setShowTrailer]   = useState(false)
  const [sharingCard, setSharingCard]   = useState(false)

  // Rotate loading phrases
  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % LOADING_PHRASES.length), 1800)
    return () => clearInterval(t)
  }, [loading])

  // Fetch films on mount
  useEffect(() => {
    let dislikedIds = []
    try {
      const fb = LS.get(KEYS.feedback, [])
      dislikedIds = fb.filter(e => e.reaction === '🤍').map(e => e.filmId)
    } catch {}

    discoverByMood(answers, { dislikedIds })
      .then(f => { setFilms(f); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  // Enrich current film when idx/films change
  useEffect(() => {
    if (films.length === 0) return
    const f = films[idx]
    if (!f) { setError(true); return }
    setFilm(f)
    onFilmLoaded?.(f)
    setShowTrailer(false)
    track('recommendation_shown', { film_id: f.id, title: f.title, position: idx, genres: f.genres, media_type: f.mediaType })
    setEnriching(true)
    enrichFilm(f)
      .then(f => { setFilm(f); onFilmLoaded?.(f) })
      .finally(() => setEnriching(false))
  }, [films, idx])

  function handleOtraOpcion() {
    track('recommendation_other', { film_id: film?.id, title: film?.title, position: idx })
    if (idx < films.length - 1) {
      setIdx(i => i + 1)
    } else {
      onBack()
    }
  }

  async function handleCompartir() {
    if (!film || sharingCard) return
    setSharingCard(true)
    track('share_card', { film_id: film.id, title: film.title })
    const title = film.titleEs || film.title || ''
    const text  = `Esta noche toca: ${title} ✦\nDescubierto con Zine Club`
    const url   = 'https://zineclub.io'
    try {
      const blob = await generateShareCard(film)
      const file = new File([blob], `zineclub-${film.id}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, url })
      } else if (navigator.share) {
        await navigator.share({ title, text, url })
      } else {
        const objUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objUrl
        a.download = `zineclub-${film.id}.png`
        a.click()
        URL.revokeObjectURL(objUrl)
        showToast?.('Imagen descargada ✓')
      }
    } catch {
      // User cancelled share or generation failed — silent
    } finally {
      setSharingCard(false)
    }
  }

  // Determine primary platform to show
  const genero  = answers?.genero || ''
  const tagline = SENTIR_TAGLINES[genero]
  const userPlatforms = Array.isArray(answers?.plataformas) ? answers.plataformas : []
  const primaryPlatform = film?.streaming?.find(p =>
    userPlatforms.length === 0 || userPlatforms.includes(p)
  ) || film?.streaming?.[0]
  const platformInfo = primaryPlatform ? PLATFORMS[primaryPlatform] : null

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="reco-page">
        <button className="reco-loading-back" onClick={onBack} aria-label="Volver">←</button>
        <div className="reco-loading">
          <div className="reco-loading-symbol">✦</div>
          <div className="reco-loading-text">
            {LOADING_PHRASES[phraseIdx].split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </div>
          <div className="reco-loading-dots">
            <div className="reco-loading-dot" />
            <div className="reco-loading-dot" />
            <div className="reco-loading-dot" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error / no results ──────────────────────────────────
  if (error || !film) {
    return (
      <div className="reco-page">
        <div className="reco-error">
          <div className="reco-error-icon">✦</div>
          <h2 className="reco-error-title">
            No hemos encontrado nada que encaje perfectamente.
          </h2>
          <p className="reco-error-sub">
            Con estas opciones es difícil.<br />¿Probamos a relajar algún filtro?
          </p>
          <button className="btn btn-primary" onClick={onBack}>
            Repetir el test →
          </button>
        </div>
      </div>
    )
  }

  const saved   = isSaved(film)
  const watched = isWatched(film)

  // ── Result ──────────────────────────────────────────────
  return (
    <div className="reco-page">
      {/* Poster */}
      <div className="reco-poster-section">
        {(film.backdrop || film.poster) ? (
          <img
            src={film.backdrop || film.poster}
            alt={film.title}
            className="reco-poster-img"
          />
        ) : (
          <div className="reco-poster-placeholder">🎬</div>
        )}
        <div className="reco-poster-overlay" />

        {/* Top row: back + label */}
        <div className="reco-poster-top">
          <button className="reco-back-btn" onClick={onBack} aria-label="Volver">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="reco-top-label">✦ TU RECOMENDACIÓN</span>
        </div>

        {/* Trailer button */}
        {film.trailerKey && !showTrailer && (
          <button className="reco-play-btn" onClick={() => { track('recommendation_trailer', { film_id: film.id, title: film.title }); setShowTrailer(true) }} aria-label="Ver tráiler">
            <IcoPlay />
            <span>Ver tráiler</span>
          </button>
        )}

        {/* Trailer iframe */}
        {showTrailer && film.trailerKey && (
          <div className="reco-trailer-wrap">
            <iframe
              className="reco-trailer-iframe"
              src={`https://www.youtube.com/embed/${film.trailerKey}?autoplay=1&controls=1&modestbranding=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Tráiler"
            />
            <button className="reco-trailer-close" onClick={() => setShowTrailer(false)} aria-label="Cerrar tráiler">
              <IcoX />
            </button>
          </div>
        )}

        {/* Bottom of poster: title + meta */}
        <div className="reco-poster-bottom">
          <h1 className="reco-film-title">{film.title}</h1>
          <div className="reco-film-meta">
            {[film.year, film.genres?.[0], film.duration].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="reco-body">
        {/* Tagline */}
        {tagline && (
          <p className="reco-tagline">
            {tagline}<br />
            <em>Esto va a funcionar.</em>
          </p>
        )}

        {/* Platform */}
        <div className="reco-platform-section">
          <div className="reco-platform-label">DISPONIBLE EN</div>
          {enriching ? (
            <div className="reco-platform-skeleton" />
          ) : primaryPlatform ? (
            <div className="reco-platform-badge">
              {platformInfo && (
                <div className="reco-platform-dot" style={{ background: platformInfo.color }} />
              )}
              <span>{primaryPlatform}</span>
            </div>
          ) : (
            <div className="reco-platform-unavailable">No disponible en tus plataformas</div>
          )}
        </div>

        {/* Primary CTA */}
        {platformInfo ? (
          <a
            href={platformInfo.url + encodeURIComponent(film.title || '')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary reco-primary-btn"
          >
            Ver en {primaryPlatform} →
          </a>
        ) : (
          <button
            className="btn btn-primary reco-primary-btn"
            onClick={() => onDetail?.(film, 'reco')}
          >
            Ver detalles →
          </button>
        )}

        {/* Secondary actions */}
        <div className="reco-secondary-actions">
          <button
            className={`reco-ghost-btn ${saved ? 'active' : ''}`}
            onClick={() => onSave(film)}
          >
            🔖 {saved ? 'Guardada' : 'Guardar'}
          </button>
          <button className="reco-ghost-btn" onClick={handleOtraOpcion}>
            🔄 Otra opción
          </button>
          <button className="reco-ghost-btn" onClick={handleCompartir} disabled={sharingCard}>
            {sharingCard ? '⏳' : '↗'} Compartir
          </button>
        </div>

        {/* Ya la vi */}
        <button
          className={`reco-watched-btn ${watched ? 'done' : ''}`}
          onClick={() => onWatch(film)}
        >
          {watched ? '✓ Ya la he marcado como vista' : '¿Ya la has visto? Cuéntanos →'}
        </button>
      </div>
    </div>
  )
}
