'use client'

import { useCallback, useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Target, HandCoins, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useAsyncData } from '@/shared/hooks/use-async-data'
import { balanceService } from '@/features/balance/services/balance.service'
import { metasService } from '@/features/metas/services/metas.service'
import { StatCard } from '@/shared/components/stat-card'
import { DashboardSkeleton } from '@/shared/components/loading-spinner'
import { formatCurrency } from '@/shared/lib/formatters'
import {
  DATE_PRESETS,
  DATE_PRESET_LABELS,
  getDateRangeForPreset,
  type DatePreset,
  type DateRange,
} from '@/shared/lib/date-utils'
import { DateRangePicker } from '@/shared/components/filters/date-range-picker'
import { cn } from '@/lib/utils'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [datePreset, setDatePreset] = useState<DatePreset>('month')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)

  const range = useMemo(
    () => getDateRangeForPreset(datePreset, customRange),
    [datePreset, customRange]
  )

  function handlePresetChange(preset: DatePreset) {
    setDatePreset(preset)
    if (preset !== 'custom') setCustomRange(null)
  }

  const fetchBalance = useCallback(() => balanceService.obtenerBalance(), [])
  const fetchMetas = useCallback(() => metasService.obtenerMetas(), [])

  const fetchBalancePeriodo = useCallback(
    () =>
      range
        ? balanceService.obtenerBalancePorPeriodo(range.start, range.end)
        : balanceService.obtenerBalance(),
    [range]
  )

  const { data: balanceTotal, isLoading: loadingBalance } = useAsyncData(fetchBalance)
  const { data: metas, isLoading: loadingMetas } = useAsyncData(fetchMetas)
  const { data: balancePeriodo, isLoading: loadingPeriodo } = useAsyncData(fetchBalancePeriodo)

  if (loadingBalance || loadingMetas) {
    return <DashboardSkeleton />
  }

  const metasActivas = metas?.filter((m) => m.estado === 'ACTIVA') ?? []

  const periodoLabel = DATE_PRESET_LABELS[datePreset]
  const chartData = [
    {
      name: periodoLabel,
      Ingresos: balancePeriodo?.totalIngresos ?? 0,
      Gastos: balancePeriodo?.totalGastos ?? 0,
    },
  ]

  const displayName = user?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {getGreeting()},{' '}
            <span className="text-primary">{displayName}</span>
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Aquí está el resumen de tus finanzas
          </p>
        </div>
      </div>

      {/* Selector de período */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Período:</span>
        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-1">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetChange(preset)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
                datePreset === preset
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {DATE_PRESET_LABELS[preset]}
            </button>
          ))}
        </div>
        {datePreset === 'custom' && (
          <DateRangePicker
            value={customRange}
            onChange={setCustomRange}
            placeholder="Seleccionar rango de fechas"
          />
        )}
        {loadingPeriodo && (
          <span className="text-xs text-muted-foreground animate-pulse">Actualizando...</span>
        )}
      </div>

      {/* Stat cards — período seleccionado */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Ingresos"
          value={formatCurrency(balancePeriodo?.totalIngresos ?? 0)}
          icon={TrendingUp}
          trend="up"
          tooltip={`Total ingresos — ${periodoLabel}`}
        />
        <StatCard
          title="Gastos"
          value={formatCurrency(balancePeriodo?.totalGastos ?? 0)}
          icon={TrendingDown}
          trend="down"
          tooltip={`Total gastos — ${periodoLabel}`}
        />
        <StatCard
          title="Ahorros"
          value={formatCurrency(balancePeriodo?.totalAhorros ?? 0)}
          icon={PiggyBank}
          trend="neutral"
          tooltip={`Total ahorros — ${periodoLabel}`}
        />
        <StatCard
          title="Total Deudas"
          value={formatCurrency(balanceTotal?.totalDeudas ?? 0)}
          icon={HandCoins}
          trend="down"
          tooltip="Monto total pendiente de tus deudas activas"
        />
        <StatCard
          title="Disponible"
          value={formatCurrency(balancePeriodo?.dineroDisponible ?? balanceTotal?.dineroDisponible ?? 0)}
          icon={Wallet}
          trend={(balancePeriodo?.dineroDisponible ?? 0) >= 0 ? 'up' : 'down'}
          tooltip={`Ingresos − Gastos − Ahorros — ${periodoLabel}`}
        />
      </div>

      {/* Gráfico Ingresos vs Gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Gastos — {periodoLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => formatCurrency(value)}
                  width={90}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Ingresos" fill="oklch(0.55 0.17 155)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="oklch(0.577 0.245 27.325)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Metas activas */}
      {metasActivas.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-primary" />
            Metas activas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metasActivas.map((meta) => (
              <Card key={meta.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{meta.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(meta.montoActual)}</span>
                    <span>{formatCurrency(meta.montoObjetivo)}</span>
                  </div>
                  <Progress value={meta.porcentajeAvance} />
                  <p className="text-right text-sm font-semibold text-primary">
                    {meta.porcentajeAvance.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
