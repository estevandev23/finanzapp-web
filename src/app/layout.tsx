import type { Metadata } from "next"
import { Arimo } from "next/font/google"
import { Toaster } from "sileo"
import { NextAuthProvider } from "@/shared/components/providers/next-auth-provider"
import "./globals.css"

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "FinanzApp - Finanzas personales inteligentes",
  description: "Gestiona tus ingresos, gastos, ahorros y metas financieras de forma inteligente",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${arimo.variable} font-sans antialiased`}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
