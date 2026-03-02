'use client'

import { useCallback, useState } from 'react'
import { HandCoins, Handshake, Plus, BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { deudasService } from '@/features/deudas/services/deudas.service'
import { DeudaForm } from '@/features/deudas/components/deuda-form'
import { DeudaList } from '@/features/deudas/components/deuda-list'
import type { DeudaRequest, TipoDeuda } from '@/features/deudas/types'
import { sileo } from 'sileo'

export default function DeudasPage() {
  const [showForm, setShowForm] = useState(false)
  const [formTipo, setFormTipo] = useState<TipoDeuda>('DEUDA')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDeudas = useCallback(() => deudasService.obtenerPorTipo('DEUDA'), [])
  const fetchPrestamos = useCallback(() => deudasService.obtenerPorTipo('PRESTAMO'), [])
  const fetchResumen = useCallback(() => deudasService.obtenerResumen(), [])

  const { data: deudas, isLoading: loadingDeudas, refetch: refetchDeudas } = useAsyncData(fetchDeudas)
  const { data: prestamos, isLoading: loadingPrestamos, refetch: refetchPrestamos } = useAsyncData(fetchPrestamos)
  const { data: resumen, isLoading: loadingResumen, refetch: refetchResumen } = useAsyncData(fetchResumen)

  const refetchAll = async () => {
    await Promise.all([refetchDeudas(), refetchPrestamos(), refetchResumen()])
  }

  const handleCreate = async (data: DeudaRequest) => {
    setIsSubmitting(true)
    try {
      await deudasService.crear(data)
      const label = data.tipo === 'DEUDA' ? 'Deuda registrada' : 'Prestamo registrado'
      sileo.success({ title: label, description: `${formatCurrency(data.montoTotal)}` })
      setShowForm(false)
      await refetchAll()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo crear el registro' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openForm = (tipo: TipoDeuda) => {
    setFormTipo(tipo)
    setShowForm(true)
  }

  if (loadingDeudas || loadingPrestamos || loadingResumen) {
    return <PageLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deudas y Prestamos</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total deudas"
          value={formatCurrency(resumen?.totalDeudas ?? 0)}
          icon={HandCoins}
          trend="down"
        />
        <StatCard
          title="Dinero prestado"
          value={formatCurrency(resumen?.totalPrestamos ?? 0)}
          icon={Handshake}
          trend="neutral"
        />
        <StatCard
          title="Abonos recibidos"
          value={formatCurrency(resumen?.abonosRecibidos ?? 0)}
          icon={BarChart3}
          trend="up"
        />
      </div>

      <Tabs defaultValue="deudas">
        <TabsList>
          <TabsTrigger value="deudas" className="gap-1.5">
            <HandCoins className="h-4 w-4" />
            Mis deudas
          </TabsTrigger>
          <TabsTrigger value="prestamos" className="gap-1.5">
            <Handshake className="h-4 w-4" />
            Dinero prestado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deudas" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openForm('DEUDA')}>
              <Plus className="h-4 w-4" />
              Nueva deuda
            </Button>
          </div>
          <DeudaList
            deudas={deudas ?? []}
            onUpdate={refetchAll}
            emptyMessage="No tienes deudas registradas"
          />
        </TabsContent>

        <TabsContent value="prestamos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openForm('PRESTAMO')}>
              <Plus className="h-4 w-4" />
              Nuevo prestamo
            </Button>
          </div>
          <DeudaList
            deudas={prestamos ?? []}
            onUpdate={refetchAll}
            emptyMessage="No tienes prestamos registrados"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formTipo === 'DEUDA' ? 'Registrar deuda' : 'Registrar prestamo'}
            </DialogTitle>
          </DialogHeader>
          <DeudaForm
            onSubmit={handleCreate}
            initialData={{ tipo: formTipo }}
            isLoading={isSubmitting}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
