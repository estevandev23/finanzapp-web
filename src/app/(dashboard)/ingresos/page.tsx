'use client'

import { useCallback, useState } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
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
import { ingresosService } from '@/features/ingresos/services/ingresos.service'
import { IngresoForm } from '@/features/ingresos/components/ingreso-form'
import { IngresosTable } from '@/features/ingresos/components/ingresos-table'
import type { Ingreso, IngresoRequest } from '@/features/ingresos/types'

export default function IngresosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIngreso, setEditingIngreso] = useState<Ingreso | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchIngresos = useCallback(() => ingresosService.obtenerIngresos(), [])
  const fetchTotal = useCallback(() => ingresosService.obtenerTotalIngresos(), [])

  const { data: ingresos, isLoading, error, refetch } = useAsyncData(fetchIngresos)
  const { data: total, refetch: refetchTotal } = useAsyncData(fetchTotal)

  function openCreateDialog() {
    setEditingIngreso(undefined)
    setDialogOpen(true)
  }

  function openEditDialog(ingreso: Ingreso) {
    setEditingIngreso(ingreso)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingIngreso(undefined)
  }

  async function handleSubmit(data: IngresoRequest) {
    setFormLoading(true)
    try {
      if (editingIngreso) {
        await ingresosService.actualizarIngreso(editingIngreso.id, data)
        sileo.success({ title: 'Ingreso actualizado correctamente' })
      } else {
        await ingresosService.crearIngreso(data)
        sileo.success({ title: 'Ingreso creado correctamente' })
      }
      closeDialog()
      await Promise.all([refetch(), refetchTotal()])
    } catch {
      sileo.error({ title: 'Ocurrio un error al guardar el ingreso' })
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
      await ingresosService.eliminarIngreso(deleteId)
      sileo.success({ title: 'Ingreso eliminado correctamente' })
      await Promise.all([refetch(), refetchTotal()])
    } catch {
      sileo.error({ title: 'Ocurrio un error al eliminar el ingreso' })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <PageHeader title="Ingresos" description="Gestiona tus ingresos registrados">
        <Button onClick={openCreateDialog}>
          <Plus />
          Nuevo ingreso
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total ingresos"
          value={formatCurrency(total ?? 0)}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {!ingresos || ingresos.length === 0 ? (
        <EmptyState
          title="Sin ingresos registrados"
          description="Registra tu primer ingreso para comenzar a gestionar tus finanzas"
          action={
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar ingreso
            </Button>
          }
        />
      ) : (
        <IngresosTable
          ingresos={ingresos}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIngreso ? 'Editar ingreso' : 'Nuevo ingreso'}</DialogTitle>
            <DialogDescription>
              {editingIngreso
                ? 'Modifica los datos del ingreso seleccionado'
                : 'Completa los datos para registrar un nuevo ingreso'}
            </DialogDescription>
          </DialogHeader>
          <IngresoForm
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            initialData={editingIngreso}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El ingreso sera eliminado permanentemente.
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
