import { useState } from 'react'
import { typePillStyle } from '../../lib/utils.js'
import './MiLista.css'

export default function MiLista({ user, onDetail, onWatch, onQuiz, isWatched }) {
  const [filter, setFilter] = useState('all') // 'all' | 'movie' | 'tv'

  const watchlist = user?.watchlist || []

  const filtered = watchlist.filter(f => {
    if (filter === 'movie') return f.mediaType === 'movie'
    if (filter === 'tv')    return f.mediaType === 'tv'
    return true
  })

  return (
    <div className="lista-page">
      {/* Header */}
      <div className="lista-hd">
        <div>
          <h1 className="lista-title">Tus pendientes</h1>
          {watchlist.length > 0 && (
            <div className="lista-subtitle">{watchlist.length} título{watchlist.length !== 1 ? 's' : ''} guardado{watchlist.length !== 1 ? 's' : ''}</div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {watchlist.length > 0 && (
        <div className="lista-filters">
          {[['all', 'Todos'], ['movie', 'Películas'], ['tv', 'Series']].map(([val, label]) => (
            <button
              key={val}
              className={`lista-filter-btn ${filter === val ? 'on' : ''}`}
              onClick={() => setFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {watchlist.length === 0 && (
        <div className="lista-empty">
          <div className="lista-empty-icon">🔖</div>
          <div className="lista-empty-title">Tu lista está vacía.</div>
          <div className="lista-empty-sub">
            Cuando guardes una recomendación o marques algo para ver luego, aparecerá aquí.
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onQuiz}>
            Hacer un test ahora ✦
          </button>
        </div>
      )}

      {/* Film list */}
      {filtered.length > 0 && (
        <div className="lista-items">
          {filtered.map((f, i) => {
            const pill    = typePillStyle(f)
            const watched = isWatched(f)
            return (
              <div
                key={f.id || i}
                className={`lista-item ${watched ? 'is-watched' : ''}`}
                onClick={() => onDetail(f, 'lista')}
              >
                {f.poster
                  ? <img className="lista-poster" src={f.poster} alt={f.title} loading="lazy" />
                  : <div className="lista-poster-empty">🎬</div>
                }
                <div className="lista-item-body">
                  <div className="lista-item-meta">
                    <span className="lista-type-pill" style={{ color: pill.color, background: pill.bg }}>
                      {f.type || 'Película'}
                    </span>
                    {f.year && <span className="lista-year">{f.year}</span>}
                  </div>
                  <div className="lista-item-title">{f.titleEs || f.title}</div>
                  {f.genres?.[0] && (
                    <div className="lista-item-genre">{f.genres[0]}</div>
                  )}
                </div>
                <button
                  className={`lista-watch-btn ${watched ? 'done' : ''}`}
                  onClick={e => { e.stopPropagation(); onWatch(f) }}
                  aria-label={watched ? 'Quitar de vistas' : 'Marcar como vista'}
                >
                  {watched ? '✓ Vista' : 'Ya la vi'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && watchlist.length > 0 && (
        <div className="lista-empty">
          <div className="lista-empty-sub">No tienes {filter === 'movie' ? 'películas' : 'series'} en tu lista.</div>
        </div>
      )}
    </div>
  )
}
