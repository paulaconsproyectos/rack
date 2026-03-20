import './DemoGate.css'

export default function DemoGate({ film, onRegister, onLogin }) {
  return (
    <div className="dgate">
      {/* Film backdrop */}
      {film?.poster && (
        <div
          className="dgate-bg"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${film.poster})` }}
          aria-hidden="true"
        />
      )}
      <div className="dgate-overlay" aria-hidden="true" />

      <div className="dgate-content">
        <div className="dgate-badge">Tu recomendación</div>

        {film?.poster && (
          <img
            className="dgate-poster"
            src={`https://image.tmdb.org/t/p/w342${film.poster}`}
            alt={film.title}
          />
        )}

        <h2 className="dgate-title">{film?.titleEs || film?.title}</h2>

        <div className="dgate-divider" />

        <h1 className="dgate-headline">
          ¿La guardamos<br />
          <em>para esta noche?</em>
        </h1>
        <p className="dgate-sub">
          Crea tu cuenta gratis para guardar esta recomendación, ver tu historial y recibir la siguiente.
        </p>

        <div className="dgate-actions">
          <button className="btn btn-primary dgate-btn" onClick={onRegister}>
            Guardar y crear cuenta — gratis ✦
          </button>
          <button className="dgate-login" onClick={onLogin}>
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
