import { useState } from 'react'
import './Onboarding.css'

const SLIDES = [
  {
    emoji: '🎬',
    title: 'Todo lo que mereces ver',
    sub: 'Pelis y series perfectas para tu mood. Sin scrolling infinito, sin indecisión.',
  },
  {
    emoji: '🧠',
    title: 'Haz el test de mood',
    sub: 'Responde unas preguntas sobre cómo estás y qué quieres sentir. Te damos tu selección perfecta.',
  },
  {
    emoji: '👁',
    title: 'Guarda y descubre',
    sub: 'Lleva el registro de todo lo que has visto y descubre qué están viendo tus amigos.',
  },
]

export default function Onboarding({ onDone }) {
  const [idx, setIdx] = useState(0)
  const last = idx === SLIDES.length - 1
  const s = SLIDES[idx]

  return (
    <div className="ob-page">
      <button className="ob-skip" onClick={onDone}>Saltar</button>

      <div className="ob-slides">
        <div className="ob-emoji">{s.emoji}</div>
        <h1 className="ob-title">{s.title}</h1>
        <p className="ob-sub">{s.sub}</p>
      </div>

      <div className="ob-footer">
        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <div key={i} className={`ob-dot ${i === idx ? 'on' : ''}`} />
          ))}
        </div>
        <button
          className="btn btn-primary ob-btn"
          onClick={() => last ? onDone() : setIdx(i => i + 1)}
        >
          {last ? 'Empezar →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
