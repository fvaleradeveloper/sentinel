import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CondominioList } from '@/components/CondominioList'
import { PlanLimits } from '@/components/PlanLimits'

export default async function Dashboard({ params }: { params: { webappSlug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: webapp } = await supabase
    .from('webapps')
    .select('id')
    .eq('slug', params.webappSlug)
    .single()
  if (!webapp) redirect('/')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .eq('webapp_id', webapp.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return redirect(`/${params.webappSlug}`)
  }

  const limits: Record<string, number> = { mini: 3, start: 5, pro: 12, max: 999999 }
  const maxCondominios = limits[subscription.plan]
  const { count: currentCondominios } = await supabase
    .from('condominios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const canAddMore = (currentCondominios ?? 0) < maxCondominios

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Mis Condominios</h1>
      <p className="text-gray-600 mb-6">
        Plan: {subscription.plan} | Condominios: {currentCondominios} / {maxCondominios === 999999 ? '∞' : maxCondominios}
      </p>
      <CondominioList webappSlug={params.webappSlug} canAddMore={canAddMore} />
      <PlanLimits currentPlan={subscription.plan} />
    </div>
  )
}