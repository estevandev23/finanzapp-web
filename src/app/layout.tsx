import type { Metadata } from "next"
import localFont from "next/font/local"
import { Toaster } from "sileo"
import { NextAuthProvider } from "@/shared/components/providers/next-auth-provider"
import "./globals.css"

const arimo = localFont({
  src: [
    { path: "./fonts/Arimo-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Arimo-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Arimo-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Arimo-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-arimo",
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
