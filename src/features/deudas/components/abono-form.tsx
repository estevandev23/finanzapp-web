'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/shared/components/currency-input'
import { MetodoPagoIcon } from '@/shared/components/payment-icons'
import { formatCurrency } from '@/shared/lib/formatters'
import { METODOS_PAGO } from '@/shared/types'
import type { AbonoRequest } from '../types'

interface AbonoFormProps {
  onSubmit: (data: AbonoRequest) => Promise<void>
  montoRestante: number
  isLoading?: boolean
  onCancel?: () => void
}

export function AbonoForm({ onSubmit, montoRestante, isLoading, onCancel }: AbonoFormProps) {
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [metodoPago, setMetodoPago] = useState('')

  const montoNumerico = Number(monto) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      monto: montoNumerico,
      descripcion: descripcion || undefined,
      metodoPago,
    })
    setMonto('')
    setDescripcion('')
    setMetodoPago('')
  }

  const excedeMonto = montoNumerico > montoRestante

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md bg-muted p-3 text-sm">
        Monto pendiente: <span className="font-semibold">{formatCurrency(montoRestante)}</span>
      </div>

      <div className="space-y-2">
        <Label>Monto del abono</Label>
        <CurrencyInput id="monto-abono" value={monto} onChange={setMonto} />
        {excedeMonto && (
          <p className="text-sm text-destructive">
            El abono no puede superar el monto restante
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Método de pago</Label>
        <div className="grid grid-cols-4 gap-2">
          {METODOS_PAGO.map((mp) => (
            <button
              key={mp.value}
              type="button"
              onClick={() => setMetodoPago(mp.value)}
              disabled={isLoading}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                metodoPago === mp.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <MetodoPagoIcon metodo={mp.value} size={20} />
              {mp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion-abono">Descripcion (opcional)</Label>
        <Input
          id="descripcion-abono"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Pago mensual, abono parcial..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || montoNumerico <= 0 || excedeMonto || !metodoPago} className="flex-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Registrar abono
        </Button>
      </div>
    </form>
  )
}
