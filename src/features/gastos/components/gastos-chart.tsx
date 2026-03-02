'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/shared/lib/formatters'
import { CATEGORIAS_GASTO } from '@/shared/types'

interface GastosChartProps {
  desglose: Record<string, number>
}

const GREEN_PALETTE = [
  '#166534',
  '#15803d',
  '#16a34a',
  '#22c55e',
  '#4ade80',
  '#86efac',
  '#bbf7d0',
  '#a7f3d0',
  '#6ee7b7',
]

function getCategoriaLabel(value: string): string {
  return CATEGORIAS_GASTO.find((c) => c.value === value)?.label ?? value
}

export function GastosChart({ desglose }: GastosChartProps) {
  const chartData = useMemo(() => {
    const entries = Object.entries(desglose).filter(([, value]) => value > 0)

    return entries.map(([key, value]) => ({
      name: getCategoriaLabel(key),
      value,
    }))
  }, [desglose])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay datos para mostrar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Desglose por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
                label={(props: PieLabelRenderProps) => {
                  const name = String(props.name ?? '')
                  const percent = Number(props.percent ?? 0)
                  return `${name} (${(percent * 100).toFixed(1)}%)`
                }}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GREEN_PALETTE[index % GREEN_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
