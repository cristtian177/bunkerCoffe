"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import {
  ShoppingCart,
  Package,
  Box,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Coffee,
} from "lucide-react"

const navItems = [
  { href: "/pos", label: "Punto de Venta", icon: ShoppingCart },
  { href: "/inventory", label: "Inventario", icon: Box },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/cash", label: "Caja", icon: DollarSign },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/settings", label: "Configuracion", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <Coffee size={20} className="text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[var(--color-text-primary)]">Coffee Bunker</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Sistema POS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-primary)] font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {user?.name || "Usuario"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] capitalize">
              {user?.role === "admin" ? "Administrador" : "Cajero"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full flex items-center justify-center gap-2 text-sm text-[var(--color-danger)]"
        >
          <LogOut size={16} />
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </aside>
  )
}
