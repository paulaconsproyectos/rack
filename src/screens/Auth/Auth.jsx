import { useState, useEffect } from 'react'

const BG_FILMS = [
  'https://image.tmdb.org/t/p/w1280/tM7ObJa8Mh3UEhGEiNbTMiHAHi2.jpg',
  'https://image.tmdb.org/t/p/w1280/loRmRzQXZeqG78TqZunIbdALteQ.jpg',
  'https://image.tmdb.org/t/p/w1280/hziiv14OpD73u9gApdeiZ9N4Vhz.jpg',
  'https://image.tmdb.org/t/p/w1280/9BBTo108Kgp2BNkdqFAbs4HqPYO.jpg',
]

export default function Auth({ mode = 'login', onBack, onLogin, onRegister }) {
  const [view, setView]     = useState(mode) // login | register
  const [bgIdx, setBgIdx]   = useState(() => Math.floor(Math.random() * BG_FILMS.length))
  const [err, setErr]       = useState('')
  const [loading, setLoading] = useState(false)
  const [gdprOk, setGdprOk] = useState(false)
  const [confirm, setConfirm] = useState(false)

  // Login fields
  const [lEmail, setLEmail] = useState('')
  const [lPass,  setLPass]  = useState('')

  // Register fields
  const [rName,   setRName]   = useState('')
  const [rHandle, setRHandle] = useState('')
  const [rEmail,  setREmail]  = useState('')
  const [rPass,   setRPass]   = useState('')

  useEffect(() => {
    const id = setInterval(() => setBgIdx((i) => (i + 1) % BG_FILMS.length), 6000)
    return () => clearInterval(id)
  }, [])

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
      const res = await onRegister({ name: rName, handle, email: rEmail, password: rPass })
      if (res?.needsConfirm) setConfirm(true)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (confirm) {
    return (
      <div className="auth-page">
        <div className="auth-bg" style={{ backgroundImage: `url(${BG_FILMS[bgIdx]})` }} />
        <div className="auth-bg-overlay" />
        <div className="auth-confirm">
          <div className="auth-confirm-icon">✉️</div>
          <h2 className="auth-ttl">Revisa tu email</h2>
          <p className="auth-sub">Te hemos enviado un enlace de confirmación. Confirma tu cuenta y vuelve para entrar.</p>
          <button className="btn btn-primary" onClick={onBack}>Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg" style={{ backgroundImage: `url(${BG_FILMS[bgIdx]})` }} aria-hidden="true" />
      <div className="auth-bg-overlay" aria-hidden="true" />

      {/* Header */}
      <div className="auth-top">
        <button className="auth-back" onClick={onBack} aria-label="Volver">←</button>
        <span className="auth-logo">Zine<span> Club</span></span>
      </div>

      {/* Form */}
      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-divider" />

          {view === 'login' ? (
            <form onSubmit={handleLogin} noValidate>
              <h2 className="auth-ttl">Bienvenido de nuevo</h2>
              <p className="auth-sub">Entra en tu cuenta</p>

              {err && <div className="form-err" role="alert">{err}</div>}

              <div className="field">
                <label htmlFor="l-email">Email</label>
                <input
                  id="l-email" type="email" autoComplete="email"
                  placeholder="tu@email.com"
                  value={lEmail} onChange={(e) => setLEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="l-pass">Contraseña</label>
                <input
                  id="l-pass" type="password" autoComplete="current-password"
                  placeholder="••••••••"
                  value={lPass} onChange={(e) => setLPass(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>

              {/* Demo hint */}
              <div className="demo-hint">
                <strong>Cuenta demo:</strong> demo@zineclub.io / demo1234
              </div>
            </form>
          ) : (
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
                  <a href="/zineclub/legal.html" target="_blank">Política de privacidad</a>
                  {' '}y el envío de comunicaciones sobre el lanzamiento.
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }} disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </form>
          )}
        </div>

        {/* Switch mode */}
        <p className="auth-switch">
          {view === 'login' ? (
            <> ¿No tienes cuenta?{' '}
              <button onClick={() => { setView('register'); setErr('') }}>Regístrate gratis</button>
            </>
          ) : (
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
