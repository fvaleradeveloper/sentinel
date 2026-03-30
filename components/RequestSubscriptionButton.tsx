'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'

export function RequestSubscriptionButton({ webappId, webappSlug }: { webappId: string; webappSlug: string }) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'mini'|'start'|'pro'|'max'>('mini')
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')

  const handleRequest = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = `/login?redirect=/${webappSlug}`
      return
    }

    // Verificar si ya tiene una solicitud pendiente
    const { data: existing } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('webapp_id', webappId)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      setMessage('Ya tienes una solicitud pendiente. Espera la aprobación del administrador.')
      setLoading(false)
      return
    }

    // Crear solicitud
    const { error } = await supabase
      .from('subscription_requests')
      .insert({
        user_id: user.id,
        webapp_id: webappId,
        plan: selectedPlan,
        status: 'pending'
      })

    if (error) {
      setMessage('Error al enviar la solicitud. Intenta de nuevo.')
    } else {
      setMessage('Solicitud enviada. El administrador se pondrá en contacto para coordinar el pago y activar tu suscripción.')
      setShowModal(false)
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Solicitar suscripción</Button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Solicitar suscripción">
        <div className="space-y-4">
          <Select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value as any)}>
            <option value="mini">Mini (S/40/mes) – hasta 3 condominios</option>
            <option value="start">Start (S/50/mes) – hasta 5 condominios</option>
            <option value="pro">Pro (S/70/mes) – hasta 12 condominios</option>
            <option value="max">Max (S/90/mes) – ilimitado</option>
          </Select>
          <div className="text-sm text-gray-600">
            <p>Una vez enviada la solicitud, recibirás instrucciones de pago por correo.</p>
            <p>El administrador activará tu cuenta después de confirmar el pago.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleRequest} disabled={loading}>
              {loading ? 'Enviando...' : 'Solicitar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}