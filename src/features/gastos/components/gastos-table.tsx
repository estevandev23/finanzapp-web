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
import { CATEGORIAS_GASTO } from '@/shared/types'
import type { Gasto } from '../types'

interface GastosTableProps {
  gastos: Gasto[]
  onEdit: (gasto: Gasto) => void
  onDelete: (id: string) => void
}

function getCategoriaLabel(gasto: Gasto): string {
  if (gasto.categoriaDescripcion) return gasto.categoriaDescripcion
  if (gasto.categoria) return CATEGORIAS_GASTO.find((c) => c.value === gasto.categoria)?.label ?? gasto.categoria
  return 'Sin categoría'
}

function CategoriaBadge({ gasto }: { gasto: Gasto }) {
  if (gasto.categoriaColor) {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: gasto.categoriaColor }}
        />
        {getCategoriaLabel(gasto)}
      </Badge>
    )
  }
  return <Badge variant="secondary" className="text-xs">{getCategoriaLabel(gasto)}</Badge>
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

export function GastosTable({ gastos, onEdit, onDelete }: GastosTableProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="space-y-3">
        {gastos.map((gasto) => (
          <Card key={gasto.id}>
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(gasto.monto)}
                  </span>
                  <CategoriaBadge gasto={gasto} />
                  {gasto.deudaId && (
                    <Badge variant="outline" className="gap-1 text-xs text-blue-600 border-blue-300">
                      <HandCoins className="h-3 w-3" />
                      Abono deuda
                    </Badge>
                  )}
                </div>
                {gasto.descripcion && (
                  <p className="truncate text-sm text-muted-foreground">{gasto.descripcion}</p>
                )}
                <p className="text-xs text-muted-foreground">{formatDate(gasto.fecha)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <ActionButton onClick={() => onEdit(gasto)} tooltip="Editar gasto" icon={Pencil} />
                <ActionButton
                  onClick={() => onDelete(gasto.id)}
                  tooltip="Eliminar gasto"
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
          <TableHead>Categoría</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gastos.map((gasto) => (
          <TableRow key={gasto.id} className="group">
            <TableCell>{formatDate(gasto.fecha)}</TableCell>
            <TableCell className="font-medium text-red-600 dark:text-red-400">
              <div className="flex items-center gap-1.5 flex-wrap">
                {formatCurrency(gasto.monto)}
                {gasto.deudaId && (
                  <Badge variant="outline" className="gap-1 text-xs text-blue-600 border-blue-300">
                    <HandCoins className="h-3 w-3" />
                    Abono deuda
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <CategoriaBadge gasto={gasto} />
            </TableCell>
            <TableCell className="max-w-[200px] text-muted-foreground">
              {gasto.descripcion ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default truncate block">{gasto.descripcion}</span>
                  </TooltipTrigger>
                  {gasto.descripcion.length > 30 && (
                    <TooltipContent>{gasto.descripcion}</TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <span className="text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <ActionButton onClick={() => onEdit(gasto)} tooltip="Editar gasto" icon={Pencil} />
                <ActionButton
                  onClick={() => onDelete(gasto.id)}
                  tooltip="Eliminar gasto"
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
