'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, PiggyBank } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { TwoFactorVerification } from '@/features/auth/components/two-factor-verification'
import { PasswordInput } from '@/features/auth/components/password-input'
import { clearAuthTokens } from '@/shared/lib/api-client'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, twoFactorPending, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }

    const isExpiredSession = searchParams.get('expired') === 'true' || searchParams.has('callbackUrl')
    if (isExpiredSession) {
      clearAuthTokens()
      signOut({ redirect: false }).catch(() => {})
    }
  }, [isAuthenticated, router, searchParams])

  if (isAuthenticated) {
    return null
  }

  if (twoFactorPending) {
    return <TwoFactorVerification />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await login({ email, password })
      if (!twoFactorPending) {
        router.push('/dashboard')
      }
    } catch {
      sileo.error({ title: 'Credenciales incorrectas', description: 'Verifica tu email y contrasena.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo visible solo en mobile (el panel izq. no aparece en pantallas pequeñas) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PiggyBank className="h-4 w-4" />
        </div>
        <span className="font-bold text-foreground">FinanzApp</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Iniciar sesion</h1>
        <p className="mt-2 text-muted-foreground">Accede a tu espacio financiero personal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contrasena</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Olvidaste tu contrasena?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Tu contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Iniciar sesion
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground tracking-wider">o continua con</span>
        </div>
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        No tienes cuenta?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}

