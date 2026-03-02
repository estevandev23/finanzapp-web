'use client'

import { useCallback, useState } from 'react'
import { Plus, Smartphone } from 'lucide-react'
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
import { dispositivosService } from '@/features/dispositivos/services/dispositivos.service'
import { DispositivoCard } from '@/features/dispositivos/components/dispositivo-card'
import { DispositivoForm } from '@/features/dispositivos/components/dispositivo-form'
import { VerificacionDialog } from '@/features/dispositivos/components/verificacion-dialog'
import type { Dispositivo, DispositivoRequest } from '@/features/dispositivos/types'

export default function DispositivosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [verificandoDispositivo, setVerificandoDispositivo] = useState<Dispositivo | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchDispositivos = useCallback(() => dispositivosService.obtenerDispositivos(), [])
  const { data: dispositivos, isLoading, error, refetch } = useAsyncData(fetchDispositivos)

  function closeDialog() {
    setDialogOpen(false)
  }

  async function handleCrear(data: DispositivoRequest) {
    setFormLoading(true)
    try {
      await dispositivosService.crearDispositivo(data)
      sileo.success({ title: 'Dispositivo vinculado correctamente' })
      closeDialog()
      await refetch()
    } catch {
      sileo.error({ title: 'Ocurrio un error al vincular el dispositivo' })
    } finally {
      setFormLoading(false)
    }
  }

  async function handleVerificar(numeroWhatsapp: string, codigo: string) {
    try {
      await dispositivosService.verificarDispositivo(numeroWhatsapp, codigo)
      sileo.success({ title: 'Dispositivo verificado correctamente' })
      setVerificandoDispositivo(null)
      await refetch()
    } catch {
      sileo.error({ title: 'Codigo de verificacion incorrecto' })
    }
  }

  async function handleDesactivar(dispositivo: Dispositivo) {
    try {
      await dispositivosService.desactivarDispositivo(dispositivo.id)
      sileo.success({ title: 'Dispositivo desactivado correctamente' })
      await refetch()
    } catch {
      sileo.error({ title: 'Ocurrio un error al desactivar el dispositivo' })
    }
  }

  async function handleEliminar(id: string) {
    setDeleteId(id)
  }

  async function confirmDelete() {
    if (!deleteId) return

    try {
      await dispositivosService.eliminarDispositivo(deleteId)
      sileo.success({ title: 'Dispositivo eliminado correctamente' })
      await refetch()
    } catch {
      sileo.error({ title: 'Ocurrio un error al eliminar el dispositivo' })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorDisplay message={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <PageHeader title="Dispositivos WhatsApp" description="Gestiona tus dispositivos vinculados">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Vincular dispositivo
        </Button>
      </PageHeader>

      {!dispositivos || dispositivos.length === 0 ? (
        <EmptyState
          title="Sin dispositivos vinculados"
          description="Vincula tu primer dispositivo WhatsApp para interactuar con el asistente financiero"
          icon={<Smartphone className="h-12 w-12 text-muted-foreground/50" />}
          action={
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Vincular dispositivo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dispositivos.map((dispositivo) => (
            <DispositivoCard
              key={dispositivo.id}
              dispositivo={dispositivo}
              onVerificar={setVerificandoDispositivo}
              onDesactivar={handleDesactivar}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular dispositivo</DialogTitle>
            <DialogDescription>
              Ingresa los datos de tu dispositivo WhatsApp para vincularlo
            </DialogDescription>
          </DialogHeader>
          <DispositivoForm
            onSubmit={handleCrear}
            onCancel={closeDialog}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {verificandoDispositivo && (
        <VerificacionDialog
          dispositivo={verificandoDispositivo}
          open={!!verificandoDispositivo}
          onClose={() => setVerificandoDispositivo(null)}
          onVerify={handleVerificar}
        />
      )}

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El dispositivo sera eliminado permanentemente.
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
