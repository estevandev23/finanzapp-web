'use client'

import { useState, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/formatters'
import { CurrencyInput } from '@/shared/components/currency-input'
import type { MetaFinanciera } from '../types'

interface ProgresoDialogProps {
  meta: MetaFinanciera
  open: boolean
  onClose: () => void
  onSubmit: (metaId: string, monto: number) => Promise<void>
}

export function ProgresoDialog({ meta, open, onClose, onSubmit }: ProgresoDialogProps) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const restante = Math.max(meta.montoObjetivo - meta.montoActual, 0)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    if (montoNum > restante) {
      setError(`El monto no puede superar el restante (${formatCurrency(restante)})`)
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(meta.id, montoNum)
      setMonto('')
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setMonto('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar progreso</DialogTitle>
          <DialogDescription>
            Agrega un monto al progreso de la meta &quot;{meta.nombre}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progreso actual</span>
            <span className="font-medium text-green-700 dark:text-green-400">
              {formatCurrency(meta.montoActual)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto objetivo</span>
            <span className="font-medium">{formatCurrency(meta.montoObjetivo)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Restante</span>
            <span className="font-semibold">{formatCurrency(restante)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CurrencyInput
            id="progreso-monto"
            label="Monto a agregar *"
            value={monto}
            onChange={setMonto}
            placeholder="0"
            required
            disabled={isLoading}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
