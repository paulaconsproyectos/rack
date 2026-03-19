import { useState } from 'react'
import { QUESTIONS } from '../../constants/quiz.js'
import { PLATFORMS } from '../../constants/platforms.js'
import './Quiz.css'

export default function Quiz({ isMarathon, onComplete, onExit }) {
  const [phase, setPhase]     = useState('entry')
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState(isMarathon ? { tiempo: 'Toda la noche' } : {})
  const [multi, setMulti]     = useState([])
  const [history, setHistory] = useState([])

  const activeQs = isMarathon
    ? QUESTIONS.filter(q => q.id !== 'tiempo')
    : QUESTIONS

  const q        = activeQs[step]
  const total    = activeQs.length
  const progress = ((step + 1) / total) * 100
  const isLast   = step === total - 1

  function advance(nextAnswers) {
    if (step + 1 >= activeQs.length) {
      onComplete(nextAnswers)
    } else {
      setHistory(h => [...h, step])
      setMulti([])
      setStep(s => s + 1)
    }
  }

  function goBack() {
    if (history.length === 0) { setPhase('entry'); return }
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    const next = { ...answers }
    delete next[q.id]
    setAnswers(next)
    setMulti([])
    setStep(prev)
  }

  function skip() { advance(answers) }

  function pickSingle(val) {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    setTimeout(() => advance(next), 180)
  }

  function pickMulti(val) {
    setMulti(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  function confirmMulti() {
    const next = { ...answers, [q.id]: multi }
    setAnswers(next)
    advance(next)
  }

  const isSelected = val =>
    q.multi ? multi.includes(val) : answers[q.id] === val

  // ── Entry screen ──────────────────────────────────────────
  if (phase === 'entry') {
    return (
      <div className="quiz-page">
        <div className="quiz-entry">
          <button className="quiz-exit-btn" onClick={onExit}>✕</button>
          <div className="quiz-entry-label">
            {total} PREGUNTAS · 30 SEGUNDOS
          </div>
          <h1 className="quiz-entry-title">
            {isMarathon
              ? <>Modo<br /><em>Maratón</em></>
              : <>¿Qué tipo de<br />noche es esta?</>
            }
          </h1>
          <p className="quiz-entry-sub">
            {isMarathon
              ? 'Cuéntanos qué te apetece. Te preparamos una noche entera de cine.'
              : 'Cuéntanos qué te apetece. Nosotros ponemos lo que toca.'
            }
          </p>
          <div className="quiz-entry-bullets">
            <div className="quiz-entry-bullet">
              <span className="quiz-entry-bullet-icon">✦</span>
              Una recomendación exacta, no una lista
            </div>
            <div className="quiz-entry-bullet">
              <span className="quiz-entry-bullet-icon">✦</span>
              Película o serie, en tu plataforma
            </div>
            <div className="quiz-entry-bullet">
              <span className="quiz-entry-bullet-icon">✦</span>
              Sin algoritmos, sin scroll infinito
            </div>
          </div>
          <button className="btn btn-primary quiz-entry-cta" onClick={() => setPhase('quiz')}>
            Empezar ✦
          </button>
        </div>
      </div>
    )
  }

  // ── Question screen ───────────────────────────────────────
  return (
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-hd">
        <button className="quiz-back-btn" onClick={goBack} aria-label="Atrás">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="quiz-prog-wrap">
          <div className="quiz-prog">
            <div className="quiz-prog-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="quiz-step-lbl">{step + 1} / {total}</span>
        </div>
        {q.skippable && (
          <button className="quiz-skip-btn" onClick={skip}>Saltar</button>
        )}
      </div>

      {/* Body */}
      <div className="quiz-body">
        <h2 className="quiz-question">{q.q}</h2>
        {q.hint && <div className="quiz-hint">{q.hint}</div>}

        <div className="quiz-list">
          {q.opts.map(opt => {
            const sel = isSelected(opt.label)
            const isPlatform = q.id === 'plataformas' && PLATFORMS[opt.label]
            const pColor = isPlatform ? PLATFORMS[opt.label]?.color : null

            return (
              <button
                key={opt.label}
                className={`quiz-list-opt ${sel ? 'sel' : ''}`}
                onClick={() => q.multi ? pickMulti(opt.label) : pickSingle(opt.label)}
              >
                {isPlatform ? (
                  <div className="quiz-platform-dot" style={{ background: pColor }} />
                ) : opt.emoji ? (
                  <span className="quiz-list-emoji">{opt.emoji}</span>
                ) : (
                  <div className="quiz-list-indicator">{sel ? '✦' : ''}</div>
                )}
                <span className="quiz-list-label">{opt.label}</span>
                {sel && !opt.emoji && !isPlatform && (
                  <span className="quiz-list-check">✓</span>
                )}
              </button>
            )
          })}
        </div>

        {q.multi && (
          <button
            className="btn btn-primary quiz-next-btn"
            onClick={confirmMulti}
          >
            {isLast ? 'Ver mi recomendación ✦' : 'Siguiente →'}
          </button>
        )}
      </div>
    </div>
  )
}
