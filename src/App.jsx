import { useState } from 'react'
import { useAuth } from './hooks/useAuth.js'
import { useToast } from './hooks/useToast.js'
import { computeStreak, watchPoints } from './lib/utils.js'
import { getBadge } from './constants/badges.js'

// Screens
import Landing        from './screens/Landing/Landing.jsx'
import Auth           from './screens/Auth/Auth.jsx'
import Home           from './screens/Home/Home.jsx'
import Quiz           from './screens/Quiz/Quiz.jsx'
import Results        from './screens/Results/Results.jsx'
import Recommendation from './screens/Recommendation/Recommendation.jsx'
import PostView       from './screens/PostView/PostView.jsx'
import Detail         from './screens/Detail/Detail.jsx'
import Search         from './screens/Search/Search.jsx'
import MiLista        from './screens/MiLista/MiLista.jsx'
import Profile        from './screens/Profile/Profile.jsx'
import TikTok         from './screens/TikTok/TikTok.jsx'
import Onboarding     from './screens/Onboarding/Onboarding.jsx'
import Paywall        from './screens/Paywall/Paywall.jsx'
import LevelUp        from './screens/LevelUp/LevelUp.jsx'

// Components
import Nav from './components/Nav.jsx'
import { Toast, PtsFloat } from './components/Toast.jsx'

// Styles
import './screens/Landing/Landing.css'
import './screens/Auth/Auth.css'
import './screens/Home/Home.css'
import './screens/Quiz/Quiz.css'
import './screens/Results/Results.css'
import './screens/Recommendation/Recommendation.css'
import './screens/PostView/PostView.css'
import './screens/Detail/Detail.css'
import './screens/Search/Search.css'
import './screens/MiLista/MiLista.css'
import './screens/Profile/Profile.css'
import './screens/Paywall/Paywall.css'
import './screens/TikTok/TikTok.css'
import './screens/Onboarding/Onboarding.css'
import './screens/LevelUp/LevelUp.css'

