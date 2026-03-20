import { useState, useEffect } from 'react'

const BG_FILMS = [
  { url: '/land1.jpg', title: 'El Padrino' },
  { url: '/land2.jpg', title: 'Pulp Fiction' },
  { url: '/land3.jpg', title: 'Uno de los Nuestros' },
  { url: '/land4.jpg', title: 'Blade Runner 2049' },
  { url: '/land5.jpg', title: 'Mulholland Drive' },
  { url: '/land6.jpg', title: 'Dune' },
]

const TAGLINES = [
  'Dinos tu mood. Nosotros ponemos el título.',
  '5 preguntas. El título exacto.',
  'Sin scroll infinito. Sin algoritmos genéricos.',
]

export default function Landing({ onLogin, onRegister, onDemo }) {
  const [bgIdx, setBgIdx]         = useState(0)
  const [bgVisible, setBgVisible] = useState(true)
  const [tagIdx, setTagIdx]       = useState(0)
  const [tagIn, setTagIn]         = useState(true)

  // Rotate backgrounds
  useEffect(() => {
    const id = setInterval(() => {
      setBgVisible(false)
      setTimeout(() => { setBgIdx(i => (i + 1) % BG_FILMS.length); setBgVisible(true) }, 600)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  // Rotate taglines
  useEffect(() => {
    const id = setInterval(() => {
      setTagIn(false)
      setTimeout(() => { setTagIdx(i => (i + 1) % TAGLINES.length); setTagIn(true) }, 350)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const film = BG_FILMS[bgIdx]

  return (
    <div className="land">
      <div
        className="land-bg"
        style={{ backgroundImage: `url(${film.url})`, opacity: bgVisible ? 1 : 0 }}
        aria-hidden="true"
      />
      <div className="land-overlay" aria-hidden="true" />

      <div className="land-hero">
        <div className="land-film-credit" aria-hidden="true">
          En pantalla: <span>{film.title}</span>
        </div>

        <h1 className="land-logo">
          Zine<span> Club</span>
        </h1>

        <p className="land-tagline-static">Todo lo que<span> mereces ver.</span></p>

        <div className={`land-tagline-rotate ${tagIn ? 'land-tagline--in' : 'land-tagline--out'}`}>
          {TAGLINES[tagIdx]}
        </div>

        <p className="land-sub">
          Cuéntanos tu mood y te recomendamos exactamente qué ver, en tu plataforma de streaming.
        </p>
      </div>

      <div className="land-bottom">
        <button className="btn btn-primary land-btn-demo" onClick={onDemo}>
          Probar gratis ahora
        </button>
        <div className="land-alt-actions">
          <button className="btn btn-secondary" onClick={onRegister}>Crear cuenta</button>
          <button className="btn btn-ghost" onClick={onLogin}>Ya tengo cuenta</button>
        </div>
        <p className="land-legal">
          Al continuar aceptas los{' '}
          <a href="/terminos.html" target="_blank" rel="noopener">Términos</a>
          {' '}y la{' '}
          <a href="/privacidad.html" target="_blank" rel="noopener">Política de privacidad</a>.
        </p>
      </div>
    </div>
  )
}
