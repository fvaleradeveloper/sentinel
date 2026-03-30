import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'

export async function POST(req: Request) {
  const { webappId, plan, userId } = await req.json()

  const prices: Record<string, number> = {
    mini: 4000,
    start: 5000,
    pro: 7000,
    max: 9000
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'pen',
          product_data: { name: SuscripciÃ³n Sentinel - Plan  },
          unit_amount: prices[plan],
          recurring: { interval: 'month' }
        },
        quantity: 1
      }
    ],
    success_url: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/?success=true,
    cancel_url: ${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true,
    metadata: { webappId, plan, userId }
  })

  return NextResponse.json({ sessionId: session.id })
}
