import { typePillStyle } from '../lib/utils.js'

export default function TypePill({ item }) {
  if (!item) return null
  const label = item.mediaType === 'movie' ? 'Película' : (item.seriesType || 'Serie')
  const { bg, color } = typePillStyle(item)
  return (
    <span className="type-pill" style={{ background: bg, color }}>
      {label}
    </span>
  )
}
