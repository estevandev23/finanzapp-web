'use client'

import { useCallback, useState } from 'react'
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
import { PageLoading } from '@/shared/components/loading-spinner'
import { StatCard } from '@/shared/components/stat-card'
import { formatCurrency } from '@/shared/lib/formatters'
import { inversionesService } from '@/features/inversiones/services/inversiones.service'
import { InversionForm } from '@/features/inversiones/components/inversion-form'
import { InversionCard } from '@/features/inversiones/components/inversion-card'
import type { InversionRequest } from '@/features/inversiones/types'
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

  const refetchAll = async () => {
    await Promise.all([refetchTodas(), refetchActivas(), refetchFinalizadas()])
  }

  const handleCreate = async (data: InversionRequest) => {
    setIsSubmitting(true)
    try {
      await inversionesService.crear(data)
      sileo.success({
        title: 'Inversión registrada',
        description: `${data.nombre} — ${formatCurrency(data.monto)}`,
      })
      setShowForm(false)
      await refetchAll()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo registrar la inversión' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalInvertido = (todas ?? []).reduce((sum, inv) => sum + inv.monto, 0)
  const totalRetornos = (finalizadas ?? []).reduce((sum, inv) => sum + (inv.retornoReal ?? 0), 0)
  const gananciaTotal = totalRetornos - (finalizadas ?? []).reduce((sum, inv) => sum + inv.monto, 0)

  if (isLoading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inversiones</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nueva inversión
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
          title="Ganancia / Pérdida"
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

        <TabsContent value="activas" className="mt-4">
          {(activas ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="text-sm">No tienes inversiones activas</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                Registrar primera inversión
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activas!.map(inv => (
                <InversionCard key={inv.id} inversion={inv} onUpdate={refetchAll} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalizadas" className="mt-4">
          {(finalizadas ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              <Minus className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="text-sm">No tienes inversiones finalizadas</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {finalizadas!.map(inv => (
                <InversionCard key={inv.id} inversion={inv} onUpdate={refetchAll} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar inversión</DialogTitle>
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
