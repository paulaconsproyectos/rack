export const QUESTIONS = [
  {
    id: 'format',
    q: '¿Película o serie?',
    grid: true,
    cols: 3,
    opts: [
      { label: 'Película', emoji: '🎬' },
      { label: 'Serie',    emoji: '📺' },
      { label: 'Me da igual', emoji: '🎲' },
    ],
  },
  {
    id: 'mood',
    q: '¿Cómo estás ahora?',
    grid: true,
    cols: 3,
    opts: [
      { label: 'Eufórico',    emoji: '⚡' },
      { label: 'Melancólico', emoji: '🌧' },
      { label: 'Curioso',     emoji: '🔍' },
      { label: 'Relajado',    emoji: '🛋' },
      { label: 'Intenso',     emoji: '🔥' },
      { label: 'Romántico',   emoji: '🕯' },
    ],
  },
  {
    id: 'time',
    q: '¿Cuánto tiempo tienes?',
    grid: true,
    cols: 2,
    opts: [
      { label: 'Menos de 1h',   emoji: '⏱' },
      { label: '1–2 horas',     emoji: '🎬' },
      { label: 'Más de 2h',     emoji: '🌙' },
      { label: 'Toda la noche', emoji: '✨' },
    ],
  },
  {
    id: 'platform',
    q: '¿Qué plataformas tienes?',
    grid: true,
    cols: 2,
    multi: true,
    opts: [
      { label: 'Netflix' },
      { label: 'HBO Max' },
      { label: 'Disney+' },
      { label: 'Prime Video' },
      { label: 'Filmin' },
      { label: 'Apple TV+' },
      { label: 'Movistar+' },
      { label: 'Todo me vale', emoji: '🌍' },
    ],
  },
  {
    id: 'vibe',
    q: '¿Qué experiencia buscas?',
    grid: true,
    cols: 2,
    opts: [
      { label: 'Que me impacte',   emoji: '💥' },
      { label: 'Que me evada',     emoji: '🚀' },
      { label: 'Que me haga reír', emoji: '😂' },
      { label: 'Que me asuste',    emoji: '👁' },
      { label: 'Arte puro',        emoji: '🎨' },
      { label: 'Buena historia',   emoji: '📖' },
    ],
  },
  {
    id: 'era',
    q: '¿De qué época?',
    grid: true,
    cols: 2,
    opts: [
      { label: 'Actual (2015+)',       emoji: '🆕' },
      { label: 'Clásicos (90s–2000s)', emoji: '📼' },
      { label: 'Retro (antes del 90)', emoji: '🎞' },
      { label: 'Me da igual',          emoji: '♾' },
    ],
  },
]

export const MOODS_POST = [
  'Impactado', 'Emocionado', 'Reflexivo', 'Entretenido',
  'Decepcionado', 'Sorprendido', 'Inspirado', 'Triste',
]

export const MOOD_GENRES = {
  Eufórico:    [28, 12, 35],
  Melancólico: [18, 10749, 9648],
  Curioso:     [99, 878, 9648],
  Relajado:    [35, 10751, 16],
  Intenso:     [53, 80, 27],
  Romántico:   [10749, 18, 35],
}

export const MOOD_GENRES_TV = {
  Eufórico:    [28, 12, 35],
  Melancólico: [18, 10749],
  Curioso:     [99, 10765],
  Relajado:    [35, 10751],
  Intenso:     [80, 9648],
  Romántico:   [10749, 18],
}

export const VIBE_GENRES = {
  'Que me impacte':   [18, 53],
  'Que me evada':     [12, 14, 10765],
  'Que me haga reír': [35],
  'Que me asuste':    [27, 9648],
  'Arte puro':        [18, 36],
  'Buena historia':   [18, 80],
}
