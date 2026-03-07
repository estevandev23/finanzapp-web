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
import { CATEGORIAS_INGRESO, METODOS_PAGO, type CategoriaIngreso, type MetodoPago } from '@/shared/types'
import { CurrencyInput } from '@/shared/components/currency-input'
import { DatePicker } from '@/shared/components/date-picker'
import { MetodoPagoIcon } from '@/shared/components/payment-icons'
import { metasService } from '@/features/metas/services/metas.service'
import { categoriasService } from '@/features/categorias/services/categorias.service'
import { deudasService } from '@/features/deudas/services/deudas.service'
import type { MetaFinanciera } from '@/features/metas/types'
import type { CategoriaPersonalizada } from '@/features/categorias/types'
import type { Deuda } from '@/features/deudas/types'
import type { Ingreso, IngresoRequest } from '../types'

interface IngresoFormProps {
  onSubmit: (data: IngresoRequest) => Promise<void>
  onCancel: () => void
  initialData?: Ingreso
  isLoading?: boolean
}

const SIN_META = '__none__'
const SIN_PRESTAMO = '__none__'
const CUSTOM_PREFIX = 'custom:'

export function IngresoForm({ onSubmit, onCancel, initialData, isLoading }: IngresoFormProps) {
  const [monto, setMonto] = useState(initialData?.monto?.toString() ?? '')
  const [categoriaValue, setCategoriaValue] = useState<string>(
    initialData?.categoriaPersonalizadaId
      ? `${CUSTOM_PREFIX}${initialData.categoriaPersonalizadaId}`
      : initialData?.categoria ?? 'TRABAJO_PRINCIPAL',
  )
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '')
  const [fecha, setFecha] = useState(initialData?.fecha ?? '')
  const [montoAhorro, setMontoAhorro] = useState(initialData?.montoAhorro?.toString() ?? '')
  const [metaId, setMetaId] = useState(SIN_META)
  const [prestamoId, setPrestamoId] = useState(initialData?.prestamoId ?? SIN_PRESTAMO)
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(initialData?.metodoPago ?? 'EFECTIVO')
  const [metas, setMetas] = useState<MetaFinanciera[]>([])
  const [prestamos, setPrestamos] = useState<Deuda[]>([])
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState<CategoriaPersonalizada[]>([])
  const [error, setError] = useState<string | null>(null)

  const tieneMontoAhorro = montoAhorro !== '' && parseFloat(montoAhorro) > 0

  useEffect(() => {
    metasService.obtenerMetas()
      .then((res) => {
        const activas = (res.data ?? []).filter((m) => m.estado === 'ACTIVA')
        setMetas(activas)
      })
      .catch(() => {})

    deudasService.obtenerPorTipo('PRESTAMO')
      .then((res) => {
        const activos = (res.data ?? []).filter((d) => d.estado !== 'COMPLETADA')
        setPrestamos(activos)
      })
      .catch(() => {})

    categoriasService.listarPorTipo('INGRESO')
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

    const montoAhorroNum = montoAhorro ? parseFloat(montoAhorro) : undefined
    if (montoAhorroNum !== undefined && (isNaN(montoAhorroNum) || montoAhorroNum < 0)) {
      setError('El monto de ahorro debe ser mayor o igual a 0')
      return
    }

    if (montoAhorroNum !== undefined && montoAhorroNum > montoNum) {
      setError('El monto de ahorro no puede superar el monto del ingreso')
      return
    }

    const esPersonalizada = categoriaValue.startsWith(CUSTOM_PREFIX)
    const data: IngresoRequest = {
      monto: montoNum,
      categoria: esPersonalizada ? undefined : categoriaValue as CategoriaIngreso,
      categoriaPersonalizadaId: esPersonalizada ? categoriaValue.replace(CUSTOM_PREFIX, '') : undefined,
      descripcion: descripcion.trim() || undefined,
      fecha: fecha || undefined,
      montoAhorro: montoAhorroNum,
      metaId: tieneMontoAhorro && metaId !== SIN_META ? metaId : undefined,
      prestamoId: prestamoId !== SIN_PRESTAMO ? prestamoId : undefined,
      metodoPago,
    }

    await onSubmit(data)
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
              {CATEGORIAS_INGRESO.map((cat) => (
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
        <Label>Método de pago</Label>
        <div className="grid grid-cols-4 gap-2">
          {METODOS_PAGO.map((mp) => (
            <button
              key={mp.value}
              type="button"
              onClick={() => setMetodoPago(mp.value)}
              disabled={isLoading}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                metodoPago === mp.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <MetodoPagoIcon metodo={mp.value} size={20} />
              {mp.label}
            </button>
          ))}
        </div>
      </div>

      <CurrencyInput
        id="montoAhorro"
        label="Monto destinado a ahorro"
        value={montoAhorro}
        onChange={setMontoAhorro}
        placeholder="0"
        disabled={isLoading}
      />

      {tieneMontoAhorro && metas.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="metaId">Asociar ahorro a meta</Label>
          <Select value={metaId} onValueChange={setMetaId} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sin meta asociada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_META}>Sin meta asociada</SelectItem>
              {metas.map((meta) => (
                <SelectItem key={meta.id} value={meta.id}>
                  {meta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {prestamos.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="prestamoId">Asociar a préstamo (cobro recibido)</Label>
          <Select value={prestamoId} onValueChange={setPrestamoId} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sin préstamo asociado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SIN_PRESTAMO}>Sin préstamo asociado</SelectItem>
              {prestamos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.descripcion ?? p.entidad ?? 'Préstamo'} — Pendiente: {p.montoRestante.toLocaleString('es-CO')}
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
