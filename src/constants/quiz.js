// ── Questions ─────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: 'sentir',
    q: '¿Qué tienes ganas de sentir?',
    skippable: true,
    opts: [
      { label: 'Reírme mucho' },
      { label: 'Emocionarme o llorar' },
      { label: 'Adrenalina y tensión' },
      { label: 'Pensar y reflexionar' },
      { label: 'Desconectar sin pensar' },
      { label: 'Sorprenderme' },
    ],
  },
  {
    id: 'formato',
    q: '¿Qué formato prefieres?',
    skippable: true,
    opts: [
      { label: 'Película',                     emoji: '🎬' },
      { label: 'Miniserie (pocos episodios)',   emoji: '📺' },
      { label: 'Serie corta (1-2 temporadas)',  emoji: '🎞' },
      { label: 'Serie larga (3+ temporadas)',   emoji: '📡' },
      { label: 'Lo que sea, sorpréndeme',       emoji: '🎲' },
    ],
  },
  {
    id: 'tiempo',
    q: '¿Cuánto tiempo tienes?',
    skippable: true,
    opts: [
      { label: 'Menos de 1h30' },
      { label: 'Película normal (1h30–2h)' },
      { label: 'Película larga (2h+)' },
      { label: 'Un par de episodios' },
      { label: 'Tengo toda la noche' },
    ],
  },
  {
    id: 'compania',
    q: '¿Con quién estás?',
    skippable: true,
    opts: [
      { label: 'Solo/a' },
      { label: 'En pareja' },
      { label: 'Con amigos' },
      { label: 'Con familia / niños' },
      { label: 'Con alguien que no conozco bien' },
    ],
  },
  {
    id: 'evitar',
    q: '¿Qué te apetece evitar?',
    hint: 'Puedes elegir varias opciones',
    skippable: true,
    multi: true,
    opts: [
      { label: 'Nada, sorpréndeme' },
      { label: 'Violencia o gore' },
      { label: 'Contenido muy triste' },
      { label: 'Sustos o terror' },
      { label: 'Mucho drama sentimental' },
    ],
  },
  {
    id: 'plataformas',
    q: '¿En qué plataformas tienes acceso?',
    hint: 'Elige todas las que tengas',
    multi: true,
    opts: [
      { label: 'Netflix' },
      { label: 'HBO Max' },
      { label: 'Prime Video' },
      { label: 'Disney+' },
      { label: 'Filmin' },
      { label: 'Apple TV+' },
      { label: 'Movistar+' },
    ],
  },
]

// ── Sentir → TMDB genre IDs ───────────────────────────────
export const SENTIR_GENRES_M = {
  'Reírme mucho':           [35, 12],
  'Emocionarme o llorar':   [18, 10749],
  'Adrenalina y tensión':   [28, 53],
  'Pensar y reflexionar':   [18, 99, 9648],
  'Desconectar sin pensar': [35, 16, 12],
  'Sorprenderme':           [878, 9648, 14],
}

export const SENTIR_GENRES_T = {
  'Reírme mucho':           [35],
  'Emocionarme o llorar':   [18, 10749],
  'Adrenalina y tensión':   [10759, 80],
  'Pensar y reflexionar':   [18, 10765, 9648],
  'Desconectar sin pensar': [35, 16],
  'Sorprenderme':           [10765, 9648],
}

// ── Evitar → genre IDs to exclude ────────────────────────
export const EVITAR_EXCL = {
  'Violencia o gore':        [27],
  'Sustos o terror':         [27],
  'Mucho drama sentimental': [10749],
  'Contenido muy triste':    [],
}

// ── Sentir → personalized tagline ────────────────────────
export const SENTIR_TAGLINES = {
  'Reírme mucho':           'Querías reírte.',
  'Emocionarme o llorar':   'Querías emocionarte.',
  'Adrenalina y tensión':   'Querías tensión.',
  'Pensar y reflexionar':   'Querías pensar.',
  'Desconectar sin pensar': 'Querías desconectar.',
  'Sorprenderme':           'Querías sorprenderte.',
}
