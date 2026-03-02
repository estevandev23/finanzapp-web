'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ShieldOff, Power, Trash2, Smartphone } from 'lucide-react'
import type { Dispositivo } from '../types'

interface DispositivoCardProps {
  dispositivo: Dispositivo
  onVerificar: (dispositivo: Dispositivo) => void
  onDesactivar: (dispositivo: Dispositivo) => void
  onEliminar: (id: string) => void
}

function maskPhoneNumber(numero: string): string {
  if (numero.length <= 4) return numero
  const visible = numero.slice(-4)
  const masked = '*'.repeat(numero.length - 4)
  return `${masked}${visible}`
}

export function DispositivoCard({
  dispositivo,
  onVerificar,
  onDesactivar,
  onEliminar,
}: DispositivoCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Smartphone className="h-5 w-5 text-green-700 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {dispositivo.nombreDispositivo || 'Dispositivo WhatsApp'}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {maskPhoneNumber(dispositivo.numeroWhatsapp)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dispositivo.verificado ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verificado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <ShieldOff className="mr-1 h-3 w-3" />
              Sin verificar
            </Badge>
          )}
          {dispositivo.activo ? (
            <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-400">
              Activo
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Inactivo
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-3">
          {!dispositivo.verificado && (
            <Button variant="outline" size="sm" onClick={() => onVerificar(dispositivo)}>
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Verificar
            </Button>
          )}
          {dispositivo.activo && (
            <Button variant="outline" size="sm" onClick={() => onDesactivar(dispositivo)}>
              <Power className="mr-1.5 h-3.5 w-3.5" />
              Desactivar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onEliminar(dispositivo.id)}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5 text-destructive" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
