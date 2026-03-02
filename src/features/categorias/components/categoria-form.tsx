'use client'

import { useState, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { CategoriaPersonalizada, CategoriaPersonalizadaRequest, TipoCategoria } from '../types'

const COLORES_PREDEFINIDOS = [
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#F59E0B', label: 'Amarillo' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#8B5CF6', label: 'Morado' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#F97316', label: 'Naranja' },
  { value: '#14B8A6', label: 'Turquesa' },
]

interface CategoriaFormProps {
  onSubmit: (data: CategoriaPersonalizadaRequest) => Promise<void>
  onCancel: () => void
  initialData?: CategoriaPersonalizada
  isLoading?: boolean
  tipoFijo?: TipoCategoria
}

export function CategoriaForm({ onSubmit, onCancel, initialData, isLoading, tipoFijo }: CategoriaFormProps) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '')
  const [tipo, setTipo] = useState<TipoCategoria>(initialData?.tipo ?? tipoFijo ?? 'GASTO')
  const [color, setColor] = useState(initialData?.color ?? '#10B981')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const nombreTrimmed = nombre.trim()
    if (!nombreTrimmed) {
      setError('El nombre es requerido')
      return
    }

    if (nombreTrimmed.length < 2 || nombreTrimmed.length > 100) {
      setError('El nombre debe tener entre 2 y 100 caracteres')
      return
    }

    const data: CategoriaPersonalizadaRequest = {
      nombre: nombreTrimmed,
      tipo,
      color: color || undefined,
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          placeholder="Ej: Mascotas, Freelance..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={isLoading}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo *</Label>
        <Select
          value={tipo}
          onValueChange={(v) => setTipo(v as TipoCategoria)}
          disabled={isLoading || !!tipoFijo || !!initialData}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INGRESO">Ingreso</SelectItem>
            <SelectItem value="GASTO">Gasto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLORES_PREDEFINIDOS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => setColor(c.value)}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                color === c.value ? 'scale-110 border-foreground' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          {initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
