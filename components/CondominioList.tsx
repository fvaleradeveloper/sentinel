'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'

interface Condominio {
  id: string
  name: string
  address: string
}

interface CondominioListProps {
  webappSlug: string
  canAddMore: boolean
}

export function CondominioList({ webappSlug, canAddMore }: CondominioListProps) {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const fetchCondominios = async () => {
    const { data, error } = await supabase
      .from('condominios')
      .select('id, name, address')
      .order('created_at', { ascending: false })
    if (!error && data) setCondominios(data)
  }

  useEffect(() => {
    fetchCondominios()
  }, [])

  const createCondominio = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('condominios')
      .insert({ name: newName, address: newAddress })
    if (!error) {
      await fetchCondominios()
      setIsModalOpen(false)
      setNewName('')
      setNewAddress('')
    } else {
      alert('Error al crear condominio')
    }
    setLoading(false)
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mis Condominios</h2>
        {canAddMore && (
          <Button onClick={() => setIsModalOpen(true)}>Nuevo Condominio</Button>
        )}
      </div>
      {condominios.length === 0 && (
        <p className="text-gray-500">No tienes condominios registrados.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {condominios.map((cond) => (
          <Link
            key={cond.id}
            href={`/dashboard/${webappSlug}/condominios/${cond.id}`}
            className="block p-4 border rounded-lg hover:shadow-md transition"
          >
            <h3 className="font-bold">{cond.name}</h3>
            <p className="text-sm text-gray-600">{cond.address || 'Sin dirección'}</p>
          </Link>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Condominio">
        <div className="space-y-4">
          <Input
            placeholder="Nombre del condominio"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="Dirección (opcional)"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={createCondominio} disabled={loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}