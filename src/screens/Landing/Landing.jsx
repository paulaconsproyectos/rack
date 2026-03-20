import { useState, useEffect } from 'react'

const BG_FILMS = [
  { url: 'https://image.tmdb.org/t/p/w1280/tM7ObJa8Mh3UEhGEiNbTMiHAHi2.jpg', title: 'El Padrino' },
  { url: 'https://image.tmdb.org/t/p/w1280/gNBCvtYyGPbjPCT1k3MvJuNuXR6.jpg', title: 'Pulp Fiction' },
  { url: 'https://image.tmdb.org/t/p/w1280/xMMrBziwJqrggerqyXfjbKSpCEG.jpg', title: 'Uno de los Nuestros' },
  { url: 'https://image.tmdb.org/t/p/w1280/5M0j0B18abtBI5gi2RhfjjurTqb.jpg', title: 'Blade Runner 2049' },
  { url: 'https://image.tmdb.org/t/p/w1280/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg', title: 'Mulholland Drive' },
  { url: 'https://image.tmdb.org/t/p/w1280/9BBTo108Kgp2BNkdqFAbs4HqPYO.jpg', title: 'Dune' },
]

const HEADLINES = [
  { top: 'Dinos tu mood.', bottom: 'Nosotros ponemos la peli.' },
  { top: '5 preguntas.', bottom: 'La película exacta.' },
  { top: 'Sin scroll infinito.', bottom: 'Sin algoritmos genéricos.' },
]

export default function Landing({ onLogin, onRegister, onDemo }) {
  const [bgIdx, setBgIdx]             = useState(0)
  const [visible, setVisible]         = useState(true)
  const [ready, setReady]             = useState(false)
  const [headlineIdx, setHeadlineIdx] = useState(0)
  const [headlineIn, setHeadlineIn]   = useState(true)

  useEffect(() => {
    const img = new Image()
    img.src = BG_FILMS[0].url
    img.onload = () => setReady(true)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setBgIdx(i => (i + 1) % BG_FILMS.length); setVisible(true) }, 600)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setHeadlineIn(false)
      setTimeout(() => { setHeadlineIdx(i => (i + 1) % HEADLINES.length); setHeadlineIn(true) }, 400)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const film     = BG_FILMS[bgIdx]
  const headline = HEADLINES[headlineIdx]

  return (
    <div className="land">
      <div className="land-bg" style={{ backgroundImage: `url(${film.url})`, opacity: visible && ready ? 1 : 0 }} aria-hidden="true" />
      <div className="land-overlay" aria-hidden="true" />

      <div className="land-hero">
        <div className="land-film-credit" aria-hidden="true">En pantalla: <span>{film.title}</span></div>
        <h1 className="land-logo">Zine<span> Club</span></h1>
        <div className={`land-headline ${headlineIn ? 'land-headline--in' : 'land-headline--out'}`}>
          <p className="land-headline-top">{headline.top}</p>
          <p className="land-headline-bottom">{headline.bottom}</p>
        </div>
        <p className="land-sub">Responde 5 preguntas y te decimos exactamente qué ver, en tu plataforma, esta noche.</p>
      </div>

      <div className="land-bottom">
        <button className="btn btn-primary land-btn-demo" onClick={onDemo}>
          Descubrir qué ver esta noche
        </button>
        <div className="land-alt-actions">
          <button className="btn btn-secondary" onClick={onRegister}>Crear cuenta</button>
          <button className="btn btn-ghost" onClick={onLogin}>Entrar</button>
        </div>
        <p className="land-legal">
          Al continuar aceptas los{' '}
          <a href="/terminos.html" target="_blank" rel="noopener">Términos</a>{' '}y la{' '}
          <a href="/privacidad.html" target="_blank" rel="noopener">Política de privacidad</a>.
        </p>
      </div>
    </div>
  )
}
