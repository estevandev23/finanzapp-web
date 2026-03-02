'use client'

import { useCallback, useMemo, useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { useModuleFilters } from '@/shared/hooks/use-module-filters'
import { PageLoading } from '@/shared/components/loading-spinner'
import { StatCard } from '@/shared/components/stat-card'
import { ModuleFilterBar } from '@/shared/components/filters/module-filter-bar'
import { EmptyState } from '@/shared/components/empty-state'
import { formatCurrency } from '@/shared/lib/formatters'
import { inversionesService } from '@/features/inversiones/services/inversiones.service'
import { InversionForm } from '@/features/inversiones/components/inversion-form'
import { InversionCard } from '@/features/inversiones/components/inversion-card'
import type { Inversion, InversionRequest } from '@/features/inversiones/types'
import { sileo } from 'sileo'

export default function InversionesPage() {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTodas = useCallback(() => inversionesService.obtenerTodas(), [])
  const fetchActivas = useCallback(() => inversionesService.obtenerTodas('ACTIVA'), [])
  const fetchFinalizadas = useCallback(() => inversionesService.obtenerTodas('FINALIZADA'), [])

  const { data: todas, isLoading, refetch: refetchTodas } = useAsyncData(fetchTodas)
  const { data: activas, refetch: refetchActivas } = useAsyncData(fetchActivas)
  const { data: finalizadas, refetch: refetchFinalizadas } = useAsyncData(fetchFinalizadas)

  const activasFilterConfig = useMemo(
    () => ({
      getSearchableText: (inv: Inversion) =>
        [inv.nombre, inv.descripcion, String(inv.monto)].filter(Boolean).join(' '),
      getDate: (inv: Inversion) => inv.fechaInversion,
    }),
    []
  )

  const finalizadasFilterConfig = useMemo(
    () => ({
      getSearchableText: (inv: Inversion) =>
        [inv.nombre, inv.descripcion, String(inv.monto), String(inv.retornoReal ?? '')]
          .filter(Boolean)
          .join(' '),
      getDate: (inv: Inversion) => inv.fechaInversion,
    }),
    []
  )

  const activasFilters = useModuleFilters(activas, activasFilterConfig)
  const finalizadasFilters = useModuleFilters(finalizadas, finalizadasFilterConfig)

  const refetchAll = async () => {
    await Promise.all([refetchTodas(), refetchActivas(), refetchFinalizadas()])
  }

  const handleCreate = async (data: InversionRequest) => {
    setIsSubmitting(true)
    try {
      await inversionesService.crear(data)
      sileo.success({
        title: 'Inversion registrada',
        description: `${data.nombre} - ${formatCurrency(data.monto)}`,
      })
      setShowForm(false)
      await refetchAll()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo registrar la inversion' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalInvertido = (todas ?? []).reduce((sum, inv) => sum + inv.monto, 0)
  const totalRetornos = (finalizadas ?? []).reduce((sum, inv) => sum + (inv.retornoReal ?? 0), 0)
  const gananciaTotal =
    totalRetornos - (finalizadas ?? []).reduce((sum, inv) => sum + inv.monto, 0)

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inversiones</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nueva inversion
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total invertido"
          value={formatCurrency(totalInvertido)}
          icon={BarChart3}
          trend="neutral"
        />
        <StatCard
          title="Total retornos"
          value={formatCurrency(totalRetornos)}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Ganancia / Perdida"
          value={formatCurrency(Math.abs(gananciaTotal))}
          icon={gananciaTotal >= 0 ? TrendingUp : TrendingDown}
          trend={gananciaTotal >= 0 ? 'up' : 'down'}
        />
      </div>

      <Tabs defaultValue="activas">
        <TabsList>
          <TabsTrigger value="activas" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Activas
            {(activas?.length ?? 0) > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium">
                {activas?.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="finalizadas" className="gap-1.5">
            <Minus className="h-4 w-4" />
            Finalizadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-4 space-y-4">
          <ModuleFilterBar
            searchPlaceholder="Buscar por nombre, descripcion o monto..."
            search={activasFilters.search}
            onSearchChange={activasFilters.setSearch}
            datePreset={activasFilters.datePreset}
            onDatePresetChange={activasFilters.setDatePreset}
            customRange={activasFilters.customRange}
            onCustomRangeChange={activasFilters.setCustomRange}
            hasActiveFilters={activasFilters.hasActiveFilters}
            onReset={activasFilters.resetFilters}
            totalItems={activasFilters.totalItems}
            filteredCount={activasFilters.filteredCount}
          />

          {activasFilters.filteredData.length === 0 ? (
            <EmptyState
              title={activasFilters.hasActiveFilters ? 'Sin resultados' : 'No tienes inversiones activas'}
              description={
                activasFilters.hasActiveFilters
                  ? 'No hay inversiones activas con los filtros aplicados'
                  : 'Registra tu primera inversion para comenzar'
              }
              action={
                activasFilters.hasActiveFilters ? (
                  <Button size="sm" variant="outline" onClick={activasFilters.resetFilters}>
                    Limpiar filtros
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Registrar primera inversion
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activasFilters.filteredData.map((inv) => (
                <InversionCard key={inv.id} inversion={inv} onUpdate={refetchAll} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalizadas" className="mt-4 space-y-4">
          <ModuleFilterBar
            searchPlaceholder="Buscar por nombre, descripcion o retorno..."
            search={finalizadasFilters.search}
            onSearchChange={finalizadasFilters.setSearch}
            datePreset={finalizadasFilters.datePreset}
            onDatePresetChange={finalizadasFilters.setDatePreset}
            customRange={finalizadasFilters.customRange}
            onCustomRangeChange={finalizadasFilters.setCustomRange}
            hasActiveFilters={finalizadasFilters.hasActiveFilters}
            onReset={finalizadasFilters.resetFilters}
            totalItems={finalizadasFilters.totalItems}
            filteredCount={finalizadasFilters.filteredCount}
          />

          {finalizadasFilters.filteredData.length === 0 ? (
            <EmptyState
              title={finalizadasFilters.hasActiveFilters ? 'Sin resultados' : 'No tienes inversiones finalizadas'}
              description={
                finalizadasFilters.hasActiveFilters
                  ? 'No hay inversiones finalizadas con los filtros aplicados'
                  : 'Las inversiones finalizadas apareceran aqui'
              }
              action={
                finalizadasFilters.hasActiveFilters ? (
                  <Button size="sm" variant="outline" onClick={finalizadasFilters.resetFilters}>
                    Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {finalizadasFilters.filteredData.map((inv) => (
                <InversionCard key={inv.id} inversion={inv} onUpdate={refetchAll} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar inversion</DialogTitle>
          </DialogHeader>
          <InversionForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}