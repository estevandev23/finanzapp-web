'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { CATEGORIAS_GASTO, METODOS_PAGO, type CategoriaGasto, type MetodoPago } from '@/shared/types'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import { MetodoPagoIcon } from '@/shared/components/payment-icons'
import { categoriasService } from '@/features/categorias/services/categorias.service'
import { deudasService } from '@/features/deudas/services/deudas.service'
import type { CategoriaPersonalizada } from '@/features/categorias/types'
import type { Deuda } from '@/features/deudas/types'
import type { Gasto, GastoRequest } from '../types'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface GastoFormProps {
  onSubmit: (data: GastoRequest) => Promise<void>
  onCancel: () => void
  initialData?: Gasto
  isLoading?: boolean
}

const CUSTOM_PREFIX = 'custom:'
const SIN_DEUDA = '__none__'

export function GastoForm({ onSubmit, onCancel, initialData, isLoading }: GastoFormProps) {
  const [monto, setMonto] = useState(initialData?.monto?.toString() ?? '')
  const [categoriaValue, setCategoriaValue] = useState<string>(
    initialData?.categoriaPersonalizadaId
      ? `${CUSTOM_PREFIX}${initialData.categoriaPersonalizadaId}`
      : initialData?.categoria ?? 'COMIDA'
  )
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '')
  const [fecha, setFecha] = useState(initialData?.fecha ?? '')
  const [deudaId, setDeudaId] = useState(initialData?.deudaId ?? SIN_DEUDA)
  const [metodosPago, setMetodosPago] = useState<{ metodo: MetodoPago; monto: string }[]>(
    initialData?.metodosPago?.length
      ? initialData.metodosPago.map((mp) => ({ metodo: mp.metodo, monto: mp.monto.toString() }))
      : [{ metodo: 'EFECTIVO', monto: '' }]
  )
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState<CategoriaPersonalizada[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    deudasService.obtenerPorTipo('DEUDA')
      .then((res) => {
        const activas = (res.data ?? []).filter((d) => d.estado !== 'COMPLETADA')
        setDeudas(activas)
      })
      .catch(() => {})

    categoriasService.listarPorTipo('GASTO')
      .then((res) => setCategoriasPersonalizadas(res.data ?? []))
      .catch(() => {})
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    const metodosParsed = metodosPago
      .map((mp) => ({
        metodo: mp.metodo,
        monto: mp.monto === '' && metodosPago.length === 1 ? montoNum : parseFloat(mp.monto),
      }))
      .filter((mp) => !isNaN(mp.monto) && mp.monto > 0)

    if (metodosParsed.length === 0) {
      setError('Debe seleccionar al menos un método de pago')
      return
    }

    const sumaMetodos = metodosParsed.reduce((acc, mp) => acc + mp.monto, 0)
    if (Math.abs(sumaMetodos - montoNum) > 0.01) {
      setError(`La suma de los métodos ($${sumaMetodos.toLocaleString('es-CO')}) debe ser igual al monto total ($${montoNum.toLocaleString('es-CO')})`)
      return
    }

    const esPersonalizada = categoriaValue.startsWith(CUSTOM_PREFIX)
    const data: GastoRequest = {
      monto: montoNum,
      categoria: esPersonalizada ? undefined : categoriaValue as CategoriaGasto,
      categoriaPersonalizadaId: esPersonalizada ? categoriaValue.replace(CUSTOM_PREFIX, '') : undefined,
      descripcion: descripcion.trim() || undefined,
      fecha: fecha || undefined,
      deudaId: deudaId !== SIN_DEUDA ? deudaId : undefined,
      metodosPago: metodosParsed,
    }

    await onSubmit(data)
  }

  function addMetodoPago() {
    setMetodosPago((prev) => [...prev, { metodo: 'EFECTIVO', monto: '' }])
  }

  function removeMetodoPago(index: number) {
    setMetodosPago((prev) => prev.filter((_, i) => i !== index))
  }

  function updateMetodoPago(index: number, field: 'metodo' | 'monto', value: string) {
    setMetodosPago((prev) =>
      prev.map((mp, i) => (i === index ? { ...mp, [field]: value } : mp))
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CurrencyInput
        id="monto"
        label="Monto *"
        value={monto}
        onChange={setMonto}
        placeholder="0"
        required
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria *</Label>
        <Select value={categoriaValue} onValueChange={setCategoriaValue} disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categorias predeterminadas</SelectLabel>
              {CATEGORIAS_GASTO.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectGroup>
            {categoriasPersonalizadas.length > 0 && (
              <SelectGroup>
                <SelectLabel>Mis categorias</SelectLabel>
                {categoriasPersonalizadas.map((cat) => (
                  <SelectItem key={cat.id} value={`${CUSTOM_PREFIX}${cat.id}`}>
                    <span className="flex items-center gap-2">
                      {cat.color && (
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      {cat.nombre}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripcion</Label>
        <Textarea
          id="descripcion"
          placeholder="Descripcion opcional"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <DatePicker
        id="fecha"
        label="Fecha"
        value={fecha}
        onChange={setFecha}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Métodos de pago</Label>
          {metodosPago.length < 4 && (
            <Button type="button" variant="ghost" size="sm" onClick={addMetodoPago} disabled={isLoading}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Agregar método
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {metodosPago.map((mp, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={mp.metodo}
                onValueChange={(val) => updateMetodoPago(index, 'metodo', val)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METODOS_PAGO.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-1.5">
                        <MetodoPagoIcon metodo={m.value} size={16} /> {m.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Monto"
                value={mp.monto}
                onChange={(e) => updateMetodoPago(index, 'monto', e.target.value)}
                disabled={isLoading}
                className="flex-1"
                min="0"
                step="0.01"
              />
              {metodosPago.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetodoPago(index)}
                  disabled={isLoading}
                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {monto && metodosPago.length === 1 && metodosPago[0].monto === '' && (
          <p className="text-xs text-muted-foreground">
            El monto total se asignará al método seleccionado
          </p>
        )}
      </div>

      {deudas.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="deudaId">Asociar a deuda (abono)</Label>
          <Select value={deudaId} onValueChange={setDeudaId} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sin deuda asociada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_DEUDA}>Sin deuda asociada</SelectItem>
              {deudas.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.descripcion ?? d.entidad ?? 'Deuda'} — Pendiente: {d.montoRestante.toLocaleString('es-CO')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
