import { useState, useRef, useEffect } from 'react'
import { searchFilms, fetchByPlatform } from '../../lib/tmdb.js'
import { PLATFORMS } from '../../constants/platforms.js'
import { typePillStyle } from '../../lib/utils.js'
import { IcoSearch, IcoX } from '../../components/Icons.jsx'

const PLATFORM_LIST = Object.entries(PLATFORMS)
  .filter(([, v], i, arr) => arr.findIndex(([, v2]) => v2.provId === v.provId) === i)
  .map(([name, data]) => ({ ...data, id: name, label: name }))

export default function Search({ onDetail, onWatch, onSave, isWatched, isSaved }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!query.trim()) {
      if (!platform) setResults([])
      return
    }
    timerRef.current = setTimeout(() => {
      setLoading(true)
      searchFilms(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 320)
    return () => clearTimeout(timerRef.current)
  }, [query])

  function selectPlatform(p) {
    const next = platform?.id === p.id ? null : p
    setPlatform(next)
    setQuery('')
    if (next) {
      setLoading(true)
      fetchByPlatform(next.provId)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    } else {
      setResults([])
    }
  }

  function clearSearch() {
    setQuery('')
    setPlatform(null)
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div className="srch-page">
      {/* Search bar */}
      <div className="srch-bar-wrap">
        <div className="srch-bar">
          <IcoSearch />
          <input
            ref={inputRef}
            className="srch-input"
            placeholder="Buscar películas, series…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          {(query || platform) && (
            <button className="srch-clear" onClick={clearSearch} aria-label="Limpiar">
              <IcoX />
            </button>
          )}
        </div>
      </div>

      {/* Platform chips */}
      {!query && (
        <div className="srch-platforms">
          <div className="srch-section-label">Explorar por plataforma</div>
          <div className="srch-platform-grid">
            {PLATFORM_LIST.map(p => (
              <button
                key={p.id}
                className={`srch-platform-btn ${platform?.id === p.id ? 'sel' : ''}`}
                onClick={() => selectPlatform(p)}
              >
                <div
                  className="srch-platform-dot"
                  style={{ background: p.color }}
                />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="srch-results">
        {loading && (
          <div className="srch-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="srch-card skeleton">
                <div className="srch-poster skeleton" style={{ height: 160 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="srch-grid">
            {results.map(f => {
              const pill = typePillStyle(f.type)
              return (
                <div
                  key={f.id}
                  className="srch-card"
                  onClick={() => onDetail(f, 'search')}
                >
                  {f.poster
                    ? <img className="srch-poster" src={f.poster} alt={f.title} loading="lazy" />
                    : <div className="srch-poster-empty">🎬</div>
                  }
                  <div className="srch-card-body">
                    <div
                      className="srch-type-pill"
                      style={{ color: pill.color, background: pill.bg }}
                    >
                      {f.type || 'Película'}
                    </div>
                    <div className="srch-card-title">{f.titleEs || f.title}</div>
                    <div className="srch-card-meta">
                      {f.year}{f.score ? ` · ★ ${f.score}` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="srch-empty">
            <div className="srch-empty-icon">🔍</div>
            <div className="srch-empty-title">Sin resultados</div>
            <div className="srch-empty-sub">Prueba con otro título o director.</div>
          </div>
        )}
      </div>
    </div>
  )
}
