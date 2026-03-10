import { useState, useEffect } from 'react'
import { getLeaderboard, getAllReviews } from '../../lib/supabase.js'
import { fetchUpcoming } from '../../lib/tmdb.js'
import { getBadge } from '../../constants/badges.js'

const TABS = ['Actividad', 'Ranking', 'Estrenos']

export default function Social({ user, onDetail }) {
  const [tab, setTab]           = useState(0)
  const [reviews, setReviews]   = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAllReviews().catch(() => []),
      getLeaderboard(20).catch(() => []),
      fetchUpcoming().catch(() => []),
    ]).then(([r, l, u]) => {
      setReviews(r)
      setLeaderboard(l)
      setUpcoming(u)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="soc-page">
      {/* Header */}
      <div className="soc-hd">
        <h1 className="soc-title">Social</h1>
        <div className="soc-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`soc-tab ${tab === i ? 'on' : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="soc-body">
        {/* Tab 0: Activity feed */}
        {tab === 0 && (
          <div className="soc-feed">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="soc-review-card skeleton" style={{ height: 80 }} />
            ))}
            {!loading && reviews.length === 0 && (
              <div className="soc-empty">
                <div className="soc-empty-icon">💬</div>
                <div className="soc-empty-title">Sin actividad todavía</div>
                <div className="soc-empty-sub">Sé el primero en dejar una reseña.</div>
              </div>
            )}
            {!loading && reviews.map((r, i) => (
              <div key={i} className="soc-review-card">
                <div className="soc-review-av">
                  {r.profile?.avatar
                    ? <img src={r.profile.avatar} alt="" />
                    : <span>{r.profile?.name?.[0] || '?'}</span>
                  }
                </div>
                <div className="soc-review-body">
                  <div className="soc-review-top">
                    <span className="soc-review-name">{r.profile?.name || 'Usuario'}</span>
                    <span className="soc-review-stars">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <div className="soc-review-film">{r.film_title || 'Película'}</div>
                  {r.body && <p className="soc-review-text">{r.body}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 1: Leaderboard */}
        {tab === 1 && (
          <div className="soc-leaderboard">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="soc-lb-row skeleton" style={{ height: 56 }} />
            ))}
            {!loading && leaderboard.map((u, i) => {
              const badge = getBadge(u.score || 0)
              const isMe  = u.id === user?.id
              return (
                <div key={u.id} className={`soc-lb-row ${isMe ? 'me' : ''}`}>
                  <div className="soc-lb-rank">{i + 1}</div>
                  <div className="soc-lb-av">
                    {u.avatar
                      ? <img src={u.avatar} alt="" />
                      : <span>{u.name?.[0] || '?'}</span>
                    }
                  </div>
                  <div className="soc-lb-info">
                    <div className="soc-lb-name">{u.name || 'Usuario'}{isMe && ' (tú)'}</div>
                    <div className="soc-lb-badge">{badge.emoji} {badge.label}</div>
                  </div>
                  <div className="soc-lb-score">{u.score || 0} pts</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 2: Upcoming */}
        {tab === 2 && (
          <div className="soc-upcoming">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="soc-up-card skeleton" style={{ height: 120 }} />
            ))}
            {!loading && upcoming.map(f => (
              <div
                key={f.id}
                className="soc-up-card"
                onClick={() => onDetail(f, 'social')}
              >
                {f.backdrop || f.poster
                  ? <img className="soc-up-img" src={f.backdrop || f.poster} alt={f.title} loading="lazy" />
                  : <div className="soc-up-img-empty">🎬</div>
                }
                <div className="soc-up-overlay">
                  <div className="soc-up-date">{f.releaseDate ? new Date(f.releaseDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Próximamente'}</div>
                  <div className="soc-up-title">{f.titleEs || f.title}</div>
                  {f.genres?.[0] && <div className="soc-up-genre">{f.genres[0]}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
