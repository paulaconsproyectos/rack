export const BADGES = [
  { min: 0,    label: 'Espectador', emoji: '👁' },
  { min: 100,  label: 'Aficionado', emoji: '🎬' },
  { min: 300,  label: 'Cinéfilo',   emoji: '🎞' },
  { min: 600,  label: 'Auteur',     emoji: '🎭' },
  { min: 1000, label: 'Crítico',    emoji: '✍️' },
  { min: 2000, label: 'Maestro',    emoji: '🏆' },
  { min: 5000, label: 'Leyenda',    emoji: '⭐' },
]

export const getBadge = (score) =>
  [...BADGES].reverse().find((b) => score >= b.min) || BADGES[0]

export const getNextBadge = (score) =>
  BADGES.find((b) => b.min > score) || null
