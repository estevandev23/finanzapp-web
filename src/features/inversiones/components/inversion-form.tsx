'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import type { InversionRequest } from '../types'

interface InversionFormProps {
  onSubmit: (data: InversionRequest) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function InversionForm({ onSubmit, isLoading, onCancel }: InversionFormProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [retornoEsperado, setRetornoEsperado] = useState('')
  const [fechaInversion, setFechaInversion] = useState('')

  const montoNumerico = Number(monto) || 0
  const retornoNumerico = Number(retornoEsperado) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      nombre,
      descripcion: descripcion || undefined,
      monto: montoNumerico,
      retornoEsperado: retornoNumerico > 0 ? retornoNumerico : undefined,
      fechaInversion: fechaInversion || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la inversión</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Acciones Tesla, CDT Bancolombia, Cripto..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles adicionales sobre la inversión"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Monto invertido</Label>
        <CurrencyInput id="monto-inversion" value={monto} onChange={setMonto} />
      </div>

      <div className="space-y-2">
        <Label>Retorno esperado (opcional)</Label>
        <CurrencyInput id="retorno-esperado" value={retornoEsperado} onChange={setRetornoEsperado} />
        <p className="text-xs text-muted-foreground">Solo informativo, no afecta el balance</p>
      </div>

      <div className="space-y-2">
        <Label>Fecha de inversión</Label>
        <DatePicker value={fechaInversion} onChange={setFechaInversion} />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !nombre || montoNumerico <= 0} className="flex-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Registrar inversión
        </Button>
      </div>
    </form>
  )
}
