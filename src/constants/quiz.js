// ── Questions ─────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: 'formato',
    q: '¿Qué quieres ver?',
    opts: [
      { label: 'Una película',              emoji: '🎬' },
      { label: 'Serie corta (1-2 temp.)',   emoji: '📺' },
      { label: 'Serie larga (3+ temp.)',    emoji: '📡' },
      { label: 'Lo que sea',                emoji: '🎲' },
    ],
  },
  {
    id: 'genero',
    q: '¿Qué género te apetece?',
    opts: [
      { label: 'Comedia',          emoji: '😂' },
      { label: 'Drama',            emoji: '😢' },
      { label: 'Acción',           emoji: '⚡' },
      { label: 'Thriller',         emoji: '🔍' },
      { label: 'Romance',          emoji: '💘' },
      { label: 'Ciencia ficción',  emoji: '🚀' },
      { label: 'Terror',           emoji: '🎭' },
      { label: 'Documental',       emoji: '🌍' },
      { label: 'Crimen',           emoji: '🗡' },
    ],
  },
  {
    id: 'tiempo',
    q: '¿Cuánto tiempo tienes?',
    skippable: true,
    opts: [
      { label: 'Menos de 1h30',    emoji: '⚡' },
      { label: '1h30 — 2h',        emoji: '🎬' },
      { label: 'Más de 2 horas',   emoji: '🍿' },
      { label: 'Toda la noche',    emoji: '🌙' },
    ],
  },
  {
    id: 'epoca',
    q: '¿De qué época?',
    skippable: true,
    opts: [
      { label: 'Reciente (2020+)',    emoji: '🆕' },
      { label: '2010s',              emoji: '📅' },
      { label: '90s — 2000s',        emoji: '📼' },
      { label: 'Clásico (antes 90)', emoji: '🎞' },
      { label: 'Me da igual',        emoji: '🤷' },
    ],
  },
  {
    id: 'plataformas',
    q: '¿Dónde lo quieres ver?',
    hint: 'Elige todas las plataformas que tienes',
    multi: true,
    opts: [
      { label: 'Netflix' },
      { label: 'HBO Max' },
      { label: 'Prime Video' },
      { label: 'Disney+' },
      { label: 'Filmin' },
      { label: 'Apple TV+' },
      { label: 'Movistar+' },
      { label: 'Mubi' },
    ],
  },
]

// ── Género → TMDB genre IDs ───────────────────────────────
export const GENRE_IDS_M = {
  'Comedia':         [35],
  'Drama':           [18],
  'Acción':          [28],
  'Thriller':        [53, 9648],
  'Romance':         [10749, 18],
  'Ciencia ficción': [878],
  'Terror':          [27],
  'Documental':      [99],
  'Crimen':          [80, 9648],
}

export const GENRE_IDS_T = {
  'Comedia':         [35],
  'Drama':           [18],
  'Acción':          [10759],
  'Thriller':        [9648, 80],
  'Romance':         [10749, 18],
  'Ciencia ficción': [10765],
  'Terror':          [27],
  'Documental':      [99],
  'Crimen':          [80, 9648],
}

// ── Época → date params ───────────────────────────────────
export const ERA_DATES_M = {
  'Reciente (2020+)':    'primary_release_date.gte=2020-01-01',
  '2010s':               'primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31',
  '90s — 2000s':         'primary_release_date.gte=1990-01-01&primary_release_date.lte=2009-12-31',
  'Clásico (antes 90)':  'primary_release_date.lte=1989-12-31',
  'Me da igual':         '',
}

export const ERA_DATES_T = {
  'Reciente (2020+)':    'first_air_date.gte=2020-01-01',
  '2010s':               'first_air_date.gte=2010-01-01&first_air_date.lte=2019-12-31',
  '90s — 2000s':         'first_air_date.gte=1990-01-01&first_air_date.lte=2009-12-31',
  'Clásico (antes 90)':  'first_air_date.lte=1989-12-31',
  'Me da igual':         '',
}

// ── Género → tagline personalizada ───────────────────────
export const GENRE_TAGLINES = {
  'Comedia':         'Querías reírte.',
  'Drama':           'Querías emocionarte.',
  'Acción':          'Querías adrenalina.',
  'Thriller':        'Querías tensión.',
  'Romance':         'Querías sentir algo.',
  'Ciencia ficción': 'Querías otro mundo.',
  'Terror':          'Querías asustarte.',
  'Documental':      'Querías aprender algo.',
  'Crimen':          'Querías un misterio.',
}

// Keep for backwards compat with Recommendation screen
export const SENTIR_TAGLINES = GENRE_TAGLINES
