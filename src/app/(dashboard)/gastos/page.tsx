'use client'

import { useCallback, useState } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PageHeader } from '@/shared/components/page-header'
import { StatCard } from '@/shared/components/stat-card'
import { PageLoading } from '@/shared/components/loading-spinner'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorDisplay } from '@/shared/components/error-display'
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { formatCurrency } from '@/shared/lib/formatters'
import { gastosService } from '@/features/gastos/services/gastos.service'
import { GastoForm } from '@/features/gastos/components/gasto-form'
import { GastosTable } from '@/features/gastos/components/gastos-table'
import { GastosChart } from '@/features/gastos/components/gastos-chart'
import type { Gasto, GastoRequest } from '@/features/gastos/types'

export default function GastosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchGastos = useCallback(() => gastosService.obtenerGastos(), [])
  const fetchTotal = useCallback(() => gastosService.obtenerTotalGastos(), [])
  const fetchDesglose = useCallback(() => gastosService.obtenerDesgloseGastos(), [])

  const { data: gastos, isLoading, error, refetch } = useAsyncData(fetchGastos)
  const { data: total, refetch: refetchTotal } = useAsyncData(fetchTotal)
  const { data: desglose, refetch: refetchDesglose } = useAsyncData(fetchDesglose)

  function openCreateDialog() {
    setEditingGasto(undefined)
    setDialogOpen(true)
  }

  function openEditDialog(gasto: Gasto) {
    setEditingGasto(gasto)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingGasto(undefined)
  }

  async function handleSubmit(data: GastoRequest) {
    setFormLoading(true)
    try {
      if (editingGasto) {
        await gastosService.actualizarGasto(editingGasto.id, data)
        sileo.success({ title: 'Gasto actualizado correctamente' })
      } else {
        await gastosService.crearGasto(data)
        sileo.success({ title: 'Gasto creado correctamente' })
      }
      closeDialog()
      await Promise.all([refetch(), refetchTotal(), refetchDesglose()])
    } catch {
      sileo.error({ title: 'Ocurrio un error al guardar el gasto' })
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id)
  }

  async function confirmDelete() {
    if (!deleteId) return

    try {
      await gastosService.eliminarGasto(deleteId)
      sileo.success({ title: 'Gasto eliminado correctamente' })
      await Promise.all([refetch(), refetchTotal(), refetchDesglose()])
    } catch {
      sileo.error({ title: 'Ocurrio un error al eliminar el gasto' })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <PageHeader title="Gastos" description="Gestiona tus gastos registrados">
        <Button onClick={openCreateDialog}>
          <Plus />
          Nuevo gasto
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total gastos"
          value={formatCurrency(total ?? 0)}
          icon={TrendingDown}
          trend="down"
        />
        {desglose && Object.keys(desglose).length > 0 && (
          <GastosChart desglose={desglose} />
        )}
      </div>

      {!gastos || gastos.length === 0 ? (
        <EmptyState
          title="Sin gastos registrados"
          description="Registra tu primer gasto para llevar un control de tus finanzas"
          action={
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar gasto
            </Button>
          }
        />
      ) : (
        <GastosTable
          gastos={gastos}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGasto ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
            <DialogDescription>
              {editingGasto
                ? 'Modifica los datos del gasto seleccionado'
                : 'Completa los datos para registrar un nuevo gasto'}
            </DialogDescription>
          </DialogHeader>
          <GastoForm
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            initialData={editingGasto}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El gasto sera eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
