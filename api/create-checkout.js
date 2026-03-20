import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, email } = req.body || {}
  if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId },
      },
      metadata: { userId },
      success_url: `${process.env.APP_URL || 'https://zineclub.vercel.app'}/?pro=1`,
      cancel_url:  `${process.env.APP_URL || 'https://zineclub.vercel.app'}/`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout error:', err)
    res.status(500).json({ error: err.message })
  }
}
