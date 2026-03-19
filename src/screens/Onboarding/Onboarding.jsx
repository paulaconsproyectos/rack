import './Onboarding.css'

export default function Onboarding({ onDone }) {
  return (
    <div className="ob-page">
      <div className="ob-content">
        <div className="ob-symbol">✦</div>
        <h1 className="ob-title">
          El cine que<br /><em>mereces ver.</em>
        </h1>
        <p className="ob-sub">
          5 preguntas. Una recomendación exacta.<br />
          Sin scroll. Sin algoritmos.
        </p>
        <div className="ob-bullets">
          <div className="ob-bullet"><span>✦</span> Película o serie, en tu plataforma</div>
          <div className="ob-bullet"><span>✦</span> Cuéntanos tu mood, nosotros el resto</div>
          <div className="ob-bullet"><span>✦</span> Mejora con cada recomendación</div>
        </div>
      </div>
      <div className="ob-footer">
        <button className="btn btn-primary ob-btn" onClick={() => onDone(true)}>
          Hacer mi primera recomendación ✦
        </button>
        <button className="ob-skip" onClick={() => onDone(false)}>
          Explorar primero
        </button>
      </div>
    </div>
  )
}