export default function App() {
  const auth  = useAuth()
  const toast = useToast()

  const [authMode, setAuthMode] = useState('login')

  // Screen state
  // tabs: 0=home 1=discover(quiz) 2=search 3=list 4=profile
  const [tab, setTab]           = useState(0)
  const [screen, setScreen]     = useState(null)
  const [quizOpts, setQuizOpts] = useState({})
  const [quizAnswers, setQuizAnswers]   = useState(null)
  const [quizResults, setQuizResults]   = useState(null)
  const [recoFilm, setRecoFilm]         = useState(null)
  const [lastReco, setLastReco]         = useState(null)
  const [detailFilm, setDetailFilm]     = useState(null)
  const [detailFrom, setDetailFrom]     = useState(null)
  const [tiktokFilms, setTiktokFilms]   = useState([])
  const [tiktokIdx, setTiktokIdx]       = useState(0)
  const [isMarathon, setIsMarathon]     = useState(false)
  const [navStack, setNavStack]         = useState([])
  const [showPaywall, setShowPaywall]   = useState(false)
  const [levelUpBadge, setLevelUpBadge] = useState(null)
  const [onboarded, setOnboarded]       = useState(() => !!localStorage.getItem('zc_onboarded'))

  // ── Auth: loading ──
  if (auth.authState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spinner" aria-label="Cargando" />
      </div>
    )
  }

  if (auth.authState === 'landing') {
    return <Landing
      onRegister={() => { auth.setAuthState('auth'); setAuthMode('register') }}
      onLogin={() => { auth.setAuthState('auth'); setAuthMode('login') }}
    />
  }

  if (auth.authState === 'auth') {
    return (
      <Auth
        mode={authMode}
        onLogin={auth.login}
        onRegister={auth.register}
        onBack={() => auth.setAuthState('landing')}
      />
    )
  }

  // ── Test access (needed before onboarding) ──
  const FREE_TESTS = 3
  function hasTestAccess() {
    if (localStorage.getItem('zc_mvp_code')) return true
    const used = parseInt(localStorage.getItem('zc_tests_used') || '0')
    return used < FREE_TESTS
  }
  function consumeTest() {
    if (localStorage.getItem('zc_mvp_code')) return
    const used = parseInt(localStorage.getItem('zc_tests_used') || '0')
    localStorage.setItem('zc_tests_used', String(used + 1))
  }

  // ── Onboarding ──
  if (!onboarded) {
    return <Onboarding onDone={(startQuiz = false) => {
      localStorage.setItem('zc_onboarded', '1')
      setOnboarded(true)
      if (startQuiz) {
        setIsMarathon(false)
        setQuizOpts({})
        consumeTest()
        setScreen('quiz')
      }
    }} />
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
    const watched = isWatched(film)
    const pts = watchPoints(film)
    if (!watched) {
      const oldBadge = getBadge(user?.score || 0)
      auth.addWatchedLocal(film, pts)
      const newBadge = getBadge((user?.score || 0) + pts)
      if (newBadge.min > oldBadge.min) setLevelUpBadge(newBadge)
      toast.showPts(pts)
      toast.showToast('Marcada como vista ✓')
    } else {
      auth.addWatchedLocal(film, pts)
      toast.showToast('Eliminada de vistas')
    }
  }

  function handleWatchAndPostView(film) {
    const wasWatched = isWatched(film)
    handleWatch(film)
    if (!wasWatched) {
      setRecoFilm(film)
      setLastReco(film)
      setScreen('postview')
    }
  }

  function handleSave(film) {
    const saved = isSaved(film)
    auth.addWatchlistLocal(film)
    toast.showToast(saved ? 'Eliminada de tu lista' : 'Guardada en tu lista ✓')
  }

  function goBack() {
    if (navStack.length === 0) { setScreen(null); return }
    const prev = navStack[navStack.length - 1]
    setNavStack(s => s.slice(0, -1))
    setScreen(prev.screen)
    if (prev.detailFilm !== undefined) setDetailFilm(prev.detailFilm)
    if (prev.detailFrom !== undefined) setDetailFrom(prev.detailFrom)
  }

  function goBackToRoot() {
    const rootIdx = navStack.findIndex(n => n.screen !== 'detail')
    if (rootIdx === -1) { setNavStack([]); setScreen(null); return }
    const root = navStack[rootIdx]
    setNavStack([])
    setScreen(root.screen)
    if (root.detailFilm !== undefined) setDetailFilm(root.detailFilm)
    if (root.detailFrom !== undefined) setDetailFrom(root.detailFrom)
  }

  function openDetail(film, from) {
    if (screen) {
      setNavStack(s => [...s, { screen, detailFilm, detailFrom }])
    }
    setDetailFilm(film)
    setDetailFrom(from)
    setScreen('detail')
  }

  function openQuiz(opts = {}) {
    if (!hasTestAccess()) { setShowPaywall(true); return }
    consumeTest()
    setNavStack([])
    setQuizOpts(opts)
    setIsMarathon(false)
    setScreen('quiz')
  }

  function openMarathon() {
    if (!hasTestAccess()) { setShowPaywall(true); return }
    consumeTest()
    setNavStack([])
    setQuizOpts({})
    setIsMarathon(true)
    setScreen('quiz')
  }

  function openTikTok(films, startIdx = 0) {
    if (screen) {
      setNavStack(s => [...s, { screen, detailFilm, detailFrom }])
    }
    setTiktokFilms(films)
    setTiktokIdx(startIdx)
    setScreen('tiktok')
  }

  function handleQuizComplete(answers) {
    setQuizAnswers(answers)
    setQuizResults(null)
    // Marathon → list results; regular → single recommendation
    setScreen(isMarathon ? 'results' : 'recommendation')
  }

  function handleInvite() {
    const url = 'https://zineclub.vercel.app'
    if (navigator.share) {
      navigator.share({ title: 'Zine Club', text: 'Descubre películas que realmente mereces ver', url })
    } else {
      navigator.clipboard?.writeText(url)
      toast.showToast('Enlace copiado ✓')
    }
  }

  // ── Paywall ──────────────────────────────────────────────
  if (showPaywall) {
    return (
      <Paywall
        onUnlock={() => { setShowPaywall(false); openQuiz({}) }}
        onClose={() => setShowPaywall(false)}
      />
    )
  }

  // ── Overlay screens ──────────────────────────────────────
  if (screen === 'tiktok') {
    return (
      <TikTok
        films={tiktokFilms}
        initialIdx={tiktokIdx}
        onClose={goBack}
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
          onClose={goBackToRoot}
          onBack={navStack.length > 0 && navStack[navStack.length - 1].screen === 'detail' ? goBack : null}
          onDetail={openDetail}
          onWatch={handleWatch}
          onSave={handleSave}
          isWatched={isWatched}
          isSaved={isSaved}
          showToast={toast.showToast}
          showPts={toast.showPts}
          onLogin={() => { auth.setAuthState('auth') }}
        />
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        isMarathon={isMarathon}
        onComplete={handleQuizComplete}
        onExit={() => { setNavStack([]); setScreen(null) }}
      />
    )
  }

  if (screen === 'recommendation') {
    return (
      <>
        <Recommendation
          answers={quizAnswers}
          onBack={() => setScreen(null)}
          onWatch={handleWatchAndPostView}
          onSave={handleSave}
          onDetail={openDetail}
          isSaved={isSaved}
          isWatched={isWatched}
          showToast={toast.showToast}
        />
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (screen === 'postview' && recoFilm) {
    return (
      <>
        <PostView
          film={recoFilm}
          onDone={() => setScreen(null)}
          onReview={(film) => openDetail(film, 'postview')}
          showToast={toast.showToast}
          showPts={toast.showPts}
        />
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (screen === 'results') {
    return (
      <>
        <Results
          answers={quizAnswers}
          isMarathon={isMarathon}
          cachedFilms={quizResults}
          onCacheFilms={setQuizResults}
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

  // Tab 1 = Descubrir → triggers quiz directly (no separate screen)
  function handleTabChange(newTab) {
    if (newTab === 1) { openQuiz({}); return }
    setTab(newTab)
  }

  // ── Main tab shell ───────────────────────────────────────
  return (
    <div className="app-shell">
      {tab === 0 && (
        <Home
          user={user}
          streak={streak}
          onQuiz={openQuiz}
          onMarathon={openMarathon}
          onDetail={openDetail}
          onInvite={handleInvite}
          lastReco={lastReco}
          showToast={toast.showToast}
        />
      )}
      {tab === 2 && (
        <Search
          onDetail={openDetail}
          onWatch={handleWatch}
          onSave={handleSave}
          isWatched={isWatched}
          isSaved={isSaved}
        />
      )}
      {tab === 3 && (
        <MiLista
          user={user}
          onDetail={openDetail}
          onWatch={handleWatch}
          onQuiz={() => openQuiz({})}
          isWatched={isWatched}
        />
      )}
      {tab === 4 && (
        <Profile
          user={user}
          onLogout={auth.logout}
          onDetail={openDetail}
          showToast={toast.showToast}
          updateNameLocal={auth.updateNameLocal}
          updateAvatarLocal={auth.updateAvatarLocal}
        />
      )}

      <Nav activeTab={tab} onTab={handleTabChange} />
      <Toast toast={toast.toast} />
      <PtsFloat pts={toast.ptsFloat} />
      {levelUpBadge && (
        <LevelUp badge={levelUpBadge} onClose={() => setLevelUpBadge(null)} />
      )}
    </div>
  )
}
