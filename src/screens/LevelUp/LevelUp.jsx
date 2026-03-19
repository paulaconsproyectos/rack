import './LevelUp.css'

export default function LevelUp({ badge, onClose }) {
  return (
    <div className="lvlup-overlay" onClick={onClose}>
      <div className="lvlup-card" onClick={e => e.stopPropagation()}>

        {/* Particles */}
        <div className="lvlup-particles" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="lvlup-particle" style={{ '--i': i }} />
          ))}
        </div>

        {/* Badge */}
        <div className="lvlup-badge-wrap">
          <div className="lvlup-badge-ring" />
          <div className="lvlup-badge-emoji">{badge.emoji}</div>
        </div>

        {/* Text */}
        <div className="lvlup-label">NUEVO NIVEL DESBLOQUEADO</div>
        <div className="lvlup-title">{badge.label}</div>
        <div className="lvlup-sub">
          Llevas {badge.min}+ puntos.<br />
          Esto ya es otra cosa.
        </div>

        <button className="btn btn-primary lvlup-btn" onClick={onClose}>
          Seguir viendo ✦
        </button>
      </div>
    </div>
  )
}
