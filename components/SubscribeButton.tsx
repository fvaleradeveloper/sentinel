'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscribeButton({ webappId, webappSlug }: { webappId: string; webappSlug: string }) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'mini'|'start'|'pro'|'max'>('mini')

  const handleSubscribe = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = /login?redirect=/
      return
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webappId, plan: selectedPlan, userId: user.id })
    })
    const { sessionId } = await response.json()
    const stripe = await stripePromise
    await stripe?.redirectToCheckout({ sessionId })
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedPlan}
        onChange={(e) => setSelectedPlan(e.target.value as any)}
        className="w-32"
      >
        <option value="mini">Mini (S/40)</option>
        <option value="start">Start (S/50)</option>
        <option value="pro">Pro (S/70)</option>
        <option value="max">Max (S/90)</option>
      </Select>
      <Button onClick={handleSubscribe} disabled={loading}>
        {loading ? 'Procesando...' : 'Suscribirse'}
      </Button>
    </div>
  )
}
