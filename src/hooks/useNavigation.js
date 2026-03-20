import { useState } from 'react'
import { LS, KEYS } from '../lib/storage.js'

export function useNavigation() {
  const [tab, setTab]               = useState(0)
  const [screen, setScreen]         = useState(null)
  const [navStack, setNavStack]     = useState([])
  const [detailFilm, setDetailFilm] = useState(null)
  const [detailFrom, setDetailFrom] = useState(null)
  const [tiktokFilms, setTiktokFilms] = useState([])
  const [tiktokIdx, setTiktokIdx]   = useState(0)
  const [isMarathon, setIsMarathon] = useState(false)
  const [quizOpts, setQuizOpts]     = useState({})
  const [quizAnswers, setQuizAnswers] = useState(null)
  const [quizResults, setQuizResults] = useState(null)
  const [recoFilm, setRecoFilm]     = useState(null)
  const [lastReco, setLastReco]     = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [levelUpBadge, setLevelUpBadge] = useState(null)
  const [onboarded, setOnboarded]   = useState(() => LS.flag(KEYS.onboarded))

  function openDetail(film, from) {
    if (screen) {
      setNavStack(s => [...s, { screen, detailFilm, detailFrom }])
    }
    setDetailFilm(film)
    setDetailFrom(from)
    setScreen('detail')
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

  function openTikTok(films, startIdx = 0) {
    if (screen) {
      setNavStack(s => [...s, { screen, detailFilm, detailFrom }])
    }
    setTiktokFilms(films)
    setTiktokIdx(startIdx)
    setScreen('tiktok')
  }

  function startQuiz(opts = {}, marathon = false) {
    setNavStack([])
    setQuizOpts(opts)
    setIsMarathon(marathon)
    setScreen('quiz')
  }

  return {
    tab, setTab,
    screen, setScreen,
    navStack, setNavStack,
    detailFilm, detailFrom,
    tiktokFilms, tiktokIdx,
    isMarathon,
    quizOpts,
    quizAnswers, setQuizAnswers,
    quizResults, setQuizResults,
    recoFilm, setRecoFilm,
    lastReco, setLastReco,
    showPaywall, setShowPaywall,
    levelUpBadge, setLevelUpBadge,
    onboarded, setOnboarded,
    openDetail, goBack, goBackToRoot,
    openTikTok, startQuiz,
  }
}
