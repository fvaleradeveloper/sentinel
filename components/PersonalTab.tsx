'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface Personal {
  id: string
  name: string
  role: string
  phone: string
}

export function PersonalTab({ condominioId }: { condominioId: string }) {
  const [personal, setPersonal] = useState<Personal[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const fetchPersonal = async () => {
    const { data, error } = await supabase
      .from('personal')
      .select('id, name, role, phone')
      .eq('condominio_id', condominioId)
    if (!error && data) setPersonal(data)
  }

  useEffect(() => {
    fetchPersonal()
  }, [])

  const addPersonal = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('personal')
      .insert({
        condominio_id: condominioId,
        name: newName,
        role: newRole,
        phone: newPhone
      })
    if (!error) {
      await fetchPersonal()
      setIsModalOpen(false)
      setNewName('')
      setNewRole('')
      setNewPhone('')
    } else {
      alert('Error al agregar personal')
    }
    setLoading(false)
  }

  const deletePersonal = async (id: string) => {
    if (confirm('Â¿Eliminar este trabajador?')) {
      await supabase.from('personal').delete().eq('id', id)
      await fetchPersonal()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Personal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Agregar</Button>
      </div>
      {personal.length === 0 && <p>No hay personal registrado.</p>}
      <div className="space-y-2">
        {personal.map((p) => (
          <div key={p.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.role} | {p.phone}</div>
            </div>
            <Button variant="ghost" onClick={() => deletePersonal(p.id)}>Eliminar</Button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Trabajador">
        <div className="space-y-4">
          <Input placeholder="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Cargo" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
          <Input placeholder="TelÃ©fono" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={addPersonal} disabled={loading}>{loading ? 'Agregando...' : 'Agregar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
