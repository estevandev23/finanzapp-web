'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Plus,
  Building2,
  Tag,
  Calendar,
  Inbox,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { CATEGORIAS_GASTO } from '@/shared/types'
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { deudasService } from '../services/deudas.service'
import { AbonoForm } from './abono-form'
import { AbonoHistory } from './abono-history'
import { DeudaForm } from './deuda-form'
import type { Deuda, DeudaRequest, AbonoRequest } from '../types'
import { sileo } from 'sileo'

const ESTADO_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  PENDIENTE: 'secondary',
  EN_CURSO: 'default',
  COMPLETADA: 'outline',
}

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
}

function getCategoriaLabel(deuda: Deuda): string | null {
  if (deuda.categoriaDescripcion) return deuda.categoriaDescripcion
  if (deuda.categoria) return CATEGORIAS_GASTO.find((c) => c.value === deuda.categoria)?.label ?? deuda.categoria
  return null
}

function CategoriaBadge({ deuda }: { deuda: Deuda }) {
  const label = getCategoriaLabel(deuda)
  if (!label) return null

  if (deuda.categoriaColor) {
    return (
      <Badge variant="secondary" className="gap-1.5 text-[10px] px-1.5 py-0 h-4">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: deuda.categoriaColor }}
        />
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0 h-4">
      <Tag className="h-2.5 w-2.5" />
      {label}
    </Badge>
  )
}

