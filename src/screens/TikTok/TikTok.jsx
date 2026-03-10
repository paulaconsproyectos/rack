import { useState, useRef, useEffect } from 'react'
import { IcoEye, IcoBookmark, IcoShare, IcoX } from '../../components/Icons.jsx'
import { shareFilm } from '../../lib/utils.js'

export default function TikTok({ films, initialIdx = 0, onClose, onDetail, onWatch, onSave, isWatched, isSaved }) {
  const [idx, setIdx]         = useState(initialIdx)
  const [showHint, setShowHint] = useState(true)
  const [playTrailer, setPlayTrailer] = useState(false)
  const feedRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setPlayTrailer(false)
    const t = setTimeout(() => setPlayTrailer(true), 400)
    return () => clearTimeout(t)
  }, [idx])

  function handleScroll(e) {
    const newIdx = Math.round(e.target.scrollTop / window.innerHeight)
    if (newIdx !== idx) setIdx(newIdx)
  }

  if (!films.length) return null

  const film = films[idx]
  const bg   = film.backdrop || film.poster
  const trailerSrc = film.trailerKey && playTrailer
    ? `https://www.youtube.com/embed/${film.trailerKey}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playlist=${film.trailerKey}`
    : null

  return (
    <div className="tk-page fade-in">
      {/* Top bar */}
      <div className="tk-top-bar">
        <button className="tk-close-btn" onClick={onClose} aria-label="Cerrar">
          <IcoX />
        </button>
        <div className="tk-dot-row">
          {films.slice(0, Math.min(films.length, 10)).map((_, i) => (
            <div key={i} className={`tk-dot ${i === idx ? 'on' : ''}`} />
          ))}
        </div>
        <div className="tk-counter">{idx + 1}/{films.length}</div>
      </div>

      {/* Feed */}
      <div className="tk-feed" ref={feedRef} onScroll={handleScroll}>
        {films.map((f, i) => {
          const bg = f.backdrop || f.poster
          const isActive = i === idx
          const src = f.trailerKey && isActive && playTrailer
            ? `https://www.youtube.com/embed/${f.trailerKey}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playlist=${f.trailerKey}`
            : null

          return (
            <div key={f.id || i} className="tk-card">
              {bg && <img className="tk-bg-img" src={bg} alt="" />}
              {!bg && <div className="tk-bg-empty" />}
              {src && isActive && (
                <iframe
                  className="tk-iframe"
                  src={src}
                  allow="autoplay; encrypted-media"
                  title="trailer"
                />
              )}
              <div className="tk-gradient" />

              {/* Content */}
              <div className="tk-content">
                <div className="tk-type-pill">{f.type || 'Película'}</div>
                <h2 className="tk-title">{f.titleEs || f.title}</h2>
                <div className="tk-meta">
                  {f.year}{f.score ? ` · ★ ${f.score}` : ''}{f.genres?.[0] ? ` · ${f.genres[0]}` : ''}
                </div>
                <p className="tk-desc">{f.description}</p>
                <div className="tk-actions-row">
                  <button
                    className="btn btn-primary btn-pill tk-cta"
                    onClick={() => { onClose(); onDetail(f, 'results') }}
                  >
                    Ver ficha
                  </button>
                  <button
                    className="btn btn-secondary btn-pill tk-cta"
                    onClick={() => onSave(f)}
                  >
                    {isSaved(f) ? '✓ Guardada' : '+ Lista'}
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="tk-sidebar">
                <button
                  className="tk-action-btn"
                  onClick={() => onWatch(f)}
                  aria-label="Marcar como vista"
                >
                  <div className={`tk-action-icon ${isWatched(f) ? 'done' : ''}`}>
                    <IcoEye />
                  </div>
                  <span className="tk-action-lbl">{isWatched(f) ? 'Vista' : 'Marcar'}</span>
                </button>

                <button
                  className="tk-action-btn"
                  onClick={() => onSave(f)}
                  aria-label="Guardar en lista"
                >
                  <div className={`tk-action-icon ${isSaved(f) ? 'saved' : ''}`}>
                    <IcoBookmark />
                  </div>
                  <span className="tk-action-lbl">{isSaved(f) ? 'Guardada' : 'Guardar'}</span>
                </button>

                <button
                  className="tk-action-btn"
                  onClick={() => shareFilm(f)}
                  aria-label="Compartir"
                >
                  <div className="tk-action-icon">
                    <IcoShare />
                  </div>
                  <span className="tk-action-lbl">Compartir</span>
                </button>
              </div>

              {/* Swipe hint */}
              {showHint && i === 0 && (
                <div className="tk-hint" aria-hidden="true">
                  <div className="tk-hint-arrow">↕</div>
                  <div className="tk-hint-txt">Desliza para más</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
