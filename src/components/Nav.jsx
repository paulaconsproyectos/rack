import { IcoHome, IcoSearch, IcoStar, IcoUsers, IcoUser } from './Icons.jsx'

const NAV_ITEMS = [
  { id: 'home',    label: 'Inicio',     Icon: IcoHome   },
  { id: 'search',  label: 'Descubrir',  Icon: IcoSearch  },
  { id: 'social',  label: 'Social',     Icon: IcoUsers  },
  { id: 'profile', label: 'Yo',         Icon: IcoUser   },
]

export default function Nav({ activeTab, onTab }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map(({ id, label, Icon }, i) => (
        <button
          key={id}
          className={`nav-btn ${activeTab === i ? 'active' : ''}`}
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
