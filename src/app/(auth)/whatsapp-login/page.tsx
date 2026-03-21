'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle, Loader2, PiggyBank, XCircle } from 'lucide-react'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'

type Estado = 'validando-token' | 'esperando-login' | 'procesando' | 'exito' | 'error'

export default function WhatsAppLoginPage() {
  return (
    <Suspense>
      <WhatsAppLoginContent />
    </Suspense>
  )
}

function WhatsAppLoginContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { data: session, status } = useSession()
  const [estado, setEstado] = useState<Estado>('validando-token')
  const [mensaje, setMensaje] = useState('')
  const [procesado, setProcesado] = useState(false)

  useEffect(() => {
    if (!token) {
      setEstado('error')
      setMensaje('Este enlace no es valido. Solicita uno nuevo desde WhatsApp.')
      return
    }

    const validarToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://finanzappapi.estevanv.dev/api/v1'
        const response = await fetch(`${apiUrl}/whatsapp/auth/validar-token?token=${token}`)
        const result = await response.json()

        if (response.ok) {
          setEstado('esperando-login')
        } else {
          setEstado('error')
          setMensaje(result.message || 'El link de login no es valido o ha expirado. Solicita uno nuevo desde WhatsApp.')
        }
      } catch {
        setEstado('error')
        setMensaje('Error al verificar el enlace. Intenta nuevamente.')
      }
    }

    validarToken()
  }, [token])

  const confirmarOAuth = useCallback(async (backendToken: string) => {
    if (procesado) return
    setProcesado(true)
    setEstado('procesando')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://finanzappapi.estevanv.dev/api/v1'
      const response = await fetch(`${apiUrl}/whatsapp/auth/confirmar-oauth?token=${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${backendToken}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setEstado('exito')
        setMensaje(result.data?.mensaje || 'Cuenta vinculada exitosamente. Ya puedes usar FinanzApp desde WhatsApp.')
      } else {
        setEstado('error')
        setMensaje(result.message || 'Error al vincular la cuenta.')
      }
    } catch {
      setEstado('error')
      setMensaje('Error de conexion. Intenta nuevamente.')
    }
  }, [token, procesado])

  useEffect(() => {
    if (estado !== 'esperando-login') return
    if (status !== 'authenticated' || !session?.backendToken || !token || procesado) return
    confirmarOAuth(session.backendToken)
  }, [status, session, token, confirmarOAuth, procesado, estado])

  if (estado === 'validando-token') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Verificando enlace...</p>
        </div>
      </div>
    )
  }

  if (estado === 'procesando') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Vinculando tu cuenta con WhatsApp...</p>
        </div>
      </div>
    )
  }

  if (estado === 'exito') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-semibold">Cuenta vinculada</h2>
          <p className="mt-2 text-muted-foreground">{mensaje}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Puedes cerrar esta ventana y volver a WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  if (estado === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Error</h2>
          <p className="mt-2 text-muted-foreground">{mensaje}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl border p-8 shadow-sm">
        <div className="text-center">
          <PiggyBank className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">FinanzApp</h1>
          <p className="mt-2 text-muted-foreground">
            Inicia sesion para vincular tu cuenta con WhatsApp
          </p>
        </div>

        <OAuthButtons callbackUrl={`/whatsapp-login?token=${token}`} />

        <p className="text-center text-xs text-muted-foreground">
          Al iniciar sesion, tu cuenta quedara vinculada a tu numero de WhatsApp
          para gestionar tus finanzas desde el chat.
        </p>
      </div>
    </div>
  )
}
