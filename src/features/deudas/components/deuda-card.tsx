'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, Calendar, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card className={isCompleted ? 'opacity-75' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{deuda.descripcion}</CardTitle>
              {deuda.entidad && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{deuda.entidad}</span>
                </div>
              )}
            </div>
            <Badge variant={ESTADO_BADGE_VARIANT[deuda.estado]}>
              {ESTADO_LABELS[deuda.estado]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-semibold">{formatCurrency(deuda.montoTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Abonado</p>
              <p className="text-sm font-semibold text-primary">{formatCurrency(deuda.montoAbonado)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Restante</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(deuda.montoRestante)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={deuda.porcentajeAvance} />
            <p className={`text-right text-sm font-medium ${progressColor}`}>
              {deuda.porcentajeAvance.toFixed(1)}%
            </p>
          </div>

          {(deuda.fechaInicio || deuda.fechaLimite) && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              {deuda.fechaInicio && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Inicio: {formatDate(deuda.fechaInicio)}</span>
                </div>
              )}
              {deuda.fechaLimite && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Limite: {formatDate(deuda.fechaLimite)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!isCompleted && (
              <Button size="sm" variant="default" onClick={() => setShowAbonoForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                Abonar
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleToggleAbonos}>
              {showAbonos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Historial
            </Button>
            {!isCompleted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={() => setShowEditForm(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Editar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar {deuda.tipo === 'DEUDA' ? 'deuda' : 'préstamo'}</TooltipContent>
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
                <TooltipContent>Eliminar {deuda.tipo === 'DEUDA' ? 'deuda' : 'préstamo'}</TooltipContent>
              </Tooltip>
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

          {showAbonos && (
            <div className="border-t pt-3">
              <h4 className="mb-2 text-sm font-medium">Historial de abonos</h4>
              {loadingAbonos ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
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
            }}
            isLoading={isSubmitting}
            onCancel={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
