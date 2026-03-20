import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM || 'Zine Club <hola@zineclub.io>'
const APP_URL = process.env.APP_URL || 'https://zineclub.io'
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

function emailHtml({ firstName, subject, preheader, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#09090B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#09090B;">
    <tr><td align="center" style="padding:40px 16px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:500px;">
        <tr><td>
          <!-- Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;">
            <tr>
              <td style="padding-bottom:20px;">
                <span style="font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#fff;">Zine<span style="color:#C9A96E;"> Club</span></span>
              </td>
              <td align="right" style="padding-bottom:20px;">
                <span style="font-size:18px;color:#C9A96E;">✦</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="height:1px;background:rgba(201,169,110,0.25);"></td>
            </tr>
          </table>
          <!-- Body -->
          ${bodyHtml}
          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr><td style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:24px;"></td></tr>
            <tr><td style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.6;">
                Para los que de verdad aman el cine.<br>
                <a href="${APP_URL}" style="color:rgba(201,169,110,0.5);text-decoration:none;">zineclub.io</a>
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function day3Html(firstName, appUrl) {
  return `
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C9A96E;font-weight:600;">Día 3 en el club</p>
    <h1 style="margin:0 0 20px;font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:#fff;">¿Ya guardaste<br>tu primera peli, ${firstName}?</h1>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.55);">
      Llevas 3 días en Zine Club y queremos asegurarnos de que le estás sacando el máximo partido.
    </p>
    <!-- Features -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr><td style="padding:16px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.07);margin-bottom:12px;">
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">📋 Mi Lista</p>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.5;">Guarda las pelis que quieres ver para no perderlas nunca.</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
      <tr><td style="padding:16px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">🎬 Modo Maratón</p>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.5;">¿Tienes toda la noche? Actívalo y recibe recomendaciones encadenadas.</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr><td style="padding:16px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">🔗 Invita a tu gente</p>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.5;">Comparte tu código y los dos ganáis puntos extra.</p>
      </td></tr>
    </table>
    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <a href="${appUrl}" style="display:inline-block;background:#C9A96E;color:#09090B;font-weight:800;font-size:16px;letter-spacing:-0.01em;padding:16px 36px;border-radius:12px;text-decoration:none;">
          Abrir Zine Club &nbsp;✦
        </a>
      </td></tr>
    </table>`
}

function day7Html(firstName, stripeUrl) {
  return `
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C9A96E;font-weight:600;">Oferta especial · Solo esta semana</p>
    <h1 style="margin:0 0 20px;font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:#fff;">${firstName}, lleva<br>Zine Club al siguiente<br><em style="font-style:italic;color:#C9A96E;">nivel.</em></h1>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.55);">
      Llevas una semana con nosotros. Es el mejor momento para pasarte a Premium.
    </p>
    <!-- Benefits -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;background:rgba(201,169,110,0.07);border-radius:12px;border:1px solid rgba(201,169,110,0.2);">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#C9A96E;letter-spacing:0.06em;text-transform:uppercase;">Qué incluye Premium</p>
        <p style="margin:0 0 8px;font-size:15px;color:#fff;">✦ &nbsp;Tests ilimitados (sin límite de 5/día)</p>
        <p style="margin:0 0 8px;font-size:15px;color:#fff;">✦ &nbsp;Acceso al Modo Maratón completo</p>
        <p style="margin:0;font-size:15px;color:#fff;">✦ &nbsp;Badge exclusivo en tu perfil</p>
      </td></tr>
    </table>
    <!-- Price -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr><td align="center" style="padding:20px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Precio especial esta semana</p>
        <p style="margin:0;font-size:36px;font-weight:800;color:#C9A96E;letter-spacing:-0.03em;">2,99€<span style="font-size:16px;color:rgba(255,255,255,0.4);font-weight:400;">/mes</span></p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.3);">Cancela cuando quieras</p>
      </td></tr>
    </table>
    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr><td align="center">
        <a href="${stripeUrl}" style="display:inline-block;background:#C9A96E;color:#09090B;font-weight:800;font-size:16px;letter-spacing:-0.01em;padding:16px 36px;border-radius:12px;text-decoration:none;">
          Activar Premium ahora &nbsp;✦
        </a>
      </td></tr>
    </table>
    <p style="margin:0;text-align:center;font-size:12px;color:rgba(255,255,255,0.25);">Esta oferta expira en 7 días.</p>`
}

async function sendDay3(user) {
  const firstName = (user.name || 'cinéfilo').split(' ')[0]
  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: '¿Ya guardaste tu primera peli? 📋',
    text: `Hola ${firstName},\n\nLlevas 3 días en Zine Club. ¿Has probado Mi Lista y el Modo Maratón?\n\nAbre la app: ${APP_URL}\n\n— Zine Club`,
    html: emailHtml({
      firstName,
      subject: '¿Ya guardaste tu primera peli? 📋',
      preheader: 'Tres funciones que quizás no conoces todavía.',
      bodyHtml: day3Html(firstName, APP_URL),
    }),
  })
}

