import { useState, useEffect } from 'react'

const BG_FILMS = [
  { url: 'https://image.tmdb.org/t/p/w1280/tM7ObJa8Mh3UEhGEiNbTMiHAHi2.jpg', title: 'El Padrino' },
  { url: 'https://image.tmdb.org/t/p/w1280/gNBCvtYyGPbjPCT1k3MvJuNuXR6.jpg', title: 'Pulp Fiction' },
  { url: 'https://image.tmdb.org/t/p/w1280/xMMrBziwJqrggerqyXfjbKSpCEG.jpg', title: 'Uno de los Nuestros' },
  { url: 'https://image.tmdb.org/t/p/w1280/5M0j0B18abtBI5gi2RhfjjurTqb.jpg', title: 'Blade Runner 2049' },
  { url: 'https://image.tmdb.org/t/p/w1280/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg', title: 'Mulholland Drive' },
  { url: 'https://image.tmdb.org/t/p/w1280/9BBTo108Kgp2BNkdqFAbs4HqPYO.jpg', title: 'Dune' },
]

export default function Landing({ onLogin, onRegister }) {
  const [bgIdx, setBgIdx]     = useState(0)
  const [visible, setVisible] = useState(true)
  const [ready, setReady]     = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = BG_FILMS[0].url
    img.onload = () => setReady(true)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setBgIdx((i) => (i + 1) % BG_FILMS.length)
        setVisible(true)
      }, 400)
    }, 7000)
    return () => clearInterval(id)
  }, [])

  const film = BG_FILMS[bgIdx]

  return (
    <div className="land">
      {/* Cinematic backdrop */}
      <div
        className="land-bg"
        style={{ backgroundImage: `url(${film.url})`, opacity: visible && ready ? 1 : 0 }}
        aria-hidden="true"
      />
      <div className="land-overlay" aria-hidden="true" />

      {/* Hero */}
      <div className="land-hero">
        <div className="land-film-credit" aria-hidden="true">
          En pantalla: <span>{film.title}</span>
        </div>
        <h1 className="land-logo">
          Zine<span> Club</span>
        </h1>
        <p className="land-tag">
          ¿Qué ves esta noche?<br />
          <span>5 preguntas. La respuesta exacta.</span>
        </p>
      </div>

      {/* CTAs */}
      <div className="land-bottom">
        <button className="btn btn-primary" onClick={onRegister}>
          Empezar gratis ✦
        </button>
        <button className="btn btn-secondary" onClick={onLogin}>
          Ya tengo cuenta
        </button>
        <p className="land-legal">
          Al continuar aceptas los{' '}
          <a href="/legal.html" target="_blank" rel="noopener">Términos</a>
          {' '}y la{' '}
          <a href="/legal.html" target="_blank" rel="noopener">Política de privacidad</a>.
        </p>
      </div>
    </div>
  )
}
