'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, Calendar, Building2, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { deudasService } from '../services/deudas.service'
import { AbonoForm } from './abono-form'
import { AbonoHistory } from './abono-history'
import { DeudaForm } from './deuda-form'
import type { Deuda, DeudaRequest, AbonoRequest } from '../types'
import { sileo } from 'sileo'

const ESTADO_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  PENDIENTE: 'secondary',
  EN_CURSO: 'default',
  COMPLETADA: 'outline',
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
}

interface DeudaCardProps {
  deuda: Deuda
  onUpdate: () => void
}

export function DeudaCard({ deuda, onUpdate }: DeudaCardProps) {
  const [showAbonos, setShowAbonos] = useState(false)
  const [showAbonoForm, setShowAbonoForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAbonos = useCallback(
    () => deudasService.obtenerAbonos(deuda.id),
    [deuda.id]
  )
  const { data: abonos, isLoading: loadingAbonos, refetch: refetchAbonos } = useAsyncData(fetchAbonos, { autoFetch: false })

  const handleToggleAbonos = () => {
    if (!showAbonos && !abonos) {
      refetchAbonos()
    }
    setShowAbonos(!showAbonos)
  }

  const handleAbono = async (data: AbonoRequest) => {
    setIsSubmitting(true)
    try {
      await deudasService.registrarAbono(deuda.id, data)
      sileo.success({ title: 'Abono registrado', description: `Se abonaron ${formatCurrency(data.monto)}` })
      setShowAbonoForm(false)
      await refetchAbonos()
      onUpdate()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo registrar el abono' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: DeudaRequest) => {
    setIsSubmitting(true)
    try {
      await deudasService.actualizar(deuda.id, data)
      sileo.success({ title: 'Actualizado', description: 'La deuda se actualizo correctamente' })
      setShowEditForm(false)
      onUpdate()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deudasService.eliminar(deuda.id)
      sileo.success({ title: 'Eliminado', description: 'Se elimino correctamente' })
      onUpdate()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar' })
    }
  }

  const isCompleted = deuda.estado === 'COMPLETADA'
  const progressColor = deuda.porcentajeAvance >= 75
    ? 'text-green-600'
    : deuda.porcentajeAvance >= 50
      ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <>
      <Card className={isCompleted ? 'opacity-70' : ''}>
        <CardContent className="p-4 space-y-3">
          {/* Encabezado: titulo + badge estado */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate leading-tight">{deuda.descripcion}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                {deuda.entidad && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{deuda.entidad}</span>
                  </span>
                )}
                {deuda.categoria && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span className="truncate">{deuda.categoria}</span>
                  </span>
                )}
              </div>
            </div>
            <Badge variant={ESTADO_BADGE_VARIANT[deuda.estado]} className="shrink-0 text-[10px] px-1.5 py-0">
              {ESTADO_LABELS[deuda.estado]}
            </Badge>
          </div>

          {/* Montos en línea compacta */}
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-bold tabular-nums">{formatCurrency(deuda.montoTotal)}</span>
            <span className="text-xs text-muted-foreground">
              Abonado: <span className="font-medium text-primary">{formatCurrency(deuda.montoAbonado)}</span>
              {' / '}
              Resta: <span className="font-medium text-destructive">{formatCurrency(deuda.montoRestante)}</span>
            </span>
          </div>

          {/* Barra progreso compacta */}
          <div className="flex items-center gap-2">
            <Progress value={deuda.porcentajeAvance} className="h-1.5 flex-1" />
            <span className={`text-xs font-medium tabular-nums ${progressColor}`}>
              {deuda.porcentajeAvance.toFixed(0)}%
            </span>
          </div>

          {/* Fechas + acciones en una fila */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              {deuda.fechaInicio && (
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(deuda.fechaInicio)}
                </span>
              )}
              {deuda.fechaLimite && (
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {formatDate(deuda.fechaLimite)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!isCompleted && (
                <Button size="sm" variant="default" className="h-7 px-2 text-xs" onClick={() => setShowAbonoForm(true)}>
                  <Plus className="h-3 w-3" />
                  Abonar
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleToggleAbonos}>
                {showAbonos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
              {!isCompleted && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowEditForm(true)}>
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar {deuda.tipo === 'DEUDA' ? 'deuda' : 'prestamo'}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta accion no se puede deshacer. Se eliminaran todos los abonos asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Historial colapsable */}
          {showAbonos && (
            <div className="border-t pt-2">
              <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">Historial de abonos</h4>
              {loadingAbonos ? (
                <p className="text-xs text-muted-foreground">Cargando...</p>
              ) : (
                <AbonoHistory abonos={abonos ?? []} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAbonoForm} onOpenChange={setShowAbonoForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar abono</DialogTitle>
          </DialogHeader>
          <AbonoForm
            onSubmit={handleAbono}
            montoRestante={deuda.montoRestante}
            isLoading={isSubmitting}
            onCancel={() => setShowAbonoForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {deuda.tipo === 'DEUDA' ? 'deuda' : 'prestamo'}</DialogTitle>
          </DialogHeader>
          <DeudaForm
            onSubmit={handleEdit}
            initialData={{
              tipo: deuda.tipo,
              descripcion: deuda.descripcion,
              entidad: deuda.entidad,
              montoTotal: deuda.montoTotal,
              fechaInicio: deuda.fechaInicio,
              fechaLimite: deuda.fechaLimite,
              categoria: deuda.categoria,
            }}
            isLoading={isSubmitting}
            onCancel={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
