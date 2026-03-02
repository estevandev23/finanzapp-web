'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { inversionesService } from '../services/inversiones.service'
import { RetornoDialog } from './retorno-dialog'
import type { Inversion, RegistrarRetornoRequest } from '../types'
import { sileo } from 'sileo'

interface InversionCardProps {
  inversion: Inversion
  onUpdate: () => void
}

export function InversionCard({ inversion, onUpdate }: InversionCardProps) {
  const [showRetornoForm, setShowRetornoForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isActiva = inversion.estado === 'ACTIVA'
  const ganancia = inversion.ganancia ?? null

  const handleRegistrarRetorno = async (data: RegistrarRetornoRequest) => {
    setIsSubmitting(true)
    try {
      await inversionesService.registrarRetorno(inversion.id, data)
      sileo.success({
        title: 'Retorno registrado',
        description: ganancia !== null && ganancia >= 0
          ? `Ganancia: ${formatCurrency(data.retornoReal - inversion.monto)}`
          : 'Retorno registrado correctamente',
      })
      setShowRetornoForm(false)
      onUpdate()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo registrar el retorno' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await inversionesService.eliminar(inversion.id)
      sileo.success({ title: 'Eliminado', description: 'Inversión eliminada correctamente' })
      onUpdate()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar la inversión' })
    }
  }

  const GananciaIcon = ganancia === null
    ? Minus
    : ganancia >= 0
      ? TrendingUp
      : TrendingDown

  const gananciaColor = ganancia === null
    ? 'text-muted-foreground'
    : ganancia >= 0
      ? 'text-green-600'
      : 'text-red-600'

  return (
    <>
      <Card className={!isActiva ? 'opacity-80' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-0.5">
              <CardTitle className="truncate text-base">{inversion.nombre}</CardTitle>
              {inversion.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-1">{inversion.descripcion}</p>
              )}
            </div>
            <Badge variant={isActiva ? 'default' : 'secondary'} className="shrink-0">
              {isActiva ? 'Activa' : 'Finalizada'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Invertido</p>
              <p className="text-sm font-semibold">{formatCurrency(inversion.monto)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retorno</p>
              <p className="text-sm font-semibold">
                {inversion.retornoReal != null ? formatCurrency(inversion.retornoReal) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ganancia</p>
              <p className={`text-sm font-semibold ${gananciaColor}`}>
                {ganancia !== null
                  ? `${ganancia >= 0 ? '+' : ''}${formatCurrency(ganancia)}`
                  : '—'}
              </p>
            </div>
          </div>

          {inversion.retornoEsperado != null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Retorno esperado: {formatCurrency(inversion.retornoEsperado)}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Inversión: {formatDate(inversion.fechaInversion)}</span>
            </div>
            {inversion.fechaRetorno && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Retorno: {formatDate(inversion.fechaRetorno)}</span>
              </div>
            )}
          </div>

          {ganancia !== null && (
            <div className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm ${ganancia >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
              <GananciaIcon className="h-4 w-4" />
              <span>{ganancia >= 0 ? 'Ganancia' : 'Pérdida'}: {formatCurrency(Math.abs(ganancia))}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isActiva && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="default" onClick={() => setShowRetornoForm(true)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Registrar retorno
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Registrar el retorno obtenido</TooltipContent>
              </Tooltip>
            )}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Eliminar inversión</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar inversión</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará la inversión y los registros de gasto e ingreso asociados. No se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRetornoForm} onOpenChange={setShowRetornoForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar retorno — {inversion.nombre}</DialogTitle>
          </DialogHeader>
          <RetornoDialog
            montoInvertido={inversion.monto}
            onSubmit={handleRegistrarRetorno}
            isLoading={isSubmitting}
            onCancel={() => setShowRetornoForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
