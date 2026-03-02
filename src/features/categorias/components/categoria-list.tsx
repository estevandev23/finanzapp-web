'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { CategoriaForm } from './categoria-form'
import type { CategoriaPersonalizada, CategoriaPersonalizadaRequest, TipoCategoria } from '../types'

interface CategoriaListProps {
  categorias: CategoriaPersonalizada[]
  tipo: TipoCategoria
  onUpdate: (id: string, data: CategoriaPersonalizadaRequest) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function CategoriaList({ categorias, tipo, onUpdate, onDelete, isLoading }: CategoriaListProps) {
  const [editando, setEditando] = useState<CategoriaPersonalizada | null>(null)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const filtradas = categorias.filter((c) => c.tipo === tipo)
  const tituloTipo = tipo === 'INGRESO' ? 'Ingresos' : 'Gastos'

  async function handleUpdate(data: CategoriaPersonalizadaRequest) {
    if (!editando) return
    setLoadingAction(true)
    try {
      await onUpdate(editando.id, data)
      setEditando(null)
    } finally {
      setLoadingAction(false)
    }
  }

  async function handleDelete() {
    if (!eliminandoId) return
    setLoadingAction(true)
    try {
      await onDelete(eliminandoId)
      setEliminandoId(null)
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorias de {tituloTipo}</CardTitle>
        </CardHeader>
        <CardContent>
          {filtradas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay categorias personalizadas de {tituloTipo.toLowerCase()}</p>
          ) : (
            <div className="space-y-2">
              {filtradas.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color || '#6B7280' }}
                    />
                    <span className="font-medium">{cat.nombre}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditando(cat)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEliminandoId(cat.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editando} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>Modifica los datos de la categoria personalizada</DialogDescription>
          </DialogHeader>
          {editando && (
            <CategoriaForm
              onSubmit={handleUpdate}
              onCancel={() => setEditando(null)}
              initialData={editando}
              isLoading={loadingAction}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!eliminandoId} onOpenChange={(open) => !open && setEliminandoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Los registros existentes con esta categoria no se veran afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingAction}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loadingAction}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
