import { useState, useEffect } from 'react'
import { discoverByMood } from '../../lib/tmdb.js'
import { typePillStyle } from '../../lib/utils.js'

export default function Results({ answers, isMarathon, cachedFilms, onCacheFilms, onBack, onDetail, onTikTok, onWatch, onSave, isWatched, isSaved }) {
  const [films, setFilms]     = useState(cachedFilms || [])
  const [loading, setLoading] = useState(!cachedFilms)
  const [error, setError]     = useState(false)

  useEffect(() => {
    if (cachedFilms) return // use cache, don't re-fetch
    setLoading(true)
    setError(false)
    discoverByMood(answers)
      .then(f => { setFilms(f); onCacheFilms(f) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [answers])

  const title = isMarathon ? 'Tu maratón' : 'Tu recomendación'
  const subtitle = isMarathon
    ? 'Una noche seleccionada para ti, sin scrolling'
    : `${films.length} títulos seleccionados para ti`

  return (
    <div className="res-page">
      {/* Header */}
      <div className="res-hd">
        <button className="res-back-btn" onClick={onBack} aria-label="Volver">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div>
          <h1 className="res-title">{title}</h1>
          <div className="res-sub">{loading ? 'Buscando…' : subtitle}</div>
        </div>
        {!loading && films.length > 0 && (
          <button className="res-tiktok-btn" onClick={() => onTikTok(films)} aria-label="Modo deslizar">
            <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>Swipe</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="res-body">
        {loading && (
          <div className="res-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="film-card skeleton">
                <div className="film-poster skeleton" style={{ height: 220 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="res-empty">
            <div className="res-empty-icon">😞</div>
            <div className="res-empty-title">Error al cargar</div>
            <div className="res-empty-sub">Comprueba tu conexión e inténtalo de nuevo.</div>
          </div>
        )}

        {!loading && !error && films.length === 0 && (
          <div className="res-empty">
            <div className="res-empty-icon">🎬</div>
            <div className="res-empty-title">Sin resultados</div>
            <div className="res-empty-sub">Prueba con otro mood o amplía tus preferencias.</div>
          </div>
        )}

        {!loading && films.length > 0 && (
          <div className="res-grid">
            {films.map((f) => {
              const pill = typePillStyle(f.type)
              return (
                <button
                  key={f.id}
                  className="res-card"
                  onClick={() => onDetail(f, 'results')}
                >
                  {f.poster
                    ? <img className="res-poster" src={f.poster} alt={f.title} loading="lazy" />
                    : <div className="res-poster-empty">🎬</div>
                  }
                  <div className="res-card-body">
                    <div
                      className="res-type-pill"
                      style={{ color: pill.color, background: pill.bg }}
                    >
                      {f.type || 'Película'}
                    </div>
                    <div className="res-card-title">{f.titleEs || f.title}</div>
                    <div className="res-card-meta">
                      {f.year}{f.score ? ` · ★ ${f.score}` : ''}
                    </div>
                  </div>
                  <div className="res-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className={`res-icon-btn ${isWatched(f) ? 'done' : ''}`}
                      onClick={() => onWatch(f)}
                      aria-label="Marcar como vista"
                    >
                      <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button
                      className={`res-icon-btn ${isSaved(f) ? 'saved' : ''}`}
                      onClick={() => onSave(f)}
                      aria-label="Guardar en lista"
                    >
                      <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
