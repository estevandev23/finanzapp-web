'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { sileo } from 'sileo'
import { perfilService } from '@/features/perfil/services/perfil.service'
import { ProfileForm } from '@/features/perfil/components/profile-form'
import { PasswordForm } from '@/features/perfil/components/password-form'
import { SecuritySettings } from '@/features/perfil/components/security-settings'
import type { UsuarioProfile, UsuarioUpdateRequest } from '@/features/perfil/types'

export default function PerfilPage() {
  const [profile, setProfile] = useState<UsuarioProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const cargarPerfil = useCallback(async () => {
    try {
      const res = await perfilService.obtenerPerfil()
      setProfile(res.data)
    } catch {
      sileo.error({ title: 'Error al cargar el perfil' })
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    cargarPerfil()
  }, [cargarPerfil])

  async function handleUpdateProfile(data: UsuarioUpdateRequest) {
    setIsSavingProfile(true)
    try {
      const res = await perfilService.actualizarPerfil(data)
      setProfile(res.data)
      sileo.success({ title: 'Perfil actualizado correctamente' })
    } catch {
      sileo.error({ title: 'Error al actualizar el perfil' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleChangePassword(passwordActual: string, nuevaPassword: string) {
    setIsSavingPassword(true)
    try {
      await perfilService.cambiarPassword({ passwordActual, nuevaPassword })
      sileo.success({ title: 'Contrasena actualizada correctamente' })
    } catch {
      sileo.error({ title: 'Error al cambiar la contrasena', description: 'Verifica que la contrasena actual sea correcta' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!profile) {
    return <p className="text-muted-foreground">No se pudo cargar el perfil</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground">Administra tu informacion personal y seguridad</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacion personal</CardTitle>
          <CardDescription>Actualiza tu nombre y telefono</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={profile}
            onSubmit={handleUpdateProfile}
            isLoading={isSavingProfile}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Configura la autenticacion en dos pasos y la verificacion de telefono</CardDescription>
        </CardHeader>
        <CardContent>
          <SecuritySettings
            profile={profile}
            onProfileUpdate={setProfile}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contrasena</CardTitle>
          <CardDescription>Asegurate de usar una contrasena segura</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm
            onSubmit={handleChangePassword}
            isLoading={isSavingPassword}
          />
        </CardContent>
      </Card>
    </div>
  )
}
