'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

interface User {
  id: string
  email: string
  full_name: string
  subscription?: {
    id: string
    plan: string
    status: string
  }
}

export function AdminPanel({ webappId }: { webappId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchUsers = async () => {
    // Obtener todos los perfiles de usuarios que tienen suscripciÃ³n a esta webapp
    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('user_id, plan, status, id')
      .eq('webapp_id', webappId)
    if (error) return

    const userIds = subs.map(s => s.user_id)
    if (userIds.length === 0) {
      setUsers([])
      return
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const userMap = new Map(authUsers?.users.map(u => [u.id, u.email]) || [])

    const combined = subs.map(sub => {
      const profile = profiles?.find(p => p.id === sub.user_id)
      const email = userMap.get(sub.user_id) || ''
      return {
        id: sub.user_id,
        email,
        full_name: profile?.full_name || '',
        subscription: { id: sub.id, plan: sub.plan, status: sub.status }
      }
    })
    setUsers(combined)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateSubscription = async (userId: string, newPlan: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan: newPlan })
      .eq('user_id', userId)
      .eq('webapp_id', webappId)
    if (!error) {
      await fetchUsers()
    } else {
      alert('Error al actualizar')
    }
    setLoading(false)
  }

  const cancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Â¿Cancelar la suscripciÃ³n? (el usuario perderÃ¡ acceso)')) return
    setLoading(true)
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', subscriptionId)
    if (!error) {
      await fetchUsers()
    } else {
      alert('Error al cancelar')
    }
    setLoading(false)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Usuario</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Plan</th>
            <th className="border px-4 py-2">Estado</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.full_name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                <Select
                  value={user.subscription?.plan}
                  onChange={(e) => updateSubscription(user.id, e.target.value)}
                  disabled={loading}
                >
                  <option value="mini">Mini</option>
                  <option value="start">Start</option>
                  <option value="pro">Pro</option>
                  <option value="max">Max</option>
                </Select>
              </td>
              <td className="border px-4 py-2 capitalize">{user.subscription?.status}</td>
              <td className="border px-4 py-2">
                {user.subscription?.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={() => cancelSubscription(user.subscription!.id)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