interface DeudasTableProps {
  deudas: Deuda[]
  onUpdate: () => void
  emptyMessage?: string
}

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mediaQuery.matches)

    function handleChange(event: MediaQueryListEvent) {
      setIsMobile(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return isMobile
}

function progressColor(porcentaje: number): string {
  if (porcentaje >= 75) return 'text-green-600 dark:text-green-400'
  if (porcentaje >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

interface DeudaRowActionsProps {
  deuda: Deuda
  onUpdate: () => void
}

function useDeudaRowActions({ deuda, onUpdate }: DeudaRowActionsProps) {
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
      sileo.success({ title: 'Actualizado', description: 'Se actualizo correctamente' })
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

  return {
    showAbonos,
    isCompleted,
    handleToggleAbonos,
    handleDelete,
    abonos,
    loadingAbonos,
    showAbonoForm,
    setShowAbonoForm,
    showEditForm,
    setShowEditForm,
    handleAbono,
    handleEdit,
    isSubmitting,
  }
}

function RowDialogs({ deuda, state }: { deuda: Deuda; state: ReturnType<typeof useDeudaRowActions> }) {
  return (
    <>
      <Dialog open={state.showAbonoForm} onOpenChange={state.setShowAbonoForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar abono</DialogTitle>
          </DialogHeader>
          <AbonoForm
            onSubmit={state.handleAbono}
            montoRestante={deuda.montoRestante}
            isLoading={state.isSubmitting}
            onCancel={() => state.setShowAbonoForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={state.showEditForm} onOpenChange={state.setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {deuda.tipo === 'DEUDA' ? 'deuda' : 'prestamo'}</DialogTitle>
          </DialogHeader>
          <DeudaForm
            onSubmit={state.handleEdit}
            initialData={{
              tipo: deuda.tipo,
              descripcion: deuda.descripcion,
              entidad: deuda.entidad,
              montoTotal: deuda.montoTotal,
              fechaInicio: deuda.fechaInicio,
              fechaLimite: deuda.fechaLimite,
              categoria: deuda.categoria,
              categoriaPersonalizadaId: deuda.categoriaPersonalizadaId,
            }}
            isLoading={state.isSubmitting}
            onCancel={() => state.setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function ActionButtons({
  deuda,
  state,
}: {
  deuda: Deuda
  state: ReturnType<typeof useDeudaRowActions>
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {!state.isCompleted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="default" className="h-7 gap-1 px-2 text-xs" onClick={() => state.setShowAbonoForm(true)}>
              <Plus className="h-3 w-3" />
              Abonar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Registrar abono</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={state.handleToggleAbonos}>
            {state.showAbonos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Historial de abonos</TooltipContent>
      </Tooltip>
      {!state.isCompleted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => state.setShowEditForm(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar</TooltipContent>
        </Tooltip>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
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
            <AlertDialogAction onClick={state.handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ExpandedAbonos({ state }: { state: ReturnType<typeof useDeudaRowActions> }) {
  if (!state.showAbonos) return null

  return (
    <div className="border-t bg-muted/30 px-4 py-3">
      <h4 className="mb-2 text-xs font-medium text-muted-foreground">Historial de abonos</h4>
      {state.loadingAbonos ? (
        <p className="text-xs text-muted-foreground">Cargando...</p>
      ) : (
        <AbonoHistory abonos={state.abonos ?? []} />
      )}
    </div>
  )
}

function DesktopRow({ deuda, onUpdate }: { deuda: Deuda; onUpdate: () => void }) {
  const state = useDeudaRowActions({ deuda, onUpdate })

  return (
    <>
      <TableRow className={`group ${state.isCompleted ? 'opacity-60' : ''}`}>
        <TableCell>
          <div className="min-w-0">
            <span className="font-medium text-sm block truncate">{deuda.descripcion}</span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {deuda.entidad && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[120px]">{deuda.entidad}</span>
                </span>
              )}
              <CategoriaBadge deuda={deuda} />
            </div>
          </div>
        </TableCell>
        <TableCell className="font-semibold tabular-nums">
          {formatCurrency(deuda.montoTotal)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 min-w-[160px]">
            <Progress value={deuda.porcentajeAvance} className="h-1.5 flex-1" />
            <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${progressColor(deuda.porcentajeAvance)}`}>
              {deuda.porcentajeAvance.toFixed(0)}%
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
            {formatCurrency(deuda.montoAbonado)} / {formatCurrency(deuda.montoRestante)} resta
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={ESTADO_VARIANT[deuda.estado]} className="text-xs">
            {ESTADO_LABEL[deuda.estado]}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {deuda.fechaInicio && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(deuda.fechaInicio)}
            </div>
          )}
          {deuda.fechaLimite && (
            <div className="flex items-center gap-1 mt-0.5 text-amber-600 dark:text-amber-400">
              <Calendar className="h-3 w-3" />
              {formatDate(deuda.fechaLimite)}
            </div>
          )}
        </TableCell>
        <TableCell>
          <ActionButtons deuda={deuda} state={state} />
        </TableCell>
      </TableRow>

      {state.showAbonos && (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <ExpandedAbonos state={state} />
          </TableCell>
        </TableRow>
      )}

      <RowDialogs deuda={deuda} state={state} />
    </>
  )
}

function MobileCard({ deuda, onUpdate }: { deuda: Deuda; onUpdate: () => void }) {
  const state = useDeudaRowActions({ deuda, onUpdate })

  return (
    <>
      <Card className={state.isCompleted ? 'opacity-60' : ''}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{formatCurrency(deuda.montoTotal)}</span>
                <Badge variant={ESTADO_VARIANT[deuda.estado]} className="text-[10px] px-1.5 py-0">
                  {ESTADO_LABEL[deuda.estado]}
                </Badge>
              </div>
              <p className="text-sm mt-0.5 truncate">{deuda.descripcion}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {deuda.entidad && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {deuda.entidad}
                  </span>
                )}
                {deuda.categoria && (
                  <CategoriaBadge deuda={deuda} />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Progress value={deuda.porcentajeAvance} className="h-1.5 flex-1" />
            <span className={`text-xs font-medium tabular-nums ${progressColor(deuda.porcentajeAvance)}`}>
              {deuda.porcentajeAvance.toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              Abonado: <span className="text-foreground font-medium">{formatCurrency(deuda.montoAbonado)}</span>
              {' · '}
              Resta: <span className="text-destructive font-medium">{formatCurrency(deuda.montoRestante)}</span>
            </span>
            {deuda.fechaInicio && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(deuda.fechaInicio)}
              </span>
            )}
          </div>

          <ActionButtons deuda={deuda} state={state} />

          <ExpandedAbonos state={state} />
        </CardContent>
      </Card>

      <RowDialogs deuda={deuda} state={state} />
    </>
  )
}

export function DeudasTable({ deudas, onUpdate, emptyMessage }: DeudasTableProps) {
  const isMobile = useIsMobile()

  if (deudas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Inbox className="mb-3 h-10 w-10" />
        <p>{emptyMessage || 'No hay registros'}</p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {deudas.map((deuda) => (
          <MobileCard key={deuda.id} deuda={deuda} onUpdate={onUpdate} />
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descripcion</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Progreso</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fechas</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deudas.map((deuda) => (
          <DesktopRow key={deuda.id} deuda={deuda} onUpdate={onUpdate} />
        ))}
      </TableBody>
    </Table>
  )
}
