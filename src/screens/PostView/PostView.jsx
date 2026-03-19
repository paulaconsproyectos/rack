import { useState } from 'react'
import './PostView.css'

export default function PostView({ film, onDone, onReview, showToast, showPts }) {
  const [reaction, setReaction] = useState(null)

  function handleReact(r) {
    setReaction(r)
    if (r === '❤️') showPts?.(50)
    setTimeout(onDone, 500)
  }

  return (
    <div className="postview-page">
      <div className="postview-content">
        {film && (
          <div className="postview-film-label">
            {film.title}{film.year ? ` · ${film.year}` : ''}
          </div>
        )}

        <h1 className="postview-title">¿Acertamos?</h1>
        <p className="postview-sub">
          Tu valoración ayuda a mejorar las próximas recomendaciones para todos.
        </p>

        <div className="postview-reactions">
          <button
            className={`postview-reaction green ${reaction === '💚' ? 'sel' : ''}`}
            onClick={() => handleReact('💚')}
          >
            <span className="postview-reaction-emoji">💚</span>
            <span className="postview-reaction-text">Perfecta para el momento</span>
          </button>
          <button
            className={`postview-reaction neutral ${reaction === '🤍' ? 'sel' : ''}`}
            onClick={() => handleReact('🤍')}
          >
            <span className="postview-reaction-emoji">🤍</span>
            <span className="postview-reaction-text">Bien, pero no era exactamente eso</span>
          </button>
          <button
            className={`postview-reaction gold ${reaction === '❤️' ? 'sel' : ''}`}
            onClick={() => handleReact('❤️')}
          >
            <span className="postview-reaction-emoji">❤️</span>
            <span className="postview-reaction-text">La añado a mis favoritas</span>
          </button>
        </div>

        <button
          className="postview-review-btn"
          onClick={() => { onReview?.(film); onDone() }}
        >
          Escribir reseña completa
        </button>

        <div className="postview-pts">+50 puntos por reseñar ✦</div>
      </div>
    </div>
  )
}
