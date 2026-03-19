import { PLATFORMS } from '../constants/platforms.js'

export default function StreamLinks({ film }) {
  const known = (film.streaming || []).filter((n) => PLATFORMS[n])

  if (known.length === 0) {
    return (
      <div className="stream-empty">No disponible en streaming actualmente</div>
    )
  }

  return (
    <div className="stream-grid">
      {known.map((name) => {
        const p = PLATFORMS[name]
        const title = film.titleEs || film.title
        return (
          <a
            key={name}
            href={p.url + encodeURIComponent(title || '')}
            target="_blank"
            rel="noopener noreferrer"
            className="stream-chip"
          >
            <img
              src={p.logo}
              alt={name}
              className="stream-chip-logo"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <span className="stream-chip-name">{name}</span>
          </a>
        )
      })}
    </div>
  )
}
