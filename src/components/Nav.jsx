import { IcoHome, IcoSearch, IcoBookmark, IcoUser } from './Icons.jsx'

// Compass/discover icon
const IcoCompass = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)

const NAV_ITEMS = [
  { id: 'home',      label: 'Inicio',    Icon: IcoHome     },
  { id: 'discover',  label: 'Descubrir', Icon: IcoCompass  },
  { id: 'search',    label: 'Buscar',    Icon: IcoSearch   },
  { id: 'list',      label: 'Mi lista',  Icon: IcoBookmark },
  { id: 'profile',   label: 'Yo',        Icon: IcoUser     },
]

export default function Nav({ activeTab, onTab }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map(({ id, label, Icon }, i) => (
        <button
          key={id}
          className={`nav-btn ${activeTab === i ? 'active' : ''} ${id === 'discover' ? 'nav-btn-discover' : ''}`}
          onClick={() => onTab(i)}
          aria-label={label}
          aria-current={activeTab === i ? 'page' : undefined}
        >
          <span className="nav-btn-icon" aria-hidden="true"><Icon /></span>
          {label}
        </button>
      ))}
    </nav>
  )
}
