'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 20 },
  row: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 5 },
  col: { flex: 1, fontSize: 10 }
})

const ReceiptPDF = ({ transaccion, condominio }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Recibo de {transaccion.type === 'income' ? 'Ingreso' : 'Egreso'}</Text>
      <View style={styles.row}>
        <Text style={styles.col}>Condominio:</Text>
        <Text style={styles.col}>{condominio?.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.col}>Fecha:</Text>
        <Text style={styles.col}>{new Date(transaccion.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.col}>Categorí­a:</Text>
        <Text style={styles.col}>{transaccion.category}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.col}>Monto:</Text>
        <Text style={styles.col}>S/ {transaccion.amount.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.col}>Descripción:</Text>
        <Text style={styles.col}>{transaccion.description}</Text>
      </View>
    </Page>
  </Document>
)

export function ReportesTab({ condominioId }: { condominioId: string }) {
  const [transacciones, setTransacciones] = useState<any[]>([])
  const [condominio, setCondominio] = useState<any>(null)
  const [selectedId, setSelectedId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: cond } = await supabase.from('condominios').select('*').eq('id', condominioId).single()
      setCondominio(cond)
      const { data: trans } = await supabase.from('transacciones').select('*').eq('condominio_id', condominioId).order('date', { ascending: false })
      if (trans) setTransacciones(trans)
    }
    fetchData()
  }, [])

  const selectedTrans = transacciones.find(t => t.id === selectedId)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Generar Recibo</h2>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Seleccionar movimiento</label>
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">-- Elige un movimiento --</option>
            {transacciones.map((t) => (
              <option key={t.id} value={t.id}>
                {new Date(t.date).toLocaleDateString()} - {t.category} - S/ {t.amount.toFixed(2)}
              </option>
            ))}
          </Select>
        </div>
        {selectedId && (
  <PDFDownloadLink
    document={<ReceiptPDF transaccion={selectedTrans} condominio={condominio} />}
    fileName={`recibo_${selectedId}.pdf`}
  >
    {({ loading }) => (
      <Button disabled={loading}>{loading ? 'Generando...' : 'Descargar PDF'}</Button>
    )}
  </PDFDownloadLink>
)}
      </div>
    </div>
  )
}
