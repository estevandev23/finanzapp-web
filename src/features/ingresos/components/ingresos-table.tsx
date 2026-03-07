'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Pencil, Trash2, HandCoins } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { CATEGORIAS_INGRESO, METODOS_PAGO } from '@/shared/types'
import { MetodoPagoIcon } from '@/shared/components/payment-icons'
import type { Ingreso } from '../types'

interface IngresosTableProps {
  ingresos: Ingreso[]
  onEdit: (ingreso: Ingreso) => void
  onDelete: (id: string) => void
}

function getCategoriaLabel(ingreso: Ingreso): string {
  if (ingreso.categoriaDescripcion) return ingreso.categoriaDescripcion
  if (ingreso.categoria) return CATEGORIAS_INGRESO.find((c) => c.value === ingreso.categoria)?.label ?? ingreso.categoria
  return 'Sin categoría'
}

function CategoriaBadge({ ingreso }: { ingreso: Ingreso }) {
  if (ingreso.categoriaColor) {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: ingreso.categoriaColor }}
        />
        {getCategoriaLabel(ingreso)}
      </Badge>
    )
  }
  return <Badge variant="secondary" className="text-xs">{getCategoriaLabel(ingreso)}</Badge>
}

interface ActionButtonProps {
  onClick: () => void
  tooltip: string
  icon: React.ElementType
  className?: string
}

function ActionButton({ onClick, tooltip, icon: Icon, className }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={onClick} className={className}>
          <Icon className="h-4 w-4" />
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mediaQuery.matches)

    function handleChange(event: MediaQueryListEvent) {
      setIsMobile(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return isMobile
}

export function IngresosTable({ ingresos, onEdit, onDelete }: IngresosTableProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="space-y-3">
        {ingresos.map((ingreso) => (
          <Card key={ingreso.id}>
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {formatCurrency(ingreso.monto)}
                  </span>
                  <CategoriaBadge ingreso={ingreso} />
                  {ingreso.prestamoId && (
                    <Badge variant="outline" className="gap-1 text-xs text-blue-600 border-blue-300">
                      <HandCoins className="h-3 w-3" />
                      Cobro préstamo
                    </Badge>
                  )}
                </div>
                {ingreso.descripcion && (
                  <p className="truncate text-sm text-muted-foreground">{ingreso.descripcion}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(ingreso.fecha)}</span>
                  {ingreso.metodoPago && (
                    <span className="flex items-center gap-1">
                      <MetodoPagoIcon metodo={ingreso.metodoPago} size={14} />
                      {METODOS_PAGO.find((m) => m.value === ingreso.metodoPago)?.label}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <ActionButton onClick={() => onEdit(ingreso)} tooltip="Editar ingreso" icon={Pencil} />
                <ActionButton
                  onClick={() => onDelete(ingreso.id)}
                  tooltip="Eliminar ingreso"
                  icon={Trash2}
                  className="text-destructive hover:text-destructive"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Método</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingresos.map((ingreso) => (
          <TableRow key={ingreso.id} className="group">
            <TableCell>{formatDate(ingreso.fecha)}</TableCell>
            <TableCell className="font-medium text-green-700 dark:text-green-400">
              <div className="flex items-center gap-1.5 flex-wrap">
                {formatCurrency(ingreso.monto)}
                {ingreso.prestamoId && (
                  <Badge variant="outline" className="gap-1 text-xs text-blue-600 border-blue-300">
                    <HandCoins className="h-3 w-3" />
                    Cobro préstamo
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {ingreso.metodoPago && (() => {
                const mp = METODOS_PAGO.find((m) => m.value === ingreso.metodoPago)
                return mp ? (
                  <span className="flex items-center gap-1.5 text-sm">
                    <MetodoPagoIcon metodo={ingreso.metodoPago!} size={16} /> {mp.label}
                  </span>
                ) : null
              })()}
            </TableCell>
            <TableCell>
              <CategoriaBadge ingreso={ingreso} />
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {ingreso.descripcion ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default truncate block">{ingreso.descripcion}</span>
                  </TooltipTrigger>
                  {ingreso.descripcion.length > 30 && (
                    <TooltipContent>{ingreso.descripcion}</TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <span className="text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <ActionButton onClick={() => onEdit(ingreso)} tooltip="Editar ingreso" icon={Pencil} />
                <ActionButton
                  onClick={() => onDelete(ingreso.id)}
                  tooltip="Eliminar ingreso"
                  icon={Trash2}
                  className="text-destructive hover:text-destructive"
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
