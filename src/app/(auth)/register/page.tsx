'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, PiggyBank } from 'lucide-react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { PhoneInput } from '@/shared/components/phone-input'
import { PasswordInput } from '@/features/auth/components/password-input'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      sileo.error({ title: 'La contrasena debe tener al menos 8 caracteres.' })
      return
    }

    if (password !== confirmPassword) {
      sileo.error({ title: 'Las contrasenas no coinciden.' })
      return
    }

    const telefonoLimpio = telefono.replace(/\s/g, '')
    if (telefonoLimpio.length < 7 || telefonoLimpio.length > 20) {
      sileo.error({ title: 'El telefono no es valido.' })
      return
    }

    setIsSubmitting(true)

    try {
      await register({ nombre, email, password, telefono: telefonoLimpio })
      router.push('/dashboard')
    } catch {
      sileo.error({ title: 'No se pudo crear la cuenta', description: 'Intenta nuevamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PiggyBank className="h-4 w-4" />
        </div>
        <span className="font-bold text-foreground">FinanzApp</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Crear cuenta</h1>
        <p className="mt-2 text-muted-foreground">Registrate para comenzar a gestionar tus finanzas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            type="text"
            placeholder="Tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electronico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Telefono</Label>
          <PhoneInput
            id="telefono"
            value={telefono}
            onChange={setTelefono}
            placeholder="3001234567"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contrasena</Label>
          <PasswordInput
            id="password"
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repite tu contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Iniciar sesion
        </Link>
      </p>
    </div>
  )
}

