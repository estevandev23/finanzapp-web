'use client'

import { useCallback, useState } from 'react'
import { Plus, Target } from 'lucide-react'
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
import { PageLoading } from '@/shared/components/loading-spinner'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorDisplay } from '@/shared/components/error-display'
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { metasService } from '@/features/metas/services/metas.service'
import { MetaForm } from '@/features/metas/components/meta-form'
import { MetaCard } from '@/features/metas/components/meta-card'
import { ProgresoDialog } from '@/features/metas/components/progreso-dialog'
import type { MetaFinanciera, MetaFinancieraRequest } from '@/features/metas/types'
import type { EstadoMeta } from '@/shared/types'

export default function MetasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMeta, setEditingMeta] = useState<MetaFinanciera | undefined>()
  const [progresoMeta, setProgresoMeta] = useState<MetaFinanciera | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchMetas = useCallback(() => metasService.obtenerMetas(), [])
  const { data: metas, isLoading, error, refetch } = useAsyncData(fetchMetas)

  function openCreateDialog() {
    setEditingMeta(undefined)
    setDialogOpen(true)
  }

  function openEditDialog(meta: MetaFinanciera) {
    setEditingMeta(meta)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingMeta(undefined)
  }

  async function handleSubmit(data: MetaFinancieraRequest) {
    setFormLoading(true)
    try {
      if (editingMeta) {
        await metasService.actualizarMeta(editingMeta.id, data)
        sileo.success({ title: 'Meta actualizada correctamente' })
      } else {
        await metasService.crearMeta(data)
        sileo.success({ title: 'Meta creada correctamente' })
      }
      closeDialog()
      await refetch()
    } catch {
      sileo.error({ title: 'Ocurrio un error al guardar la meta' })
    } finally {
      setFormLoading(false)
    }
  }

  async function handleRegistrarProgreso(metaId: string, monto: number) {
    try {
      await metasService.registrarProgreso(metaId, monto)
      sileo.success({ title: 'Progreso registrado correctamente' })
      setProgresoMeta(null)
      await refetch()
    } catch {
      sileo.error({ title: 'Ocurrio un error al registrar el progreso' })
    }
  }

  async function handleCambiarEstado(meta: MetaFinanciera, estado: EstadoMeta) {
    try {
      await metasService.cambiarEstado(meta.id, estado)
      sileo.success({ title: `Meta marcada como ${estado.toLowerCase()}` })
      await refetch()
    } catch {
      sileo.error({ title: 'Ocurrio un error al cambiar el estado' })
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <PageHeader title="Metas financieras" description="Define y gestiona tus objetivos de ahorro">
        <Button onClick={openCreateDialog}>
          <Plus />
          Nueva meta
        </Button>
      </PageHeader>

      {!metas || metas.length === 0 ? (
        <EmptyState
          title="Sin metas registradas"
          description="Crea tu primera meta financiera para comenzar a planificar tus ahorros"
          icon={<Target className="h-12 w-12 text-muted-foreground/50" />}
          action={
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Crear meta
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {metas.map((meta) => (
            <MetaCard
              key={meta.id}
              meta={meta}
              onEdit={openEditDialog}
              onRegistrarProgreso={setProgresoMeta}
              onCambiarEstado={handleCambiarEstado}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMeta ? 'Editar meta' : 'Nueva meta'}</DialogTitle>
            <DialogDescription>
              {editingMeta
                ? 'Modifica los datos de la meta seleccionada'
                : 'Completa los datos para crear una nueva meta financiera'}
            </DialogDescription>
          </DialogHeader>
          <MetaForm
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            initialData={editingMeta}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {progresoMeta && (
        <ProgresoDialog
          meta={progresoMeta}
          open={!!progresoMeta}
          onClose={() => setProgresoMeta(null)}
          onSubmit={handleRegistrarProgreso}
        />
      )}
    </div>
  )
}
