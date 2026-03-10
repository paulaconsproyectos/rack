import { PLATFORMS } from '../constants/platforms.js'
import { enc } from '../lib/utils.js'

export default function StreamLinks({ film }) {
  const title  = film.titleEs || film.title
  const known  = film.streaming || []
  const toShow = known.length > 0
    ? known.filter((n) => PLATFORMS[n])
    : Object.keys(PLATFORMS).slice(0, 4)

  return (
    <div className="det-sec">
      <div className="det-sec-label">{known.length > 0 ? 'Ver ahora en' : 'Buscar en'}</div>
      <div className="stream-grid">
        {toShow.map((name) => {
          const p = PLATFORMS[name]
          if (!p) return null
          return (
            <a
              key={name}
              href={p.url + enc(title)}
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
        <a
          href={`https://www.justwatch.com/es/buscar?q=${enc(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="stream-chip"
        >
          <span className="stream-chip-name" style={{ fontSize: 12 }}>JustWatch →</span>
        </a>
      </div>
    </div>
  )
}
