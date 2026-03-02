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
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { Ahorro } from '../types'
import type { MetaFinanciera } from '@/features/metas/types'

interface AhorrosTableProps {
  ahorros: Ahorro[]
  metas: MetaFinanciera[]
  onEdit: (ahorro: Ahorro) => void
  onDelete: (id: string) => void
}

function getMetaNombre(metaId: string | undefined, metas: MetaFinanciera[]): string | null {
  if (!metaId) return null
  return metas.find((m) => m.id === metaId)?.nombre ?? null
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

export function AhorrosTable({ ahorros, metas, onEdit, onDelete }: AhorrosTableProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="space-y-3">
        {ahorros.map((ahorro) => {
          const metaNombre = getMetaNombre(ahorro.metaId, metas)
          return (
            <Card key={ahorro.id}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {formatCurrency(ahorro.monto)}
                    </span>
                    {metaNombre && (
                      <Badge variant="secondary" className="text-xs">
                        {metaNombre}
                      </Badge>
                    )}
                  </div>
                  {ahorro.descripcion && (
                    <p className="truncate text-sm text-muted-foreground">{ahorro.descripcion}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(ahorro.fecha)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit(ahorro)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onDelete(ahorro.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Descripcion</TableHead>
          <TableHead>Meta</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ahorros.map((ahorro) => {
          const metaNombre = getMetaNombre(ahorro.metaId, metas)
          return (
            <TableRow key={ahorro.id}>
              <TableCell>{formatDate(ahorro.fecha)}</TableCell>
              <TableCell className="font-medium text-green-700 dark:text-green-400">
                {formatCurrency(ahorro.monto)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {ahorro.descripcion ?? '-'}
              </TableCell>
              <TableCell>
                {metaNombre ? (
                  <Badge variant="secondary">{metaNombre}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit(ahorro)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onDelete(ahorro.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
