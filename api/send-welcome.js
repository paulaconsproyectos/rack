import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM || 'Zine Club <hola@zineclub.io>'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Missing email' })

  const firstName = (name || 'cinéfilo').split(' ')[0]

  try {
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: '✦ Tu primera recomendación te espera',
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090B;font-family:'DM Sans',system-ui,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <tr><td>
      <div style="font-size:32px;letter-spacing:-0.03em;font-weight:700;margin-bottom:8px;">
        Zine<span style="color:#C9A96E"> Club</span>
      </div>
      <div style="width:40px;height:2px;background:#C9A96E;margin-bottom:32px;"></div>

      <h1 style="font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 16px;">
        Bienvenido/a, ${firstName}. 🎬
      </h1>

      <p style="font-size:16px;color:rgba(255,255,255,0.6);line-height:1.6;margin:0 0 32px;">
        Ya estás dentro. Esta noche, sin scroll infinito ni algoritmos aburridos, te encontramos lo que realmente mereces ver.
      </p>

      <a href="https://zineclub.io"
         style="display:inline-block;background:#C9A96E;color:#000;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
        Hacer mi primera recomendación ✦
      </a>

      <div style="margin:40px 0 0;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
        <p style="font-size:13px;color:rgba(255,255,255,0.3);line-height:1.6;margin:0;">
          Cómo funciona: 5 preguntas · 30 segundos · una recomendación exacta, en tu plataforma.<br>
          Sin scroll. Sin algoritmos. Solo lo que toca ver esta noche.
        </p>
      </div>

      <div style="margin-top:32px;">
        <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0;">
          © Zine Club · <a href="https://zineclub.io" style="color:rgba(255,255,255,0.3);">zineclub.io</a>
        </p>
      </div>
    </td></tr>
  </table>
</body>
</html>`,
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
