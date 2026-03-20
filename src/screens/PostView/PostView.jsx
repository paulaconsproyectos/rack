import { useState } from 'react'
import { track } from '../../lib/analytics.js'
import { LS, KEYS } from '../../lib/storage.js'
import { sb } from '../../lib/supabase.js'
import './PostView.css'

async function saveFeedbackRemote(film, reaction) {
  try {
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return
    await sb.from('feedback').insert({
      user_id:    session.user.id,
      film_id:    String(film.id),
      film_title: film.titleEs || film.title || '',
      reaction,
      genres:     film.genres || [],
      media_type: film.mediaType || 'movie',
    })
  } catch {}
}

export default function PostView({ film, onDone, onReview, showToast, showPts }) {
  const [reaction, setReaction] = useState(null)

  function handleReact(r) {
    setReaction(r)
    if (film) {
      try {
        const existing = LS.get(KEYS.feedback, [])
        const entry = { filmId: String(film.id), reaction: r, genres: film.genres || [], mediaType: film.mediaType || 'movie', ts: Date.now() }
        const updated = [entry, ...existing.filter(e => e.filmId !== String(film.id))].slice(0, 50)
        LS.set(KEYS.feedback, updated)
      } catch {}
      saveFeedbackRemote(film, r)
      track('postview_reaction', { reaction: r, film_id: film.id, title: film.title, genres: film.genres })
    }
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
