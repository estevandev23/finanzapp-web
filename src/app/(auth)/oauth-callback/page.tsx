'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { loginOAuthCallback } = useAuth()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session) {
      setError(true)
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    const {
      backendToken,
      backendRefreshToken,
      backendUserId,
      backendNombre,
      backendEmail,
      backendRequiere2FA,
    } = session

    if (backendRequiere2FA) {
      loginOAuthCallback({
        requiere2FA: true,
        usuarioId: backendUserId,
        email: backendEmail,
        nombre: backendNombre,
      })
      router.push('/login')
      return
    }

    if (!backendToken || !backendRefreshToken) {
      setError(true)
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    loginOAuthCallback({
      requiere2FA: false,
      token: backendToken,
      refreshToken: backendRefreshToken,
      usuarioId: backendUserId,
      email: backendEmail,
      nombre: backendNombre,
    })

    router.push('/dashboard')
  }, [session, status, router, loginOAuthCallback])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">Error al iniciar sesion con OAuth</p>
          <p className="text-muted-foreground mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Completando inicio de sesion...</p>
      </div>
    </div>
  )
}
