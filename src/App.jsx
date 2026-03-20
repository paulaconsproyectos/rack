import { lazy, Suspense, useEffect } from 'react'
import { useAuth }       from './hooks/useAuth.js'
import { useToast }      from './hooks/useToast.js'
import { useNavigation } from './hooks/useNavigation.js'
import { computeStreak, watchPoints } from './lib/utils.js'
import { getBadge }      from './constants/badges.js'
import { registerSW }    from './lib/notifications.js'
import { identify, track } from './lib/analytics.js'
import { LS, KEYS }      from './lib/storage.js'

// Critical path — loaded eagerly
import Landing      from './screens/Landing/Landing.jsx'
import Auth         from './screens/Auth/Auth.jsx'
import Home         from './screens/Home/Home.jsx'
import Quiz         from './screens/Quiz/Quiz.jsx'
import Onboarding   from './screens/Onboarding/Onboarding.jsx'
import Paywall      from './screens/Paywall/Paywall.jsx'
import Nav          from './components/Nav.jsx'
import { Toast, PtsFloat } from './components/Toast.jsx'

// Lazy-loaded — only when navigated to
const Recommendation = lazy(() => import('./screens/Recommendation/Recommendation.jsx'))
const PostView       = lazy(() => import('./screens/PostView/PostView.jsx'))
const Detail         = lazy(() => import('./screens/Detail/Detail.jsx'))
const Results        = lazy(() => import('./screens/Results/Results.jsx'))
const TikTok         = lazy(() => import('./screens/TikTok/TikTok.jsx'))
const Search         = lazy(() => import('./screens/Search/Search.jsx'))
const MiLista        = lazy(() => import('./screens/MiLista/MiLista.jsx'))
const Profile        = lazy(() => import('./screens/Profile/Profile.jsx'))
const Social         = lazy(() => import('./screens/Social/Social.jsx'))
const LevelUp        = lazy(() => import('./screens/LevelUp/LevelUp.jsx'))

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
import './screens/Social/Social.css'
import './screens/Onboarding/Onboarding.css'
import './screens/LevelUp/LevelUp.css'

const FREE_TESTS = 5

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" aria-label="Cargando" />
    </div>
  )
}

