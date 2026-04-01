'use client'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RequestSubscriptionButton } from '@/components/RequestSubscriptionButton'
import { PlanLimits } from '@/components/PlanLimits'

export default async function WebappLanding({ params }: { params: Promise<{ webappSlug: string }> }) {
  const { webappSlug } = await params
  const supabase = await createClient()
  const { data: webapp, error } = await supabase
    .from('webapps')
    .select('*')
    .eq('slug', webappSlug)
    .single()
  if (error || !webapp) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let hasActiveSub = false
  let currentPlan = ''
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .eq('webapp_id', webapp.id)
      .eq('status', 'active')
      .maybeSingle()
    hasActiveSub = !!sub
    currentPlan = sub?.plan || ''
  }

  const priceInfo = webapp.price_info as Record<string, number>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="aspect-video mb-6">
        <iframe
          src={webapp.video_url}
          className="w-full h-full rounded-lg"
          title={webapp.name}
        />
      </div>
      <h1 className="text-3xl font-bold mb-4">{webapp.name}</h1>
      <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: webapp.description }} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(priceInfo).map(([plan, price]) => (
          <div key={plan} className="border p-3 rounded text-center">
            <div className="font-bold capitalize">{plan}</div>
            <div>S/ {price} / mes</div>
          </div>
        ))}
      </div>

      {hasActiveSub ? (
        <Link
          href={`/dashboard/${webappSlug}`}
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
        >
          Ir a mi cuenta
        </Link>
      ) : (
        <RequestSubscriptionButton webappId={webapp.id} webappSlug={webappSlug} />
      )}

      {hasActiveSub && (
        <PlanLimits currentPlan={currentPlan} />
      )}

      <div className="mt-12 text-right text-xs text-gray-400">
        <Link href={`/admin/${webappSlug}`}>Acceso administrador</Link>
      </div>
    </div>
  )
}