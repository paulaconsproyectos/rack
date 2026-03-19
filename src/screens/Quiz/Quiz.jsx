import { useState } from 'react'
import { QUESTIONS } from '../../constants/quiz.js'
import { PLATFORMS } from '../../constants/platforms.js'
import './Quiz.css'

export default function Quiz({ isMarathon, onComplete, onExit }) {
  const [phase, setPhase]     = useState('entry') // 'entry' | 'quiz'
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState(isMarathon ? { tiempo: 'Tengo toda la noche' } : {})
  const [multi, setMulti]     = useState([])
  const [history, setHistory] = useState([])

  const activeQs = isMarathon
    ? QUESTIONS.filter(q => q.id !== 'tiempo')
    : QUESTIONS

  const q        = activeQs[step]
  const total    = activeQs.length
  const progress = ((step + 1) / total) * 100
  const isLast   = step === total - 1

  // ── Navigation ──────────────────────────────────────────
  function advance(nextAnswers) {
    const nextStep = step + 1
    if (nextStep >= activeQs.length) {
      onComplete(nextAnswers)
    } else {
      setHistory(h => [...h, step])
      setMulti([])
      setStep(nextStep)
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

  function skip() {
    advance(answers)
  }

  // ── Selection ────────────────────────────────────────────
  function pickSingle(val) {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    setTimeout(() => advance(next), 160)
  }

  function pickMulti(val) {
    if (q.id === 'evitar') {
      if (val === 'Nada, sorpréndeme') {
        setMulti(['Nada, sorpréndeme'])
      } else {
        setMulti(prev => {
          const without = prev.filter(v => v !== 'Nada, sorpréndeme')
          return without.includes(val)
            ? without.filter(v => v !== val)
            : [...without, val]
        })
      }
    } else {
      setMulti(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
      )
    }
  }

  function confirmMulti() {
    const selected = multi.length > 0 ? multi : []
    const next = { ...answers, [q.id]: selected }
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
          <button className="quiz-exit-btn quiz-entry-exit" onClick={onExit}>✕</button>
          <div className="quiz-entry-label">6 PREGUNTAS · 30 SEGUNDOS</div>
          <h1 className="quiz-entry-title">
            ¿Qué tipo de noche<br />es esta?
          </h1>
          <p className="quiz-entry-sub">
            Cuéntanos cómo estás y qué tienes ganas de ver.<br />
            Nosotros ponemos lo que toca.
          </p>
          <div className="quiz-entry-bullets">
            <div className="quiz-entry-bullet">
              <span className="quiz-entry-bullet-icon">✦</span>
              Una recomendación, no una lista
            </div>
            <div className="quiz-entry-bullet">
              <span className="quiz-entry-bullet-icon">✦</span>
              Película o serie, en tu plataforma
            </div>
            <div className="quiz-entry-bullet">
              <span className="quiz-entry-bullet-icon">✦</span>
              Siempre dentro de lo que tienes
            </div>
          </div>
          <button className="btn btn-primary quiz-entry-cta" onClick={() => setPhase('quiz')}>
            Empezar el test ✦
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz screen ──────────────────────────────────────────
  return (
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-hd">
        <button className="quiz-back-btn" onClick={goBack} aria-label="Atrás">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="quiz-prog">
          <div className="quiz-prog-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-step-lbl">Pregunta {step + 1} de {total}</span>
        {q.skippable && (
          <button className="quiz-skip-btn" onClick={skip}>Saltar</button>
        )}
      </div>

      {/* Body */}
      <div className="quiz-body">
        <h2 className="quiz-question">{q.q}</h2>
        {q.hint && <div className="quiz-hint">{q.hint}</div>}

        {/* Options list */}
        <div className="quiz-list">
          {q.opts.map(opt => {
            const sel = isSelected(opt.label)
            const isPlatform = q.id === 'plataformas' && PLATFORMS[opt.label]
            const pColor = isPlatform ? PLATFORMS[opt.label]?.color : null
            const dimmed = q.id === 'evitar'
              && multi.includes('Nada, sorpréndeme')
              && opt.label !== 'Nada, sorpréndeme'

            return (
              <button
                key={opt.label}
                className={`quiz-list-opt ${sel ? 'sel' : ''} ${dimmed ? 'dim' : ''}`}
                onClick={() => q.multi ? pickMulti(opt.label) : pickSingle(opt.label)}
              >
                <div className="quiz-list-indicator">
                  {sel ? '✦' : ''}
                </div>
                {isPlatform ? (
                  <div className="quiz-platform-dot" style={{ background: pColor }} />
                ) : opt.emoji ? (
                  <span className="quiz-list-emoji">{opt.emoji}</span>
                ) : null}
                <span className="quiz-list-label">{opt.label}</span>
              </button>
            )
          })}
        </div>

        {/* Multi CTA */}
        {q.multi && (
          <button
            className="btn btn-primary quiz-next-btn"
            onClick={confirmMulti}
            disabled={q.id === 'plataformas' && multi.length === 0}
          >
            {isLast ? 'Ver mi recomendación ✦' : 'Siguiente →'}
          </button>
        )}
      </div>
    </div>
  )
}
