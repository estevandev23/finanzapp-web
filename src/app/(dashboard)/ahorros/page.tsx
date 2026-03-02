'use client'

import { useCallback, useMemo, useState } from 'react'
import { PiggyBank, Plus } from 'lucide-react'
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
import { ModuleFilterBar } from '@/shared/components/filters/module-filter-bar'
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { useModuleFilters } from '@/shared/hooks/use-module-filters'
import { formatCurrency } from '@/shared/lib/formatters'
import { ahorrosService } from '@/features/ahorros/services/ahorros.service'
import { metasService } from '@/features/metas/services/metas.service'
import { AhorroForm } from '@/features/ahorros/components/ahorro-form'
import { AhorrosTable } from '@/features/ahorros/components/ahorros-table'
import type { Ahorro, AhorroRequest } from '@/features/ahorros/types'

export default function AhorrosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAhorro, setEditingAhorro] = useState<Ahorro | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchAhorros = useCallback(() => ahorrosService.obtenerAhorros(), [])
  const fetchTotal = useCallback(() => ahorrosService.obtenerTotalAhorros(), [])
  const fetchMetas = useCallback(() => metasService.obtenerMetas(), [])

  const { data: ahorros, isLoading, error, refetch } = useAsyncData(fetchAhorros)
  const { data: total, refetch: refetchTotal } = useAsyncData(fetchTotal)
  const { data: metas } = useAsyncData(fetchMetas)

  const filterConfig = useMemo(
    () => ({
      getSearchableText: (a: Ahorro) =>
        [a.descripcion, String(a.monto)].filter(Boolean).join(' '),
      getDate: (a: Ahorro) => a.fecha,
    }),
    []
  )

  const {
    search, setSearch,
    datePreset, setDatePreset,
    customRange, setCustomRange,
    filteredData,
    resetFilters,
    hasActiveFilters,
    totalItems,
    filteredCount,
  } = useModuleFilters(ahorros, filterConfig)

  function openCreateDialog() {
    setEditingAhorro(undefined)
    setDialogOpen(true)
  }

  function openEditDialog(ahorro: Ahorro) {
    setEditingAhorro(ahorro)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingAhorro(undefined)
  }

  async function handleSubmit(data: AhorroRequest) {
    setFormLoading(true)
    try {
      if (editingAhorro) {
        await ahorrosService.actualizarAhorro(editingAhorro.id, data)
        sileo.success({ title: 'Ahorro actualizado correctamente' })
      } else {
        await ahorrosService.crearAhorro(data)
        sileo.success({ title: 'Ahorro creado correctamente' })
      }
      closeDialog()
      await Promise.all([refetch(), refetchTotal()])
    } catch {
      sileo.error({ title: 'Ocurrio un error al guardar el ahorro' })
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
      await ahorrosService.eliminarAhorro(deleteId)
      sileo.success({ title: 'Ahorro eliminado correctamente' })
      await Promise.all([refetch(), refetchTotal()])
    } catch {
      sileo.error({ title: 'Ocurrio un error al eliminar el ahorro' })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <PageHeader title="Ahorros" description="Gestiona tus ahorros registrados">
        <Button onClick={openCreateDialog}>
          <Plus />
          Nuevo ahorro
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total ahorros"
          value={formatCurrency(total ?? 0)}
          icon={PiggyBank}
          trend="up"
        />
      </div>

      <ModuleFilterBar
        searchPlaceholder="Buscar por descripcion o monto..."
        search={search}
        onSearchChange={setSearch}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        totalItems={totalItems}
        filteredCount={filteredCount}
      />

      {!ahorros || ahorros.length === 0 ? (
        <EmptyState
          title="Sin ahorros registrados"
          description="Registra tu primer ahorro para comenzar a construir tu futuro financiero"
          action={
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar ahorro
            </Button>
          }
        />
      ) : filteredData.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No se encontraron ahorros con los filtros aplicados"
          action={
            <Button variant="outline" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <AhorrosTable
          ahorros={filteredData}
          metas={metas ?? []}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAhorro ? 'Editar ahorro' : 'Nuevo ahorro'}</DialogTitle>
            <DialogDescription>
              {editingAhorro
                ? 'Modifica los datos del ahorro seleccionado'
                : 'Completa los datos para registrar un nuevo ahorro'}
            </DialogDescription>
          </DialogHeader>
          <AhorroForm
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            initialData={editingAhorro}
            isLoading={formLoading}
            metas={metas ?? []}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El ahorro sera eliminado permanentemente.
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