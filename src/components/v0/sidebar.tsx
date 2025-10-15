"use client"

import { cn } from "@/v0/lib/utils"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ShoppingCart,
  FileText,
  Package,
  CreditCard,
  UserCircle,
  Cake,
  MapPin,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "CRM", icon: Users, href: "#" },
  { name: "Publicidad", icon: TrendingUp, href: "/" },
  { name: "Ventas", icon: ShoppingCart, href: "#" },
  { name: "Facturación", icon: FileText, href: "#" },
  { name: "Entregas", icon: Package, href: "#" },
  { name: "Pagos", icon: CreditCard, href: "#" },
  { name: "Clientes", icon: UserCircle, href: "#" },
  { name: "Cumpleaños", icon: Cake, href: "#" },
  { name: "Geografía", icon: MapPin, href: "#" },
  { name: "Configuración", icon: Settings, href: "#" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-80 bg-[#0a0a0a] flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-center w-full h-28 rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
          <h1
            className="text-6xl font-black tracking-[0.2em] bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#d97706] bg-clip-text text-transparent"
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.15em",
            }}
          >
            GALLE
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="mb-3 px-2">
          <h2 className="text-sm font-semibold text-[#f59e0b] tracking-wide">Navegación</h2>
        </div>

        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href && item.name === "Publicidad"
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-normal transition-all duration-200",
                isActive
                  ? "bg-[#78350f]/30 text-[#fbbf24] border border-[#78350f]/50 shadow-lg shadow-[#78350f]/20"
                  : "text-[#fbbf24] hover:bg-[#78350f]/20 hover:border hover:border-[#78350f]/30",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#f59e0b] tracking-wide">Sistema de Gestión</span>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-lg shadow-[#f59e0b]/30">
            <span className="text-lg font-bold text-black">U</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
