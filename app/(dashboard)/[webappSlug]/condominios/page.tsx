import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Tabs } from '@/components/ui/Tabs'
import { PersonalTab } from '@/components/PersonalTab'
import { FinanzasTab } from '@/components/FinanzasTab'
import { ReportesTab } from '@/components/ReportesTab'

export default async function CondominioDetail({
  params,
}: {
  params: Promise<{ webappSlug: string; id: string }>
}) {
  const { webappSlug, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que el condominio pertenece al usuario
  const { data: condominio, error } = await supabase
    .from('condominios')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error || !condominio) notFound()

  const tabs = [
    {
      id: 'personal',
      label: 'Personal',
      content: <PersonalTab condominioId={id} />
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      content: <FinanzasTab condominioId={id} />
    },
    {
      id: 'reportes',
      label: 'Reportes',
      content: <ReportesTab condominioId={id} />
    }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{condominio.name}</h1>
      <Tabs tabs={tabs} defaultTab="personal" />
    </div>
  )
}