export default function App() {
  const auth = useAuth()
  const toast = useToast()
  const nav  = useNavigation()

  useEffect(() => { registerSW() }, [])

  useEffect(() => {
    if (auth.user?.id) identify(auth.user.id, { name: auth.user.name, email: auth.user.email })
  }, [auth.user?.id])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pro') === '1') {
      window.history.replaceState({}, '', '/')
      toast.showToast('¡Ya eres Pro! Disfruta de tests ilimitados ✦')
    }
  }, [])

  // ── Auth guards ──────────────────────────────────────────
  if (auth.authState === 'loading') return <Spinner />

  if (auth.authState === 'landing') {
    return <Landing
      onRegister={() => { auth.setAuthState('auth') }}
      onLogin={() => { auth.setAuthState('auth') }}
    />
  }

  if (auth.authState === 'auth' || auth.authState === 'reset') {
    return (
      <Auth
        mode={auth.authState === 'reset' ? 'reset' : 'login'}
        onLogin={auth.login}
        onRegister={auth.register}
        onBack={() => auth.setAuthState('landing')}
        onPasswordReset={auth.sendPasswordReset}
        onUpdatePassword={auth.updatePassword}
      />
    )
  }

  // ── Onboarding ──────────────────────────────────────────
  if (!nav.onboarded) {
    return <Onboarding onDone={(startQuiz = false) => {
      LS.setFlag(KEYS.onboarded)
      nav.setOnboarded(true)
      if (startQuiz) {
        consumeTest()
        nav.startQuiz({})
      }
    }} />
  }

  // ── Helpers ─────────────────────────────────────────────
  const user   = auth.user
  const streak = computeStreak(user?.watched || [])

  function hasTestAccess() {
    if (user?.is_pro || LS.flag(KEYS.mvpCode)) return true
    return LS.get(KEYS.testsUsed, 0) < FREE_TESTS
  }

  function consumeTest() {
    if (user?.is_pro || LS.flag(KEYS.mvpCode)) return
    LS.set(KEYS.testsUsed, LS.get(KEYS.testsUsed, 0) + 1)
  }

  function isWatched(film) {
    return (user?.watched || []).some(w => w.id === film.id)
  }

  function isSaved(film) {
    return (user?.watchlist || []).some(w => w.id === film.id)
  }

  function handleWatch(film) {
    const alreadyWatched = isWatched(film)
    const pts = watchPoints(film)
    if (!alreadyWatched) {
      const oldBadge = getBadge(user?.score || 0)
      auth.addWatchedLocal(film, pts)
      const newBadge = getBadge((user?.score || 0) + pts)
      if (newBadge.min > oldBadge.min) {
        nav.setLevelUpBadge(newBadge)
        track('level_up', { badge: newBadge.name, score: (user?.score || 0) + pts })
      }
      track('film_watched', { film_id: film.id, title: film.title, media_type: film.mediaType, genres: film.genres })
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
      nav.setRecoFilm(film)
      nav.setLastReco(film)
      nav.setScreen('postview')
      if (user?.id) {
        fetch('/api/schedule-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, filmId: film.id, filmTitle: film.titleEs || film.title }),
        }).catch(() => {})
      }
    }
  }

  function handleSave(film) {
    const saved = isSaved(film)
    auth.addWatchlistLocal(film)
    if (!saved) track('film_saved', { film_id: film.id, title: film.title, media_type: film.mediaType })
    toast.showToast(saved ? 'Eliminada de tu lista' : 'Guardada en tu lista ✓')
  }

  function openQuiz(opts = {}) {
    if (!hasTestAccess()) { track('paywall_shown', { reason: 'tests_limit' }); nav.setShowPaywall(true); return }
    consumeTest()
    track('quiz_started', { mode: 'single' })
    nav.startQuiz(opts, false)
  }

  function openMarathon() {
    if (!hasTestAccess()) { track('paywall_shown', { reason: 'tests_limit' }); nav.setShowPaywall(true); return }
    consumeTest()
    track('quiz_started', { mode: 'marathon' })
    nav.startQuiz({}, true)
  }

  function handleInvite() {
    const code = user?.invite_code
    const url  = `https://zineclub.io${code ? `?ref=${code}` : ''}`
    const text = 'Descubre lo que realmente mereces ver esta noche. Sin scroll, sin algoritmos.'
    if (navigator.share) {
      navigator.share({ title: 'Zine Club', text, url })
    } else {
      navigator.clipboard?.writeText(url)
      toast.showToast('Enlace copiado ✓')
    }
    track('invite_shared', { has_code: !!code })
  }

  // ── Paywall ──────────────────────────────────────────────
  if (nav.showPaywall) {
    return (
      <Paywall
        user={user}
        onUnlock={() => { nav.setShowPaywall(false); openQuiz({}) }}
        onClose={() => nav.setShowPaywall(false)}
      />
    )
  }

  // ── Overlay screens ──────────────────────────────────────
  if (nav.screen === 'tiktok') {
    return (
      <Suspense fallback={<Spinner />}>
        <TikTok
          films={nav.tiktokFilms}
          initialIdx={nav.tiktokIdx}
          onClose={nav.goBack}
          onDetail={nav.openDetail}
          onWatch={handleWatchAndPostView}
          onSave={handleSave}
          isWatched={isWatched}
          isSaved={isSaved}
        />
      </Suspense>
    )
  }

  if (nav.screen === 'detail' && nav.detailFilm) {
    return (
      <>
        <Suspense fallback={<Spinner />}>
          <Detail
            film={nav.detailFilm}
            from={nav.detailFrom}
            user={user}
            onClose={nav.goBackToRoot}
            onBack={nav.navStack.length > 0 && nav.navStack[nav.navStack.length - 1].screen === 'detail' ? nav.goBack : null}
            onDetail={nav.openDetail}
            onWatch={handleWatchAndPostView}
            onSave={handleSave}
            isWatched={isWatched}
            isSaved={isSaved}
            showToast={toast.showToast}
            showPts={toast.showPts}
            onLogin={() => auth.setAuthState('auth')}
          />
        </Suspense>
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (nav.screen === 'quiz') {
    return (
      <Quiz
        isMarathon={nav.isMarathon}
        onComplete={(answers) => {
          nav.setQuizAnswers(answers)
          nav.setQuizResults(null)
          track('quiz_completed', { mode: nav.isMarathon ? 'marathon' : 'single', ...answers })
          nav.setScreen(nav.isMarathon ? 'results' : 'recommendation')
        }}
        onExit={() => { nav.setNavStack([]); nav.setScreen(null) }}
      />
    )
  }

  if (nav.screen === 'recommendation') {
    return (
      <>
        <Suspense fallback={<Spinner />}>
          <Recommendation
            answers={nav.quizAnswers}
            onBack={() => nav.setScreen(null)}
            onWatch={handleWatchAndPostView}
            onSave={handleSave}
            onDetail={nav.openDetail}
            isSaved={isSaved}
            isWatched={isWatched}
            showToast={toast.showToast}
          />
        </Suspense>
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (nav.screen === 'postview' && nav.recoFilm) {
    return (
      <>
        <Suspense fallback={<Spinner />}>
          <PostView
            film={nav.recoFilm}
            onDone={() => nav.setScreen(null)}
            onReview={(film) => nav.openDetail(film, 'postview')}
            showToast={toast.showToast}
            showPts={toast.showPts}
          />
        </Suspense>
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  if (nav.screen === 'results') {
    return (
      <>
        <Suspense fallback={<Spinner />}>
          <Results
            answers={nav.quizAnswers}
            isMarathon={nav.isMarathon}
            cachedFilms={nav.quizResults}
            onCacheFilms={nav.setQuizResults}
            onBack={() => nav.setScreen('quiz')}
            onDetail={nav.openDetail}
            onTikTok={nav.openTikTok}
            onWatch={handleWatchAndPostView}
            onSave={handleSave}
            isWatched={isWatched}
            isSaved={isSaved}
          />
        </Suspense>
        <Toast toast={toast.toast} />
        <PtsFloat pts={toast.ptsFloat} />
      </>
    )
  }

  // ── Main tab shell ───────────────────────────────────────
  return (
    <div className="app-shell">
      <main role="main" aria-label="Contenido principal">
        {nav.tab === 0 && (
          <Home
            user={user}
            streak={streak}
            onQuiz={openQuiz}
            onMarathon={openMarathon}
            onDetail={nav.openDetail}
            onInvite={handleInvite}
            lastReco={nav.lastReco}
            showToast={toast.showToast}
            isWatched={isWatched}
          />
        )}
        {nav.tab === 1 && (
          <Suspense fallback={<Spinner />}>
            <Social user={user} onDetail={nav.openDetail} />
          </Suspense>
        )}
        {nav.tab === 2 && (
          <Suspense fallback={<Spinner />}>
            <Search
              onDetail={nav.openDetail}
              onWatch={handleWatchAndPostView}
              onSave={handleSave}
              isWatched={isWatched}
              isSaved={isSaved}
            />
          </Suspense>
        )}
        {nav.tab === 3 && (
          <Suspense fallback={<Spinner />}>
            <MiLista
              user={user}
              onDetail={nav.openDetail}
              onWatch={handleWatchAndPostView}
              onQuiz={() => openQuiz({})}
              isWatched={isWatched}
            />
          </Suspense>
        )}
        {nav.tab === 4 && (
          <Suspense fallback={<Spinner />}>
            <Profile
              user={user}
              onLogout={auth.logout}
              onDetail={nav.openDetail}
              showToast={toast.showToast}
              updateNameLocal={auth.updateNameLocal}
              updateAvatarLocal={auth.updateAvatarLocal}
              onInvite={handleInvite}
              onUpgrade={() => { track('paywall_shown', { reason: 'profile' }); nav.setShowPaywall(true) }}
            />
          </Suspense>
        )}
      </main>

      <Nav activeTab={nav.tab} onTab={nav.setTab} />
      <Toast toast={toast.toast} />
      <PtsFloat pts={toast.ptsFloat} />
      {nav.levelUpBadge && (
        <Suspense fallback={null}>
          <LevelUp badge={nav.levelUpBadge} onClose={() => nav.setLevelUpBadge(null)} />
        </Suspense>
      )}
    </div>
  )
}
