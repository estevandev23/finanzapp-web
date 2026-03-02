import { PiggyBank, TrendingUp, TrendingDown, Wallet, BarChart3, ShieldCheck, MessageCircle } from 'lucide-react'
import { AuthProvider } from '@/features/auth/hooks/use-auth'

const features = [
  { icon: BarChart3, label: 'Seguimiento de ingresos y gastos en tiempo real' },
  { icon: ShieldCheck, label: 'Autenticacion segura con verificacion en dos pasos' },
  { icon: MessageCircle, label: 'Consultas por WhatsApp con inteligencia artificial' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        {/* Panel izquierdo — branding + preview del producto */}
        <div className="hidden lg:flex lg:w-[45%] flex-col bg-primary text-primary-foreground p-10 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
              <PiggyBank className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">FinanzApp</span>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-10">
            <div>
              <h2 className="text-4xl font-bold leading-[1.15] tracking-tight">
                Tu dinero,<br />bajo control.
              </h2>
              <p className="mt-4 text-primary-foreground/65 leading-relaxed">
                Gestiona ingresos, gastos, ahorros y metas financieras con ayuda de inteligencia artificial.
              </p>
            </div>

            {/* Mini preview con datos de muestra */}
            <div className="space-y-3">
              <div className="rounded-2xl bg-primary-foreground/10 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-foreground/60">Ingresos del mes</span>
                  <TrendingUp className="h-4 w-4 text-green-300" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight">$4.250.000</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-primary-foreground/10 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-primary-foreground/60">Gastos</span>
                    <TrendingDown className="h-3 w-3 text-red-300" />
                  </div>
                  <p className="text-xl font-bold">$1.870.000</p>
                </div>
                <div className="rounded-2xl bg-primary-foreground/10 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-primary-foreground/60">Disponible</span>
                    <Wallet className="h-3 w-3 text-primary-foreground/60" />
                  </div>
                  <p className="text-xl font-bold">$2.380.000</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                    <feature.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-primary-foreground/75 leading-snug">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-primary-foreground/30">Proyecto de grado · 2025</p>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </AuthProvider>
  )
}
