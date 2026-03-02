'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { paisesService, type PrefijoPais } from '@/features/paises/services/paises.service'

interface PhoneInputProps {
  value: string
  onChange: (fullNumber: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
  id?: string
}

const COLOMBIA_FALLBACK: PrefijoPais = {
  id: 'co',
  nombre: 'Colombia',
  codigoIso: 'CO',
  prefijoTelefono: '+57',
  banderaEmoji: '🇨🇴',
}

function FlagImg({ codigoIso, nombre }: { codigoIso: string; nombre: string }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${codigoIso.toLowerCase()}.png`}
      width={20}
      height={15}
      alt={nombre}
      className="h-[15px] w-5 rounded-[2px] object-cover"
    />
  )
}

/**
 * Input de teléfono con selector de prefijo de país.
 * Muestra la bandera (imagen CDN) y el prefijo. El valor completo (prefijo + número) se retorna en onChange.
 */
export function PhoneInput({
  value,
  onChange,
  disabled,
  required,
  placeholder = '3001234567',
  id,
}: PhoneInputProps) {
  const [prefijos, setPrefijos] = useState<PrefijoPais[]>([COLOMBIA_FALLBACK])
  const [prefijoCodigo, setPrefijoCodigo] = useState('CO')
  const [localNumber, setLocalNumber] = useState('')

  useEffect(() => {
    paisesService.listarPrefijos().then(data => {
      if (data.length > 0) setPrefijos(data)
    }).catch(() => {
      // Mantiene el fallback de Colombia
    })
  }, [])

  // Descomponer el valor inicial en prefijo + número local
  useEffect(() => {
    if (!value) return

    const prefijosOrdenados = [...prefijos].sort(
      (a, b) => b.prefijoTelefono.length - a.prefijoTelefono.length
    )

    for (const p of prefijosOrdenados) {
      if (value.startsWith(p.prefijoTelefono)) {
        setPrefijoCodigo(p.codigoIso)
        setLocalNumber(value.slice(p.prefijoTelefono.length))
        return
      }
    }

    setLocalNumber(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedPrefijo = prefijos.find(p => p.codigoIso === prefijoCodigo) ?? COLOMBIA_FALLBACK

  function handleLocalNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    setLocalNumber(digits)
    onChange(`${selectedPrefijo.prefijoTelefono}${digits}`)
  }

  function handlePrefijoChange(codigoIso: string) {
    const nuevoPrefijo = prefijos.find(p => p.codigoIso === codigoIso) ?? COLOMBIA_FALLBACK
    setPrefijoCodigo(codigoIso)
    onChange(`${nuevoPrefijo.prefijoTelefono}${localNumber}`)
  }

  return (
    <div className="flex gap-2">
      {prefijos.length > 1 ? (
        <Select value={prefijoCodigo} onValueChange={handlePrefijoChange} disabled={disabled}>
          <SelectTrigger className="w-[110px] shrink-0">
            <span className="flex items-center gap-1.5">
              <FlagImg codigoIso={selectedPrefijo.codigoIso} nombre={selectedPrefijo.nombre} />
              <span className="text-sm">{selectedPrefijo.prefijoTelefono}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            {prefijos.map(p => (
              <SelectItem key={p.codigoIso} value={p.codigoIso}>
                <span className="flex items-center gap-2">
                  <FlagImg codigoIso={p.codigoIso} nombre={p.nombre} />
                  <span>{p.nombre}</span>
                  <span className="text-muted-foreground">{p.prefijoTelefono}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex h-10 w-[110px] shrink-0 items-center gap-1.5 rounded-md border bg-muted px-3 text-sm">
          <FlagImg codigoIso={selectedPrefijo.codigoIso} nombre={selectedPrefijo.nombre} />
          <span>{selectedPrefijo.prefijoTelefono}</span>
        </div>
      )}

      <Input
        id={id}
        type="tel"
        value={localNumber}
        onChange={handleLocalNumberChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        maxLength={15}
        className="flex-1"
      />
    </div>
  )
}
