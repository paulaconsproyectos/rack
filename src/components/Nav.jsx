import { IcoHome, IcoSearch, IcoBookmark, IcoUser } from './Icons.jsx'

const IcoPeople = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const NAV_ITEMS = [
  { id: 'home',    label: 'Inicio',    Icon: IcoHome     },
  { id: 'social',  label: 'Comunidad', Icon: IcoPeople   },
  { id: 'search',  label: 'Buscar',    Icon: IcoSearch   },
  { id: 'list',    label: 'Mi lista',  Icon: IcoBookmark },
  { id: 'profile', label: 'Yo',        Icon: IcoUser     },
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
