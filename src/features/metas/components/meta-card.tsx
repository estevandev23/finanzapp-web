'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Pencil, TrendingUp, ArrowRightLeft, CalendarDays } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { MetaFinanciera } from '../types'
import type { EstadoMeta } from '@/shared/types'

interface MetaCardProps {
  meta: MetaFinanciera
  onEdit: (meta: MetaFinanciera) => void
  onRegistrarProgreso: (meta: MetaFinanciera) => void
  onCambiarEstado: (meta: MetaFinanciera, estado: EstadoMeta) => void
}

function getEstadoBadgeVariant(estado: EstadoMeta) {
  const variantMap: Record<EstadoMeta, 'default' | 'secondary' | 'destructive'> = {
    ACTIVA: 'default',
    COMPLETADA: 'secondary',
    CANCELADA: 'destructive',
  }
  return variantMap[estado]
}

function getEstadoLabel(estado: EstadoMeta): string {
  const labelMap: Record<EstadoMeta, string> = {
    ACTIVA: 'Activa',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
  }
  return labelMap[estado]
}

export function MetaCard({ meta, onEdit, onRegistrarProgreso, onCambiarEstado }: MetaCardProps) {
  const porcentaje = Math.min(meta.porcentajeAvance, 100)

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-lg">{meta.nombre}</CardTitle>
          {meta.descripcion && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{meta.descripcion}</p>
          )}
        </div>
        <Badge variant={getEstadoBadgeVariant(meta.estado)}>{getEstadoLabel(meta.estado)}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{porcentaje.toFixed(0)}%</span>
          </div>
          <Progress
            value={porcentaje}
            className={`h-2.5 ${porcentaje >= 75 ? '[&>[data-slot=progress-indicator]]:bg-green-600' : porcentaje >= 50 ? '[&>[data-slot=progress-indicator]]:bg-yellow-500' : '[&>[data-slot=progress-indicator]]:bg-red-500'}`}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-green-700 dark:text-green-400">
              {formatCurrency(meta.montoActual)}
            </span>
            <span className="text-muted-foreground">de {formatCurrency(meta.montoObjetivo)}</span>
          </div>
        </div>

        {meta.fechaLimite && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Limite: {formatDate(meta.fechaLimite)}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => onEdit(meta)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Button>
          {meta.estado === 'ACTIVA' && (
            <>
              <Button variant="outline" size="sm" onClick={() => onRegistrarProgreso(meta)}>
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Registrar progreso
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCambiarEstado(meta, 'CANCELADA')}
              >
                <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                Cancelar meta
              </Button>
            </>
          )}
          {meta.estado === 'CANCELADA' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCambiarEstado(meta, 'ACTIVA')}
            >
              <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
              Reactivar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
