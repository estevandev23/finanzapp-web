'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { sileo } from 'sileo'
import { categoriasService } from '@/features/categorias/services/categorias.service'
import { CategoriaForm } from '@/features/categorias/components/categoria-form'
import { CategoriaList } from '@/features/categorias/components/categoria-list'
import type { CategoriaPersonalizada, CategoriaPersonalizadaRequest } from '@/features/categorias/types'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaPersonalizada[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCrear, setShowCrear] = useState(false)
  const [creando, setCreando] = useState(false)

  const cargarCategorias = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await categoriasService.listarCategorias()
      setCategorias(res.data ?? [])
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudieron cargar las categorias' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarCategorias()
  }, [cargarCategorias])

  async function handleCrear(data: CategoriaPersonalizadaRequest) {
    setCreando(true)
    try {
      await categoriasService.crearCategoria(data)
      sileo.success({ title: 'Categoria creada', description: `"${data.nombre}" se agrego correctamente` })
      setShowCrear(false)
      cargarCategorias()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo crear la categoria' })
    } finally {
      setCreando(false)
    }
  }

  async function handleUpdate(id: string, data: CategoriaPersonalizadaRequest) {
    try {
      await categoriasService.actualizarCategoria(id, data)
      sileo.success({ title: 'Categoria actualizada' })
      cargarCategorias()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar la categoria' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await categoriasService.eliminarCategoria(id)
      sileo.success({ title: 'Categoria eliminada' })
      cargarCategorias()
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar la categoria' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias personalizadas</h1>
          <p className="text-muted-foreground">
            Crea y gestiona tus propias categorias para ingresos y gastos
          </p>
        </div>
        <Button onClick={() => setShowCrear(true)}>
          <Plus className="h-4 w-4" />
          Nueva categoria
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando categorias...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <CategoriaList
            categorias={categorias}
            tipo="INGRESO"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <CategoriaList
            categorias={categorias}
            tipo="GASTO"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Dialog open={showCrear} onOpenChange={setShowCrear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva categoria</DialogTitle>
            <DialogDescription>Crea una categoria personalizada para tus registros</DialogDescription>
          </DialogHeader>
          <CategoriaForm
            onSubmit={handleCrear}
            onCancel={() => setShowCrear(false)}
            isLoading={creando}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
