// SVG icon set — consistent stroke style
const S = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IcoHome    = () => <svg {...S}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
export const IcoSearch  = () => <svg {...S}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
export const IcoStar    = () => <svg {...S}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
export const IcoUsers   = () => <svg {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
export const IcoUser    = () => <svg {...S}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
export const IcoPlay    = () => <svg {...S}><polygon points="5 3 19 12 5 21 5 3"/></svg>
export const IcoEye     = () => <svg {...S}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></svg>
export const IcoBookmark = () => <svg {...S}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
export const IcoShare   = () => <svg {...S}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
export const IcoChevron = ({ dir = 'right' }) => {
  const paths = { right: 'M9 18l6-6-6-6', left: 'M15 18l-6-6 6-6', up: 'M18 15l-6-6-6 6', down: 'M6 9l6 6 6-6' }
  return <svg {...S}><polyline points={paths[dir].replace('M', '').split('l')[0] + ' ' + paths[dir].split('l').slice(1).join('l')} />{/* fallback */}<path d={paths[dir]}/></svg>
}
export const IcoX       = () => <svg {...S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
export const IcoCheck   = () => <svg {...S}><polyline points="20 6 9 17 4 12"/></svg>
export const IcoBell    = () => <svg {...S}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
export const IcoLogout  = () => <svg {...S}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
export const IcoEdit    = () => <svg {...S}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
export const IcoFlame   = () => <svg {...S}><path d="M12 2c0 6-8 8-8 14a8 8 0 0 0 16 0c0-6-8-8-8-14z"/></svg>
