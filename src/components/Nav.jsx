import { IcoHome, IcoSearch, IcoStar, IcoUsers, IcoUser } from './Icons.jsx'

const NAV_ITEMS = [
  { id: 'home',    label: 'Inicio',     Icon: IcoHome   },
  { id: 'search',  label: 'Descubrir',  Icon: IcoSearch  },
  { id: 'social',  label: 'Social',     Icon: IcoUsers  },
  { id: 'profile', label: 'Yo',         Icon: IcoUser   },
]

export default function Nav({ screen, onNav }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-btn ${screen === id ? 'active' : ''}`}
          onClick={() => onNav(id)}
          aria-label={label}
          aria-current={screen === id ? 'page' : undefined}
        >
          <span className="nav-btn-icon" aria-hidden="true"><Icon /></span>
          {label}
        </button>
      ))}
    </nav>
  )
}
