import { useState, useEffect } from 'react'

const BG_FILMS = [
  'https://image.tmdb.org/t/p/w1280/tM7ObJa8Mh3UEhGEiNbTMiHAHi2.jpg',
  'https://image.tmdb.org/t/p/w1280/loRmRzQXZeqG78TqZunIbdALteQ.jpg',
  'https://image.tmdb.org/t/p/w1280/hziiv14OpD73u9gApdeiZ9N4Vhz.jpg',
  'https://image.tmdb.org/t/p/w1280/9BBTo108Kgp2BNkdqFAbs4HqPYO.jpg',
]

export default function Auth({ mode = 'login', onBack, onLogin, onRegister, onPasswordReset, onUpdatePassword }) {
  const [view, setView]       = useState(mode) // login | register | forgot | reset
  const [bgIdx, setBgIdx]     = useState(() => Math.floor(Math.random() * BG_FILMS.length))
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)
  const [gdprOk, setGdprOk]   = useState(false)
  const [confirm, setConfirm] = useState(false)

  // Login fields
  const [lEmail, setLEmail] = useState('')
  const [lPass,  setLPass]  = useState('')

  // Register fields
  const [rName,   setRName]   = useState('')
  const [rHandle, setRHandle] = useState('')
  const [rEmail,  setREmail]  = useState('')
  const [rPass,   setRPass]   = useState('')

  // Forgot password
  const [fEmail, setFEmail] = useState('')

  // Reset password
  const [newPass,     setNewPass]     = useState('')
  const [newPassConf, setNewPassConf] = useState('')

  useEffect(() => {
    const id = setInterval(() => setBgIdx((i) => (i + 1) % BG_FILMS.length), 6000)
    return () => clearInterval(id)
  }, [])

  // If App sets mode='reset' (after PASSWORD_RECOVERY event)
  useEffect(() => {
    if (mode === 'reset') setView('reset')
  }, [mode])

  async function handleLogin(e) {
    e.preventDefault()
    if (!lEmail.trim() || !lPass.trim()) { setErr('Rellena todos los campos'); return }
    setErr(''); setLoading(true)
    try {
      await onLogin(lEmail, lPass)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!rName.trim() || !rHandle.trim() || !rEmail.trim() || !rPass.trim()) {
      setErr('Rellena todos los campos'); return
    }
    if (!rEmail.includes('@')) { setErr('Email no válido'); return }
    if (rPass.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres'); return }
    if (!gdprOk) { setErr('Acepta la política de privacidad para continuar'); return }
    const handle = rHandle.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
    if (handle.length < 3) { setErr('Usuario: mínimo 3 caracteres, solo letras, números y _'); return }
    setErr(''); setLoading(true)
    try {
      await onRegister({ name: rName, handle, email: rEmail, password: rPass })
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!fEmail.trim()) { setErr('Introduce tu email'); return }
    setErr(''); setLoading(true)
    try {
      await onPasswordReset(fEmail)
      setConfirm(true)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    if (!newPass.trim()) { setErr('Introduce una contraseña'); return }
    if (newPass.length < 6) { setErr('Mínimo 6 caracteres'); return }
    if (newPass !== newPassConf) { setErr('Las contraseñas no coinciden'); return }
    setErr(''); setLoading(true)
    try {
      await onUpdatePassword(newPass)
      setConfirm(true)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const bg = BG_FILMS[bgIdx]

  // ── Email sent / password updated confirmation ──
  if (confirm) {
    return (
      <div className="auth-page">
        <div className="auth-bg" style={{ backgroundImage: `url(${bg})` }} />
        <div className="auth-bg-overlay" />
        <div className="auth-confirm">
          <div className="auth-confirm-icon">{view === 'reset' ? '✓' : '✉️'}</div>
          <h2 className="auth-ttl">
            {view === 'reset' ? '¡Contraseña actualizada!' : 'Revisa tu email'}
          </h2>
          <p className="auth-sub">
            {view === 'reset'
              ? 'Ya puedes entrar con tu nueva contraseña.'
              : 'Te hemos enviado un enlace. Haz clic en él para crear una nueva contraseña.'
            }
          </p>
          <button className="btn btn-primary" onClick={onBack}>
            {view === 'reset' ? 'Entrar →' : 'Volver al inicio'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" style={{ backgroundImage: `url(${bg})` }} aria-hidden="true" />
      <div className="auth-bg-overlay" aria-hidden="true" />

      <div className="auth-top">
        <button className="auth-back" onClick={view === 'forgot' ? () => { setView('login'); setErr('') } : onBack} aria-label="Volver">←</button>
        <span className="auth-logo">Zine<span> Club</span></span>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-divider" />

          {/* ── Login ── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <h2 className="auth-ttl">Bienvenido de nuevo</h2>
              <p className="auth-sub">Entra en tu cuenta</p>
              {err && <div className="form-err" role="alert">{err}</div>}
              <div className="field">
                <label htmlFor="l-email">Email</label>
                <input id="l-email" type="email" autoComplete="email" placeholder="tu@email.com"
                  value={lEmail} onChange={(e) => setLEmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="l-pass">Contraseña</label>
                <input id="l-pass" type="password" autoComplete="current-password" placeholder="••••••••"
                  value={lPass} onChange={(e) => setLPass(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
              <button type="button" className="auth-forgot-link" onClick={() => { setView('forgot'); setErr('') }}>
                ¿Olvidaste tu contraseña?
              </button>
              <div className="demo-hint">
                <strong>Cuenta demo:</strong> demo@zineclub.io / demo1234
              </div>
            </form>
          )}

          {/* ── Register ── */}
          {view === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <h2 className="auth-ttl">Crea tu cuenta</h2>
              <p className="auth-sub">Únete a la comunidad cinéfila</p>
              {err && <div className="form-err" role="alert">{err}</div>}
              <div className="field">
                <label htmlFor="r-name">Tu nombre</label>
                <input id="r-name" type="text" autoComplete="name" placeholder="Paula García"
                  value={rName} onChange={(e) => setRName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="r-handle">Nombre de usuario</label>
                <input id="r-handle" type="text" autoComplete="username" placeholder="paula_garcia"
                  value={rHandle} onChange={(e) => setRHandle(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="r-email">Email</label>
                <input id="r-email" type="email" autoComplete="email" placeholder="tu@email.com"
                  value={rEmail} onChange={(e) => setREmail(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="r-pass">Contraseña</label>
                <input id="r-pass" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                  value={rPass} onChange={(e) => setRPass(e.target.value)} />
              </div>
              <div className="gdpr-row">
                <input type="checkbox" id="gdpr" checked={gdprOk} onChange={(e) => setGdprOk(e.target.checked)} />
                <label htmlFor="gdpr">
                  Acepto la{' '}
                  <a href="/legal.html" target="_blank" rel="noopener">Política de privacidad</a>
                  {' '}y el envío de comunicaciones sobre el lanzamiento.
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }} disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </form>
          )}

          {/* ── Forgot password ── */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} noValidate>
              <h2 className="auth-ttl">Recuperar contraseña</h2>
              <p className="auth-sub">Te enviamos un enlace para crear una nueva.</p>
              {err && <div className="form-err" role="alert">{err}</div>}
              <div className="field">
                <label htmlFor="f-email">Tu email</label>
                <input id="f-email" type="email" autoComplete="email" placeholder="tu@email.com"
                  value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>
          )}

          {/* ── Reset password ── */}
          {view === 'reset' && (
            <form onSubmit={handleReset} noValidate>
              <h2 className="auth-ttl">Nueva contraseña</h2>
              <p className="auth-sub">Elige una contraseña nueva para tu cuenta.</p>
              {err && <div className="form-err" role="alert">{err}</div>}
              <div className="field">
                <label htmlFor="np">Nueva contraseña</label>
                <input id="np" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                  value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="npc">Repite la contraseña</label>
                <input id="npc" type="password" autoComplete="new-password" placeholder="••••••••"
                  value={newPassConf} onChange={(e) => setNewPassConf(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>

        <p className="auth-switch">
          {view === 'login' && (
            <> ¿No tienes cuenta?{' '}
              <button onClick={() => { setView('register'); setErr('') }}>Regístrate gratis</button>
            </>
          )}
          {view === 'register' && (
            <> ¿Ya tienes cuenta?{' '}
              <button onClick={() => { setView('login'); setErr('') }}>Inicia sesión</button>
            </>
          )}
        </p>
      </div>

      <p className="auth-film-credit" aria-hidden="true">
        Para los que de verdad aman el cine.
      </p>
    </div>
  )
}
