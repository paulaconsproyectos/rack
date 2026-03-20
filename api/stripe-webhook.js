import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'Zine Club <hola@zineclub.io>'
const APP_URL = process.env.APP_URL || 'https://zineclub.io'

async function sendRetentionEmail(userId) {
  const { data } = await sb.auth.admin.getUserById(userId)
  const email = data?.user?.email
  if (!email) return

  const { data: profile } = await sb.from('profiles').select('name').eq('id', userId).single()
  const firstName = (profile?.name || 'cinéfilo').split(' ')[0]

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '¿Por qué te vas? Tenemos algo para ti ✦',
    text: `Hola ${firstName},\n\nHemos visto que has cancelado tu suscripción Premium.\n\nSi ha sido por el precio, tenemos una oferta especial para ti: 1 mes gratis si vuelves ahora.\n\nActivar: ${APP_URL}?upgrade=1\n\n¿Ha sido por otra razón? Responde a este email y te ayudamos.\n\n— Zine Club`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#09090B;">
    <tr><td align="center" style="padding:40px 16px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:500px;">
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;">
            <tr>
              <td style="padding-bottom:20px;"><span style="font-size:22px;font-weight:800;color:#fff;">Zine<span style="color:#C9A96E;"> Club</span></span></td>
              <td align="right" style="padding-bottom:20px;"><span style="color:#C9A96E;">✦</span></td>
            </tr>
            <tr><td colspan="2" style="height:1px;background:rgba(201,169,110,0.25);"></td></tr>
          </table>
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C9A96E;font-weight:600;">Te echamos de menos</p>
          <h1 style="margin:0 0 20px;font-size:30px;font-weight:800;line-height:1.15;color:#fff;">${firstName},<br>¿por qué te vas?</h1>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.55);">
            Hemos visto que has cancelado Premium. Si ha sido por el precio, tenemos algo para ti.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;background:rgba(201,169,110,0.07);border-radius:12px;border:1px solid rgba(201,169,110,0.2);">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#C9A96E;">1 mes gratis</p>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.6;">Si vuelves ahora, te regalamos el primer mes. Sin compromiso, cancela cuando quieras.</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
            <tr><td align="center">
              <a href="${APP_URL}?upgrade=1" style="display:inline-block;background:#C9A96E;color:#09090B;font-weight:800;font-size:16px;padding:16px 36px;border-radius:12px;text-decoration:none;">
                Volver a Premium &nbsp;✦
              </a>
            </td></tr>
          </table>
          <p style="margin:0;text-align:center;font-size:14px;color:rgba(255,255,255,0.35);">¿Ha sido por otra razón? Responde a este email y te ayudamos.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr><td style="height:1px;background:rgba(255,255,255,0.07);"></td></tr>
            <tr><td style="padding-top:24px;"><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">Para los que de verdad aman el cine.<br><a href="${APP_URL}" style="color:rgba(201,169,110,0.5);text-decoration:none;">zineclub.io</a></p></td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  let event

  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    if (userId) {
      await sb.from('profiles').update({ is_pro: true }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const userId = subscription.metadata?.userId
    if (userId) {
      await sb.from('profiles').update({ is_pro: false }).eq('id', userId)
      await sendRetentionEmail(userId).catch(e => console.error('retention email error:', e.message))
    }
  }

  res.json({ received: true })
}
