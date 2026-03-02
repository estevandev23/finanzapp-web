'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/shared/components/layout/app-sidebar'
import { AuthProvider } from '@/features/auth/hooks/use-auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
              <SidebarTrigger />
              <span className="font-semibold">FinanzApp</span>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  )
}
