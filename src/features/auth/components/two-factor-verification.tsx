'use client'

import { useState } from 'react'
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { OtpInput } from '@/features/auth/components/otp-input'

export function TwoFactorVerification() {
  const { verify2FA, cancelar2FA, twoFactorPending } = useAuth()
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (code?: string) => {
    const codigo = code ?? digits.join('')
    if (codigo.length !== 6) {
      sileo.error({ title: 'Codigo incompleto', description: 'Ingresa los 6 digitos' })
      return
    }

    setIsSubmitting(true)
    try {
      await verify2FA(codigo)
    } catch {
      sileo.error({ title: 'Codigo incorrecto', description: 'Verifica el codigo e intenta de nuevo' })
      setDigits(['', '', '', '', '', ''])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Verificacion en dos pasos</h1>
          <p className="mt-2 text-muted-foreground">
            Se envio un codigo de verificacion a{' '}
            <strong className="text-foreground">{twoFactorPending?.email}</strong>
          </p>
        </div>
      </div>

      <OtpInput
        digits={digits}
        onChange={setDigits}
        onComplete={handleSubmit}
        disabled={isSubmitting}
      />

      <Button
        className="w-full h-11"
        onClick={() => handleSubmit()}
        disabled={isSubmitting || digits.some((d) => d === '')}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Verificar codigo
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={cancelar2FA}
        disabled={isSubmitting}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al login
      </Button>
    </div>
  )
}

