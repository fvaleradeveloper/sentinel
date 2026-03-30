'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Transaccion {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  description: string
}

export function FinanzasTab({ condominioId }: { condominioId: string }) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchTransacciones = async () => {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('condominio_id', condominioId)
      .order('date', { ascending: false })
    if (!error && data) setTransacciones(data)
  }

  useEffect(() => {
    fetchTransacciones()
  }, [])

  const addTransaccion = async () => {
    if (!form.category || !form.amount) return
    setLoading(true)
    const { error } = await supabase
      .from('transacciones')
      .insert({
        condominio_id: condominioId,
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        date: form.date,
        description: form.description
      })
    if (!error) {
      await fetchTransacciones()
      setIsModalOpen(false)
      setForm({ type: 'income', category: '', amount: '', date: new Date().toISOString().slice(0, 10), description: '' })
    } else {
      alert('Error al registrar')
    }
    setLoading(false)
  }

  const totalIngresos = transacciones.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalEgresos = transacciones.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIngresos - totalEgresos

  // Datos para grÃ¡fico mensual
  const last6Months = () => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push(d.toLocaleString('default', { month: 'short' }))
    }
    return months
  }
  const monthNames = last6Months()
  const monthlyData = monthNames.map((month, idx) => {
    const monthIndex = new Date().getMonth() - (5 - idx)
    const year = new Date().getFullYear()
    const start = new Date(year, monthIndex, 1)
    const end = new Date(year, monthIndex + 1, 0)
    const filtered = transacciones.filter(t => {
      const d = new Date(t.date)
      return d >= start && d <= end
    })
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense }
  })

  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Ingresos',
        data: monthlyData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Egresos',
        data: monthlyData.map(d => d.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      }
    ]
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Movimientos Financieros</h2>
        <Button onClick={() => setIsModalOpen(true)}>Nuevo Movimiento</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <div className="text-sm text-green-800">Total Ingresos</div>
          <div className="text-2xl font-bold">S/ {totalIngresos.toFixed(2)}</div>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <div className="text-sm text-red-800">Total Egresos</div>
          <div className="text-2xl font-bold">S/ {totalEgresos.toFixed(2)}</div>
        </div>
        <div className={p-4 rounded }>
          <div className="text-sm">Balance</div>
          <div className="text-2xl font-bold">S/ {balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-8">
        <Line data={chartData} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Fecha</th>
              <th className="border px-4 py-2">Tipo</th>
              <th className="border px-4 py-2">CategorÃ­a</th>
              <th className="border px-4 py-2">Monto</th>
              <th className="border px-4 py-2">DescripciÃ³n</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t) => (
              <tr key={t.id}>
                <td className="border px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="border px-4 py-2 capitalize">{t.type === 'income' ? 'Ingreso' : 'Egreso'}</td>
                <td className="border px-4 py-2">{t.category}</td>
                <td className="border px-4 py-2">S/ {t.amount.toFixed(2)}</td>
                <td className="border px-4 py-2">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Movimiento">
        <div className="space-y-4">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
            <option value="income">Ingreso</option>
            <option value="expense">Egreso</option>
          </Select>
          <Input placeholder="CategorÃ­a" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Monto" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="DescripciÃ³n" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={addTransaccion} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
