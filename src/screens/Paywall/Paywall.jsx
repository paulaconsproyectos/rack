import { useState } from 'react'
import { track } from '../../lib/analytics.js'
import './Paywall.css'

const MVP_CODE = 'ZINEMVP'

export default function Paywall({ onUnlock, onClose }) {
  const [code, setCode]     = useState('')
  const [error, setError]   = useState('')
  const [shake, setShake]   = useState(false)

  function handleCode() {
    if (code.trim().toUpperCase() === MVP_CODE) {
      localStorage.setItem('zc_mvp_code', '1')
      track('paywall_unlocked', { method: 'mvp_code' })
      onUnlock()
    } else {
      setError('Código incorrecto.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="pw-page">
      <div className="pw-content">
        {/* Symbol */}
        <div className="pw-symbol">✦</div>

        {/* Headline */}
        <h1 className="pw-title">
          Has usado tus tests<br />
          <em>gratuitos.</em>
        </h1>
        <p className="pw-sub">
          Desbloquea acceso ilimitado y sigue<br />
          descubriendo lo que de verdad mereces ver.
        </p>

        {/* Pro plan card */}
        <div className="pw-plan">
          <div className="pw-plan-top">
            <span className="pw-plan-label">PRO</span>
            <span className="pw-plan-badge">MÁS POPULAR</span>
          </div>
          <div className="pw-plan-price">
            <span className="pw-plan-amount">2,99€</span>
            <span className="pw-plan-period">/mes</span>
          </div>
          <ul className="pw-plan-features">
            <li><span>✦</span> Tests ilimitados</li>
            <li><span>✦</span> Modo Maratón</li>
            <li><span>✦</span> 7+ plataformas</li>
          </ul>
          <button className="btn btn-primary pw-pro-btn">
            Empezar ahora →
          </button>
        </div>

        {/* MVP code */}
        <div className="pw-code-section">
          <div className="pw-code-label">¿Tienes un código de acceso?</div>
          <div className={`pw-code-row ${shake ? 'shake' : ''}`}>
            <input
              className={`pw-code-input ${error ? 'err' : ''}`}
              type="text"
              placeholder="CÓDIGO"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleCode()}
              maxLength={20}
              autoCapitalize="characters"
            />
            <button className="pw-code-btn" onClick={handleCode}>
              Activar
            </button>
          </div>
          {error && <div className="pw-code-error">{error}</div>}
        </div>

        {/* Dismiss */}
        <button className="pw-dismiss" onClick={onClose}>
          Quizás más tarde
        </button>
      </div>
    </div>
  )
}