async function sendDay7(user) {
  const firstName = (user.name || 'cinéfilo').split(' ')[0]
  const stripeUrl = `${APP_URL}?upgrade=1`
  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: 'Solo esta semana: Premium por 2,99€/mes ✦',
    text: `Hola ${firstName},\n\nLlevas una semana en Zine Club. Pásate a Premium: tests ilimitados, Modo Maratón completo y badge exclusivo.\n\nActivar: ${stripeUrl}\n\n— Zine Club`,
    html: emailHtml({
      firstName,
      subject: 'Solo esta semana: Premium por 2,99€/mes ✦',
      preheader: 'Tests ilimitados, Modo Maratón y badge exclusivo.',
      bodyHtml: day7Html(firstName, stripeUrl),
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const now = new Date()

  // Usuarios registrados hace 3 días sin email_day3_sent
  const day3Start = new Date(now); day3Start.setDate(day3Start.getDate() - 4)
  const day3End   = new Date(now); day3End.setDate(day3End.getDate() - 3)

  // Usuarios registrados hace 7 días sin email_day7_sent
  const day7Start = new Date(now); day7Start.setDate(day7Start.getDate() - 8)
  const day7End   = new Date(now); day7End.setDate(day7End.getDate() - 7)

  const [{ data: day3Users }, { data: day7Users }] = await Promise.all([
    sb.from('profiles')
      .select('id, name')
      .eq('email_day3_sent', false)
      .gte('created_at', day3Start.toISOString())
      .lt('created_at', day3End.toISOString()),
    sb.from('profiles')
      .select('id, name')
      .eq('email_day7_sent', false)
      .eq('is_pro', false)
      .gte('created_at', day7Start.toISOString())
      .lt('created_at', day7End.toISOString()),
  ])

  // Obtener emails de auth.users para cada usuario
  const allIds = [...new Set([
    ...(day3Users || []).map(u => u.id),
    ...(day7Users || []).map(u => u.id),
  ])]

  const emailMap = {}
  for (const id of allIds) {
    const { data } = await sb.auth.admin.getUserById(id)
    if (data?.user?.email) emailMap[id] = data.user.email
  }

  let sent3 = 0, sent7 = 0

  for (const user of (day3Users || [])) {
    const email = emailMap[user.id]
    if (!email) continue
    try {
      await sendDay3({ ...user, email })
      await sb.from('profiles').update({ email_day3_sent: true }).eq('id', user.id)
      sent3++
    } catch (e) {
      console.error('day3 error', user.id, e.message)
    }
  }

  for (const user of (day7Users || [])) {
    const email = emailMap[user.id]
    if (!email) continue
    try {
      await sendDay7({ ...user, email })
      await sb.from('profiles').update({ email_day7_sent: true }).eq('id', user.id)
      sent7++
    } catch (e) {
      console.error('day7 error', user.id, e.message)
    }
  }

  res.json({ ok: true, sent3, sent7 })
}
