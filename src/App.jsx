import { useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useToast } from './hooks/useToast.js'
import { computeStreak } from './lib/utils.js'

// Screens
import Landing  from './screens/Landing/Landing.jsx'
import Auth     from './screens/Auth/Auth.jsx'
import Home     from './screens/Home/Home.jsx'
import Quiz     from './screens/Quiz/Quiz.jsx'
import Results  from './screens/Results/Results.jsx'
import Detail   from './screens/Detail/Detail.jsx'
import Search   from './screens/Search/Search.jsx'
import Social   from './screens/Social/Social.jsx'
import Profile  from './screens/Profile/Profile.jsx'
import TikTok   from './screens/TikTok/TikTok.jsx'

// Components
import Nav from './components/Nav.jsx'
import { Toast, PtsFloat } from './components/Toast.jsx'

// Styles
import './screens/Landing/Landing.css'
import './screens/Auth/Auth.css'
import './screens/Home/Home.css'
import './screens/Quiz/Quiz.css'
import './screens/Results/Results.css'
import './screens/Detail/Detail.css'
import './screens/Search/Search.css'
import './screens/Social/Social.css'
import './screens/Profile/Profile.css'
import './screens/TikTok/TikTok.css'

const NAV_TABS = ['home', 'search', 'social', 'profile']

export default function App() {
  const auth  = useAuth()
  const toast = useToast()

  // Screen state
  const [tab, setTab]         = useState(0) // 0=home 1=search 2=social 3=profile
  const [screen, setScreen]   = useState(null) // null=tab | 'quiz' | 'results' | 'detail' | 'tiktok'
  const [quizOpts, setQuizOpts]     = useState({})
  const [quizAnswers, setQuizAnswers] = useState(null)
  const [detailFilm, setDetailFilm] = useState(null)
  const [detailFrom, setDetailFrom] = useState(null)
  const [tiktokFilms, setTiktokFilms] = useState([])
  const [tiktokIdx, setTiktokIdx]   = useState(0)
  const [isMarathon, setIsMarathon] = useState(false)

  // ── Auth state: loading ──
  if (auth.authState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spinner" aria-label="Cargando" />
      </div>
    )
  }

  // ── Auth state: landing ──
  if (auth.authState === 'landing') {
    return <Landing onEnter={() => auth.setAuthState('auth')} />
  }

  // ── Auth state: auth ──
  if (auth.authState === 'auth') {
    return (
      <Auth
        onLogin={auth.login}
        onRegister={auth.register}
        onBack={() => auth.setAuthState('landing')}
      />
    )
  }

  // ── App ──
  const user   = auth.user
  const streak = computeStreak(user?.watched || [])

  function isWatched(film) {
    return (user?.watched || []).some(w => w.id === film.id)
  }

  function isSaved(film) {
    return (user?.watchlist || []).some(w => w.id === film.id)
  }

  function handleWatch(film) {
    auth.addWatchedLocal(film)
    toast.showPts(10)
    toast.showToast(`Marcada como vista ✓`)
  }

  function handleSave(film) {
    const saved = isSaved(film)
    auth.addWatchlistLocal(film)
    toast.showToast(saved ? 'Eliminada de tu lista' : 'Guardada en tu lista ✓')
  }

  function openDetail(film, from) {
    setDetailFilm(film)
    setDetailFrom(from)
    setScreen('detail')
  }

  function openQuiz(opts = {}) {
    setQuizOpts(opts)
    setIsMarathon(false)
    setScreen('quiz')
  }

  function openMarathon() {
    setQuizOpts({})
    setIsMarathon(true)
    setScreen('quiz')
  }

  function openTikTok(films, startIdx = 0) {
    setTiktokFilms(films)
    setTiktokIdx(startIdx)
    setScreen('tiktok')
  }

  function handleQuizComplete(answers) {
    setQuizAnswers(answers)
    setScreen('results')
  }

  function handleInvite() {
    const url = 'https://paulaconsproyectos.github.io/zineclub/'
    if (navigator.share) {
      navigator.share({ title: 'Zine Club', text: 'Descubre películas que realmente mereces ver', url })
    } else {
      navigator.clipboard?.writeText(url)
      toast.showToast('Enlace copiado ✓')
    }
  }

  // Overlay screens (full-screen, over tab content)
  if (screen === 'tiktok') {
    return (
      <TikTok
        films={tiktokFilms}
        initialIdx={tiktokIdx}
        onClose={() => setScreen(null)}
        onDetail={openDetail}
        onWatch={handleWatch}
        onSave={handleSave}
        isWatched={isWatched}
        isSaved={isSaved}
      />
    )
  }

  if (screen === 'detail' && detailFilm) {
    return (
      <>
        <Detail
          film={detailFilm}
          from={detailFrom}
          user={user}
          onClose={() => setScreen(null)}
          onWatch={handleWatch}
          onSave={handleSave}
          isWatched={isWatched}
          isSaved={isSaved}
          showToast={toast.showToast}
          showPts={toast.showPts}
        />
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        prefillMood={quizOpts.prefillMood}
        isMarathon={isMarathon}
        onComplete={handleQuizComplete}
        onExit={() => setScreen(null)}
      />
    )
  }

  if (screen === 'results') {
    return (
      <>
        <Results
          answers={quizAnswers}
          isMarathon={isMarathon}
          onBack={() => setScreen('quiz')}
          onDetail={openDetail}
          onTikTok={openTikTok}
          onWatch={handleWatch}
          onSave={handleSave}
          isWatched={isWatched}
          isSaved={isSaved}
        />
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  // Main tab shell
  return (
    <div className="app-shell">
      {/* Tab panels */}
      {tab === 0 && (
        <Home
          user={user}
          streak={streak}
          onQuiz={openQuiz}
          onMarathon={openMarathon}
          onDetail={openDetail}
          onInvite={handleInvite}
          showToast={toast.showToast}
        />
      )}
      {tab === 1 && (
        <Search
          onDetail={openDetail}
          onWatch={handleWatch}
          onSave={handleSave}
          isWatched={isWatched}
          isSaved={isSaved}
        />
      )}
      {tab === 2 && (
        <Social
          user={user}
          onDetail={openDetail}
        />
      )}
      {tab === 3 && (
        <Profile
          user={user}
          onLogout={auth.logout}
          onDetail={openDetail}
          showToast={toast.showToast}
          updateNameLocal={auth.updateNameLocal}
        />
      )}

      <Nav activeTab={tab} onTab={setTab} />
      <Toast toast={toast.toast} />
      <PtsFloat pts={toast.ptsFloat} />
    </div>
  )
}
