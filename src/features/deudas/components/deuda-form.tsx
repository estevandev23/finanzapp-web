'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import type { DeudaRequest, TipoDeuda } from '../types'

interface DeudaFormProps {
  onSubmit: (data: DeudaRequest) => Promise<void>
  initialData?: Partial<DeudaRequest>
  isLoading?: boolean
  onCancel?: () => void
}

export function DeudaForm({ onSubmit, initialData, isLoading, onCancel }: DeudaFormProps) {
  const [tipo, setTipo] = useState<TipoDeuda>(initialData?.tipo || 'DEUDA')
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '')
  const [entidad, setEntidad] = useState(initialData?.entidad || '')
  const [montoTotal, setMontoTotal] = useState(initialData?.montoTotal?.toString() || '')
  const [fechaInicio, setFechaInicio] = useState(initialData?.fechaInicio || '')
  const [fechaLimite, setFechaLimite] = useState(initialData?.fechaLimite || '')

  const montoNumerico = Number(montoTotal) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      tipo,
      descripcion,
      entidad: entidad || undefined,
      montoTotal: montoNumerico,
      fechaInicio: fechaInicio || undefined,
      fechaLimite: fechaLimite || undefined,
    })
  }

  const entidadLabel = tipo === 'DEUDA' ? 'A quien le debo' : 'A quien le preste'
  const descripcionPlaceholder = tipo === 'DEUDA'
    ? 'Ej: Prestamo bancario, tarjeta de credito...'
    : 'Ej: Prestamo a Juan para emergencia...'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v as TipoDeuda)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEUDA">Deuda - Dinero que debo</SelectItem>
            <SelectItem value="PRESTAMO">Prestamo - Dinero que me deben</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripcion</Label>
        <Input
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder={descripcionPlaceholder}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entidad">{entidadLabel}</Label>
        <Input
          id="entidad"
          value={entidad}
          onChange={(e) => setEntidad(e.target.value)}
          placeholder="Nombre de la persona o entidad"
        />
      </div>

      <div className="space-y-2">
        <Label>Monto total</Label>
        <CurrencyInput id="monto-deuda" value={montoTotal} onChange={setMontoTotal} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha inicio</Label>
          <DatePicker value={fechaInicio} onChange={setFechaInicio} />
        </div>
        <div className="space-y-2">
          <Label>Fecha limite</Label>
          <DatePicker value={fechaLimite} onChange={setFechaLimite} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !descripcion || montoNumerico <= 0} className="flex-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
