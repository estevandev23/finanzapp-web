'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Smartphone,
  LogOut,
  UserCog,
  Tags,
  HandCoins,
  LineChart,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/features/auth/hooks/use-auth'

const FINANCE_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, tooltip: 'Resumen general' },
  { title: 'Ingresos', href: '/ingresos', icon: TrendingUp, tooltip: 'Gestiona tus ingresos' },
  { title: 'Gastos', href: '/gastos', icon: TrendingDown, tooltip: 'Gestiona tus gastos' },
  { title: 'Ahorros', href: '/ahorros', icon: PiggyBank, tooltip: 'Registra tus ahorros' },
  { title: 'Metas', href: '/metas', icon: Target, tooltip: 'Metas financieras' },
  { title: 'Deudas', href: '/deudas', icon: HandCoins, tooltip: 'Deudas y préstamos' },
  { title: 'Inversiones', href: '/inversiones', icon: LineChart, tooltip: 'Gestiona tus inversiones' },
]

const CONFIG_ITEMS = [
  { title: 'Dispositivos', href: '/dispositivos', icon: Smartphone, tooltip: 'Vincular WhatsApp' },
  { title: 'Categorías', href: '/categorias', icon: Tags, tooltip: 'Categorías personalizadas' },
  { title: 'Mi perfil', href: '/perfil', icon: UserCog, tooltip: 'Configuración de cuenta' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <PiggyBank className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">FinanzApp</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Finanzas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FINANCE_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.tooltip}</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CONFIG_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.tooltip}</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
            {user?.nombre?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <Link href="/perfil" className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.nombre || 'Usuario'}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar sesión</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
