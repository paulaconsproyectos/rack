import { useState, useEffect } from 'react'
import { enrichFilm } from '../../lib/tmdb.js'
import { formatRuntime, watchPoints } from '../../lib/utils.js'
import { addReview } from '../../lib/supabase.js'
import StreamLinks from '../../components/StreamLinks.jsx'
import TypePill from '../../components/TypePill.jsx'
import { IcoX, IcoEye, IcoBookmark, IcoShare, IcoStar, IcoPlay } from '../../components/Icons.jsx'
import { shareFilm } from '../../lib/utils.js'

const STARS = [1, 2, 3, 4, 5]

export default function Detail({ film: initialFilm, from, user, onClose, onWatch, onSave, isWatched, isSaved, showToast, showPts }) {
  const [film, setFilm]         = useState(initialFilm)
  const [loading, setLoading]   = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText]     = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [reviewDone, setReviewDone]     = useState(false)

  const existingReview = user?.reviews?.find(r => r.film_id === film.id)

  useEffect(() => {
    setLoading(true)
    enrichFilm(initialFilm)
      .then(setFilm)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [initialFilm.id])

  async function handleWatch() {
    onWatch(film)
    if (!isWatched(film)) {
      const pts = watchPoints(film.type)
      showPts(pts)
    }
  }

  async function handleReview() {
    if (!user || reviewRating === 0) return
    setSubmitting(true)
    try {
      await addReview(user.id, film.id, reviewRating, reviewText.trim())
      setReviewDone(true)
      showToast('Reseña guardada ✓')
    } catch {
      showToast('Error al guardar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const bg = film.backdrop || film.poster

  return (
    <div className="det-page">
      {/* Hero */}
      <div className="det-hero">
        {bg && (
          <img
            className="det-hero-img"
            src={bg}
            alt=""
            loading="eager"
          />
        )}
        <div className="det-hero-overlay" />

        {/* Close */}
        <button className="det-close-btn" onClick={onClose} aria-label="Cerrar">
          <IcoX />
        </button>

        {/* Play trailer button */}
        {film.trailerKey && !showTrailer && (
          <button
            className="det-play-btn"
            onClick={() => setShowTrailer(true)}
            aria-label="Ver tráiler"
          >
            <IcoPlay />
          </button>
        )}

        {/* Trailer iframe */}
        {showTrailer && film.trailerKey && (
          <div className="det-trailer-wrap">
            <iframe
              className="det-trailer-iframe"
              src={`https://www.youtube.com/embed/${film.trailerKey}?autoplay=1&controls=1&modestbranding=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Tráiler"
            />
            <button
              className="det-trailer-close"
              onClick={() => setShowTrailer(false)}
              aria-label="Cerrar tráiler"
            >
              <IcoX />
            </button>
          </div>
        )}

        {/* Bottom hero info */}
        <div className="det-hero-info">
          <TypePill type={film.type} />
          <h1 className="det-title">{film.titleEs || film.title}</h1>
          {film.title !== film.titleEs && film.titleEs && (
            <div className="det-orig-title">{film.title}</div>
          )}
          <div className="det-meta-row">
            {film.year && <span>{film.year}</span>}
            {film.runtime && <span>{formatRuntime(film.runtime)}</span>}
            {film.score && <span>★ {film.score}</span>}
            {film.genres?.[0] && <span>{film.genres[0]}</span>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="det-actions">
        <button
          className={`det-action-btn ${isWatched(film) ? 'active' : ''}`}
          onClick={handleWatch}
        >
          <IcoEye />
          <span>{isWatched(film) ? 'Vista' : 'Marcar vista'}</span>
        </button>
        <button
          className={`det-action-btn ${isSaved(film) ? 'active' : ''}`}
          onClick={() => onSave(film)}
        >
          <IcoBookmark />
          <span>{isSaved(film) ? 'Guardada' : 'Mi lista'}</span>
        </button>
        <button
          className="det-action-btn"
          onClick={() => shareFilm(film)}
        >
          <IcoShare />
          <span>Compartir</span>
        </button>
      </div>

      {/* Body */}
      <div className="det-body">

        {/* Genres */}
        {film.genres?.length > 0 && (
          <div className="det-genres">
            {film.genres.map(g => (
              <span key={g} className="det-genre-chip">{g}</span>
            ))}
          </div>
        )}

        {/* Description */}
        {film.description && (
          <p className="det-desc">{film.description}</p>
        )}

        {/* Streaming */}
        {film.streamingES?.length > 0 && (
          <div className="det-section">
            <div className="det-sec-label">Dónde ver</div>
            <StreamLinks film={film} />
          </div>
        )}

        {/* Cast */}
        {film.cast?.length > 0 && (
          <div className="det-section">
            <div className="det-sec-label">Reparto</div>
            <div className="cast-scroll">
              {film.cast.slice(0, 10).map((person) => (
                <div key={person.id || person.name} className="cast-card">
                  {person.photo
                    ? <img className="cast-photo" src={person.photo} alt={person.name} loading="lazy" />
                    : <div className="cast-photo-empty">{person.name?.[0] || '?'}</div>
                  }
                  <div className="cast-name">{person.name}</div>
                  {person.character && (
                    <div className="cast-char">{person.character}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Director */}
        {film.director && (
          <div className="det-section">
            <div className="det-sec-label">Dirección</div>
            <div className="det-director">{film.director}</div>
          </div>
        )}

        {/* Reviews */}
        <div className="det-section">
          <div className="det-sec-label">Tu reseña</div>
          {!user ? (
            <div className="det-review-login">Inicia sesión para dejar una reseña</div>
          ) : existingReview || reviewDone ? (
            <div className="det-review-done">
              <div className="det-review-stars">
                {STARS.map(s => (
                  <span key={s} className={s <= (existingReview?.rating || reviewRating) ? 'star-on' : 'star-off'}>★</span>
                ))}
              </div>
              <div className="det-review-saved">Reseña guardada ✓</div>
            </div>
          ) : (
            <div className="det-review-form">
              <div className="det-stars-row">
                {STARS.map(s => (
                  <button
                    key={s}
                    className={`det-star-btn ${s <= reviewRating ? 'on' : ''}`}
                    onClick={() => setReviewRating(s)}
                    aria-label={`${s} estrellas`}
                  >
                    <IcoStar />
                  </button>
                ))}
              </div>
              <textarea
                className="det-review-ta"
                placeholder="Escribe tu opinión (opcional)…"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <button
                className="btn btn-primary"
                onClick={handleReview}
                disabled={reviewRating === 0 || submitting}
              >
                {submitting ? 'Guardando…' : 'Guardar reseña'}
              </button>
            </div>
          )}
        </div>

        {/* Similar */}
        {film.similar?.length > 0 && (
          <div className="det-section">
            <div className="det-sec-label">Te puede gustar</div>
            <div className="det-similar-scroll">
              {film.similar.slice(0, 8).map((s) => (
                <div
                  key={s.id}
                  className="det-sim-card"
                  onClick={() => {
                    onClose()
                    // Small delay to let close animate
                    setTimeout(() => {}, 0)
                  }}
                >
                  {s.poster
                    ? <img className="det-sim-poster" src={s.poster} alt={s.title} loading="lazy" />
                    : <div className="det-sim-poster-empty">🎬</div>
                  }
                  <div className="det-sim-title">{s.titleEs || s.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 'calc(var(--bottom-nav) + 24px)' }} />
      </div>
    </div>
  )
}
