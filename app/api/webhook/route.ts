import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { userId, webappId, plan } = session.metadata!
      await supabase.from('subscriptions').insert({
        user_id: userId,
        webapp_id: webappId,
        plan,
        status: 'active',
        stripe_subscription_id: session.subscription,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscription.id)
      break
    }
  }
  return NextResponse.json({ received: true })
}
