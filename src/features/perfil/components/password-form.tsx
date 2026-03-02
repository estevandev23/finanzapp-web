'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PasswordFormProps {
  onSubmit: (passwordActual: string, nuevaPassword: string) => Promise<void>
  isLoading?: boolean
}

export function PasswordForm({ onSubmit, isLoading }: PasswordFormProps) {
  const [passwordActual, setPasswordActual] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (nuevaPassword.length < 6) {
      setError('La nueva contrasena debe tener al menos 6 caracteres')
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contrasenas no coinciden')
      return
    }

    await onSubmit(passwordActual, nuevaPassword)
    setPasswordActual('')
    setNuevaPassword('')
    setConfirmarPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="passwordActual">Contrasena actual</Label>
        <Input
          id="passwordActual"
          type="password"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nuevaPassword">Nueva contrasena</Label>
        <Input
          id="nuevaPassword"
          type="password"
          value={nuevaPassword}
          onChange={(e) => setNuevaPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmarPassword">Confirmar nueva contrasena</Label>
        <Input
          id="confirmarPassword"
          type="password"
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cambiar contrasena
      </Button>
    </form>
  )
}
