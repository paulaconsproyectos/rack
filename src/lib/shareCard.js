// Generates a 1080x1080 shareable card for a film recommendation

const W = 1080
const H = 1080

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('img load failed'))
    img.src = src
  })
}

export async function generateShareCard(film) {
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const imgSrc = film.backdrop || film.poster

  // ── Background ──────────────────────────────────────────
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  if (imgSrc) {
    try {
      const img = await loadImage(imgSrc)
      // Draw blurred full-bleed background
      ctx.save()
      ctx.filter = 'blur(48px) brightness(0.35) saturate(1.4)'
      const scale = Math.max(W / img.width, H / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)
      ctx.restore()
    } catch {}
  }

  // ── Dark vignette overlay ────────────────────────────────
  const vignette = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, W*0.8)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.7)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)

  // ── Poster ───────────────────────────────────────────────
  const posterSrc = film.poster || film.backdrop
  if (posterSrc) {
    try {
      const poster = await loadImage(posterSrc)
      const pw = 340
      const ph = 510
      const px = (W - pw) / 2
      const py = 160

      // Shadow
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur  = 60
      ctx.shadowOffsetY = 20

      // Rounded rect clip
      roundRect(ctx, px, py, pw, ph, 20)
      ctx.clip()
      ctx.drawImage(poster, px, py, pw, ph)
      ctx.restore()

      // Border
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 2
      roundRect(ctx, px, py, pw, ph, 20)
      ctx.stroke()
      ctx.restore()
    } catch {}
  }

  // ── Title ────────────────────────────────────────────────
  const title = film.titleEs || film.title || ''
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = `600 ${title.length > 25 ? 52 : 64}px "DM Serif Display", Georgia, serif`
  wrapText(ctx, title, W / 2, 740, W - 120, title.length > 25 ? 62 : 76)

  // ── Meta ─────────────────────────────────────────────────
  const meta = [film.year, film.genres?.[0]].filter(Boolean).join(' · ')
  if (meta) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '400 32px "DM Sans", system-ui, sans-serif'
    ctx.fillText(meta, W / 2, 860)
  }

  // ── Gold accent line ─────────────────────────────────────
  ctx.strokeStyle = 'rgba(201,169,110,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - 40, 900)
  ctx.lineTo(W / 2 + 40, 900)
  ctx.stroke()

  // ── Branding ─────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,169,110,0.9)'
  ctx.font = '700 30px "DM Sans", system-ui, sans-serif'
  ctx.letterSpacing = '0.1em'
  ctx.fillText('✦ ZINE CLUB', W / 2, 960)

  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '400 24px "DM Sans", system-ui, sans-serif'
  ctx.fillText('zineclub.app', W / 2, 1000)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineH
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, currentY)
}
