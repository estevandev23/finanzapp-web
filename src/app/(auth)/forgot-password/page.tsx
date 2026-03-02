'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Check, MessageSquare, PiggyBank } from 'lucide-react'
import { sileo } from 'sileo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/features/auth/services/auth.service'
import { OtpInput } from '@/features/auth/components/otp-input'
import { PasswordInput } from '@/features/auth/components/password-input'

type Step = 'email' | 'code' | 'password'

const STEPS: { key: Step; label: string }[] = [
  { key: 'email', label: 'Correo' },
  { key: 'code', label: 'Codigo' },
  { key: 'password', label: 'Contrasena' },
]

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [tieneTelefono, setTieneTelefono] = useState(false)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingSms, setIsSendingSms] = useState(false)

  const currentIndex = STEPS.findIndex((s) => s.key === step)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await authService.forgotPassword(email)
      setTieneTelefono(res.data?.tieneTelefono ?? false)
      setStep('code')
      sileo.success({ title: 'Codigo enviado', description: 'Revisa tu correo electronico.' })
    } catch {
      sileo.error({ title: 'Error al enviar el codigo', description: 'Intenta nuevamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSendSms() {
    setIsSendingSms(true)
    try {
      await authService.forgotPasswordSms(email)
      sileo.success({ title: 'SMS enviado', description: 'Revisa tu telefono.' })
    } catch {
      sileo.error({ title: 'Error al enviar el SMS', description: 'Intenta nuevamente.' })
    } finally {
      setIsSendingSms(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    const codigo = digits.join('')
    if (codigo.length !== 6) {
      sileo.error({ title: 'Ingresa el codigo completo de 6 digitos.' })
      return
    }

    setIsSubmitting(true)
    try {
      await authService.verifyRecoveryCode(email, codigo)
      setStep('password')
    } catch {
      sileo.error({ title: 'Codigo invalido o expirado', description: 'Verifica el codigo e intenta nuevamente.' })
      setDigits(['', '', '', '', '', ''])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()

    if (nuevaPassword.length < 8) {
      sileo.error({ title: 'La contrasena debe tener al menos 8 caracteres.' })
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      sileo.error({ title: 'Las contrasenas no coinciden.' })
      return
    }

    setIsSubmitting(true)
    try {
      await authService.resetPassword(email, digits.join(''), nuevaPassword)
      sileo.success({ title: 'Contrasena actualizada', description: 'Ya puedes iniciar sesion con tu nueva contrasena.' })
      router.push('/login')
    } catch {
      sileo.error({ title: 'Error al cambiar la contrasena', description: 'El enlace puede haber expirado. Solicita un nuevo codigo.' })
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Recuperar contrasena</h1>
        <p className="mt-2 text-muted-foreground">Sigue los pasos para restablecer el acceso a tu cuenta</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, index) => {
          const isDone = currentIndex > index
          const isActive = currentIndex === index

          return (
            <Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    (isDone || isActive) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    isActive && 'ring-4 ring-primary/20'
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={cn('text-xs font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn('mb-5 h-[2px] flex-1 mx-3 transition-colors', isDone ? 'bg-primary' : 'bg-border')} />
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Paso 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-5">
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

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar codigo
          </Button>

          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al login
            </Link>
          </div>
        </form>
      )}

      {/* Paso 2: OTP */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Enviamos un codigo de 6 digitos a <strong className="text-foreground">{email}</strong>
          </p>

          <OtpInput digits={digits} onChange={setDigits} disabled={isSubmitting} />

          {tieneTelefono && (
            <div className="rounded-xl border border-dashed p-4 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Tambien puedes recibir el codigo por SMS
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendSms}
                disabled={isSendingSms || isSubmitting}
                className="gap-2"
              >
                {isSendingSms ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Enviar por SMS
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting || digits.some((d) => d === '')}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Verificar codigo
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => { setStep('email'); setDigits(['', '', '', '', '', '']) }}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Cambiar correo
          </Button>
        </form>
      )}

      {/* Paso 3: Nueva contraseña */}
      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Codigo verificado. Elige una nueva contrasena segura.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="nuevaPassword">Nueva contrasena</Label>
            <PasswordInput
              id="nuevaPassword"
              placeholder="Minimo 8 caracteres"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
              minLength={8}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmarPassword">Confirmar contrasena</Label>
            <PasswordInput
              id="confirmarPassword"
              placeholder="Repite tu contrasena"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
              minLength={8}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Cambiar contrasena
          </Button>
        </form>
      )}
    </div>
  )
}


