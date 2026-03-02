'use client'

import { useState, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import type { Ahorro, AhorroRequest } from '../types'
import type { MetaFinanciera } from '@/features/metas/types'

interface AhorroFormProps {
  onSubmit: (data: AhorroRequest) => Promise<void>
  onCancel: () => void
  initialData?: Ahorro
  isLoading?: boolean
  metas: MetaFinanciera[]
}

const SIN_META = '__none__'

export function AhorroForm({ onSubmit, onCancel, initialData, isLoading, metas }: AhorroFormProps) {
  const [monto, setMonto] = useState(initialData?.monto?.toString() ?? '')
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '')
  const [fecha, setFecha] = useState(initialData?.fecha ?? '')
  const [metaId, setMetaId] = useState(initialData?.metaId ?? SIN_META)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    const data: AhorroRequest = {
      monto: montoNum,
      descripcion: descripcion.trim() || undefined,
      fecha: fecha || undefined,
      metaId: metaId !== SIN_META ? metaId : undefined,
    }

    await onSubmit(data)
  }

  const metasActivas = metas.filter((m) => m.estado === 'ACTIVA')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CurrencyInput
        id="monto"
        label="Monto *"
        value={monto}
        onChange={setMonto}
        placeholder="0"
        required
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripcion</Label>
        <Textarea
          id="descripcion"
          placeholder="Descripcion opcional"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <DatePicker
        id="fecha"
        label="Fecha"
        value={fecha}
        onChange={setFecha}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Label htmlFor="metaId">Meta asociada</Label>
        <Select value={metaId} onValueChange={setMetaId} disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sin meta asociada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_META}>Sin meta asociada</SelectItem>
            {metasActivas.map((meta) => (
              <SelectItem key={meta.id} value={meta.id}>
                {meta.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          {initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
