import { useState, useEffect } from 'react'
import { QUESTIONS } from '../../constants/quiz.js'
import { PLATFORMS } from '../../constants/platforms.js'

export default function Quiz({ prefillMood, isMarathon, onComplete, onExit }) {
  const [step, setStep]   = useState(0)
  const [answers, setAnswers] = useState({})
  const [multi, setMulti] = useState([])

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100

  // Pre-fill mood if coming from mood chip
  useEffect(() => {
    if (prefillMood) {
      const moodQ = QUESTIONS.findIndex((q) => q.id === 'mood')
      if (moodQ > -1) {
        setAnswers({ mood: prefillMood })
        // Skip to next question after mood
        setStep(moodQ + 1)
      }
    }
  }, [])

  function pickOpt(val) {
    if (q.multi) {
      setMulti((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
      )
      return
    }
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 180)
    } else {
      onComplete(next)
    }
  }

  function nextMulti() {
    const next = { ...answers, [q.id]: multi }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) {
      setMulti([])
      setStep((s) => s + 1)
    } else {
      onComplete(next)
    }
  }

  const isSelected = (val) => q.multi ? multi.includes(val) : answers[q.id] === val
  const cols = q.cols || 2
  const gridCls = `quiz-grid quiz-grid-${cols}`

  return (
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-hd">
        <div className="quiz-prog">
          <div className="quiz-prog-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-step-lbl">{step + 1} / {QUESTIONS.length}</span>
        <button className="quiz-exit-btn" onClick={onExit}>Salir</button>
      </div>

      {/* Body */}
      <div className="quiz-body">
        <div className="quiz-step">{q.id === 'platform' ? 'Plataformas' : `Paso ${step + 1}`}</div>
        <h2 className="quiz-question">{q.q}</h2>

        <div className={gridCls}>
          {q.opts.map((opt) => {
            const isPlatform = q.id === 'platform' && PLATFORMS[opt.label]
            const pColor     = isPlatform ? PLATFORMS[opt.label]?.color : null

            return (
              <button
                key={opt.label}
                className={`quiz-opt ${isSelected(opt.label) ? 'sel' : ''} ${isPlatform ? 'quiz-opt-platform' : ''}`}
                onClick={() => pickOpt(opt.label)}
              >
                {isPlatform ? (
                  <>
                    <div
                      className="quiz-platform-dot"
                      style={{ background: pColor }}
                    />
                    <span className="quiz-opt-label">{opt.label}</span>
                  </>
                ) : (
                  <>
                    {opt.emoji && <span className="quiz-opt-emoji">{opt.emoji}</span>}
                    <span className="quiz-opt-label">{opt.label}</span>
                  </>
                )}
                {isSelected(opt.label) && <span className="quiz-opt-check">✓</span>}
              </button>
            )
          })}
        </div>

        {q.multi && (
          <button
            className="btn btn-primary quiz-next-btn"
            onClick={nextMulti}
            disabled={multi.length === 0}
          >
            {step === QUESTIONS.length - 1 ? 'Ver mis películas →' : 'Siguiente →'}
          </button>
        )}
      </div>
    </div>
  )
}
