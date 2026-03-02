'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
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
import type { Dispositivo } from '../types'

interface VerificacionDialogProps {
  dispositivo: Dispositivo
  open: boolean
  onClose: () => void
  onVerify: (numeroWhatsapp: string, codigo: string) => Promise<void>
}

export function VerificacionDialog({ dispositivo, open, onClose, onVerify }: VerificacionDialogProps) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const codigoLimpio = codigo.trim()
    if (codigoLimpio.length !== 6 || !/^\d{6}$/.test(codigoLimpio)) {
      setError('El codigo debe tener exactamente 6 digitos')
      return
    }

    setIsLoading(true)
    try {
      await onVerify(dispositivo.numeroWhatsapp, codigoLimpio)
      setCodigo('')
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setCodigo('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar dispositivo</DialogTitle>
          <DialogDescription>
            Ingresa el codigo de 6 digitos enviado al numero {dispositivo.numeroWhatsapp}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo-otp">Codigo de verificacion *</Label>
            <Input
              id="codigo-otp"
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              required
              disabled={isLoading}
              autoComplete="one-time-code"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Verificar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
