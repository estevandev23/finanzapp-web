'use client'

import { useState, useRef } from 'react'
import { ShieldCheck, Phone, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { perfilService } from '@/features/perfil/services/perfil.service'
import type { UsuarioProfile } from '@/features/perfil/types'

interface SecuritySettingsProps {
  profile: UsuarioProfile
  onProfileUpdate: (profile: UsuarioProfile) => void
}

export function SecuritySettings({ profile, onProfileUpdate }: SecuritySettingsProps) {
  const [isToggling2FA, setIsToggling2FA] = useState(false)
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [isVerifyingSms, setIsVerifyingSms] = useState(false)
  const [showSmsInput, setShowSmsInput] = useState(false)
  const [smsDigits, setSmsDigits] = useState<string[]>(['', '', '', '', '', ''])
  const smsInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleToggle2FA = async (checked: boolean) => {
    setIsToggling2FA(true)
    try {
      const res = await perfilService.toggle2FA(checked)
      onProfileUpdate(res.data)
      const mensaje = checked ? 'Autenticacion en dos pasos activada' : 'Autenticacion en dos pasos desactivada'
      sileo.success({ title: mensaje })
    } catch {
      sileo.error({ title: 'Error al cambiar la configuracion de 2FA' })
    } finally {
      setIsToggling2FA(false)
    }
  }

  const handleEnviarSms = async () => {
    setIsSendingSms(true)
    try {
      const res = await perfilService.enviarSmsVerificacion()
      setShowSmsInput(true)
      sileo.success({ title: 'Codigo enviado', description: `Se envio un SMS a ${res.data.telefono}` })
      setTimeout(() => smsInputRefs.current[0]?.focus(), 100)
    } catch {
      sileo.error({ title: 'Error al enviar el SMS', description: 'Verifica que tengas un telefono registrado' })
    } finally {
      setIsSendingSms(false)
    }
  }

  const handleSmsDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...smsDigits]
    newDigits[index] = value.slice(-1)
    setSmsDigits(newDigits)

    if (value && index < 5) {
      smsInputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every(d => d !== '') && index === 5) {
      handleVerificarSms(newDigits.join(''))
    }
  }

  const handleSmsKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsDigits[index] && index > 0) {
      smsInputRefs.current[index - 1]?.focus()
    }
  }

  const handleSmsPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setSmsDigits(text.split(''))
      smsInputRefs.current[5]?.focus()
      handleVerificarSms(text)
    }
  }

  const handleVerificarSms = async (code?: string) => {
    const codigo = code || smsDigits.join('')
    if (codigo.length !== 6) return

    setIsVerifyingSms(true)
    try {
      await perfilService.verificarSms(codigo)
      onProfileUpdate({ ...profile, telefonoVerificado: true })
      setShowSmsInput(false)
      setSmsDigits(['', '', '', '', '', ''])
      sileo.success({ title: 'Telefono verificado exitosamente' })
    } catch {
      sileo.error({ title: 'Codigo incorrecto', description: 'Verifica el codigo e intenta de nuevo' })
      setSmsDigits(['', '', '', '', '', ''])
      smsInputRefs.current[0]?.focus()
    } finally {
      setIsVerifyingSms(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <Label className="text-base font-medium">Autenticacion en dos pasos</Label>
            <p className="text-sm text-muted-foreground">
              Recibe un codigo por email cada vez que inicies sesion
            </p>
          </div>
        </div>
        <Switch
          checked={profile.dosFactoresActivado}
          onCheckedChange={handleToggle2FA}
          disabled={isToggling2FA}
        />
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-base font-medium">Verificacion de telefono</Label>
              <p className="text-sm text-muted-foreground">
                {profile.telefono || 'No tienes un telefono registrado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.telefonoVerificado ? (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle className="h-4 w-4" />
                Verificado
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                  <XCircle className="h-4 w-4" />
                  No verificado
                </span>
                {profile.telefono && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnviarSms}
                    disabled={isSendingSms}
                  >
                    {isSendingSms && <Loader2 className="h-3 w-3 animate-spin" />}
                    Verificar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {showSmsInput && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm text-muted-foreground">Ingresa el codigo de 6 digitos enviado por SMS</p>
            <div className="flex justify-center gap-2" onPaste={handleSmsPaste}>
              {smsDigits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { smsInputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleSmsDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleSmsKeyDown(index, e)}
                  className="h-12 w-10 text-center text-xl font-bold"
                  disabled={isVerifyingSms}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                onClick={() => handleVerificarSms()}
                disabled={isVerifyingSms || smsDigits.some(d => d === '')}
              >
                {isVerifyingSms && <Loader2 className="h-3 w-3 animate-spin" />}
                Verificar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSmsInput(false); setSmsDigits(['', '', '', '', '', '']) }}
                disabled={isVerifyingSms}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
