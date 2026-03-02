'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { DispositivoRequest } from '../types'

interface DispositivoFormProps {
  onSubmit: (data: DispositivoRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DispositivoForm({ onSubmit, onCancel, isLoading }: DispositivoFormProps) {
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('')
  const [nombreDispositivo, setNombreDispositivo] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!numeroWhatsapp.trim()) {
      setError('El numero de WhatsApp es obligatorio')
      return
    }

    const data: DispositivoRequest = {
      numeroWhatsapp: numeroWhatsapp.trim(),
      nombreDispositivo: nombreDispositivo.trim() || undefined,
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="numeroWhatsapp">Numero de WhatsApp *</Label>
        <Input
          id="numeroWhatsapp"
          placeholder="Ej: 573001234567"
          value={numeroWhatsapp}
          onChange={(e) => setNumeroWhatsapp(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Incluye el codigo de pais sin el signo +
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombreDispositivo">Nombre del dispositivo</Label>
        <Input
          id="nombreDispositivo"
          placeholder="Ej: Mi celular personal"
          value={nombreDispositivo}
          onChange={(e) => setNombreDispositivo(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          Vincular
        </Button>
      </div>
    </form>
  )
}
