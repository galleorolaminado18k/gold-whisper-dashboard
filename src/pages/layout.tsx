import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "GALLE - Administrador de Anuncios",
  description: "Gestiona tus campañas publicitarias con análisis inteligente",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        {children}
        <Link href="/analytics" className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="bg-gold hover:bg-gold-light shadow-lg">
            <BarChart3 className="w-5 h-5 mr-2" />
            Ver Gráficos con IA
          </Button>
        </Link>
      </body>
    </html>
  )
}
