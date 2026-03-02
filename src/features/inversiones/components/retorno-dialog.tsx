'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import type { RegistrarRetornoRequest } from '../types'

interface RetornoDialogProps {
  montoInvertido: number
  onSubmit: (data: RegistrarRetornoRequest) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function RetornoDialog({ montoInvertido, onSubmit, isLoading, onCancel }: RetornoDialogProps) {
  const [retornoReal, setRetornoReal] = useState('')
  const [fechaRetorno, setFechaRetorno] = useState('')

  const retornoNumerico = Number(retornoReal) || 0
  const ganancia = retornoNumerico - montoInvertido
  const esGanancia = ganancia >= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      retornoReal: retornoNumerico,
      fechaRetorno: fechaRetorno || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Retorno real obtenido</Label>
        <CurrencyInput id="retorno-real" value={retornoReal} onChange={setRetornoReal} />
      </div>

      {retornoNumerico > 0 && (
        <div className={`rounded-md px-4 py-3 text-sm ${esGanancia ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
          {esGanancia
            ? `Ganancia estimada: +$${ganancia.toLocaleString('es-CO')}`
            : `Pérdida estimada: -$${Math.abs(ganancia).toLocaleString('es-CO')}`}
        </div>
      )}

      <div className="space-y-2">
        <Label>Fecha del retorno</Label>
        <DatePicker value={fechaRetorno} onChange={setFechaRetorno} />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || retornoNumerico <= 0} className="flex-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Registrar retorno
        </Button>
      </div>
    </form>
  )
}
