'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import type { MetaFinanciera, MetaFinancieraRequest } from '../types'

interface MetaFormProps {
  onSubmit: (data: MetaFinancieraRequest) => Promise<void>
  onCancel: () => void
  initialData?: MetaFinanciera
  isLoading?: boolean
}

export function MetaForm({ onSubmit, onCancel, initialData, isLoading }: MetaFormProps) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '')
  const [montoObjetivo, setMontoObjetivo] = useState(initialData?.montoObjetivo?.toString() ?? '')
  const [fechaLimite, setFechaLimite] = useState(initialData?.fechaLimite ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    const montoNum = parseFloat(montoObjetivo)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto objetivo debe ser mayor a 0')
      return
    }

    const data: MetaFinancieraRequest = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      montoObjetivo: montoNum,
      fechaLimite: fechaLimite || undefined,
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          placeholder="Ej: Fondo de emergencia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

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

      <CurrencyInput
        id="montoObjetivo"
        label="Monto objetivo *"
        value={montoObjetivo}
        onChange={setMontoObjetivo}
        placeholder="0"
        required
        disabled={isLoading}
      />

      <DatePicker
        id="fechaLimite"
        label="Fecha limite"
        value={fechaLimite}
        onChange={setFechaLimite}
        disabled={isLoading}
      />

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
