'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { PhoneInput } from '@/shared/components/phone-input'
import type { UsuarioProfile, UsuarioUpdateRequest } from '../types'

interface ProfileFormProps {
  profile: UsuarioProfile
  onSubmit: (data: UsuarioUpdateRequest) => Promise<void>
  isLoading?: boolean
}

export function ProfileForm({ profile, onSubmit, isLoading }: ProfileFormProps) {
  const [nombre, setNombre] = useState(profile.nombre)
  const [telefono, setTelefono] = useState(profile.telefono ?? '')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electronico</Label>
        <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">El correo no se puede modificar</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={isLoading}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Telefono</Label>
        <PhoneInput
          id="telefono"
          value={telefono}
          onChange={setTelefono}
          disabled={isLoading}
          placeholder="3001234567"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  )
}
