"use client"

import { useState } from "react"
import { useAuthStore, useDataStore, useCashStore } from "@/lib/store"
import { Settings, Users, CreditCard, Store, Shield, Trash2, Plus, X, Check } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const user = useAuthStore(state => state.user)

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "payments", label: "Metodos de Pago", icon: CreditCard },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "data", label: "Datos", icon: Shield },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Configuracion</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Administra la configuracion del sistema</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tabs */}
        <div className="w-64 border-r border-[var(--color-border)] p-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item w-full ${activeTab === tab.id ? "nav-item-active" : "nav-item-inactive"}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "payments" && <PaymentSettings />}
          {activeTab === "users" && <UserSettings isAdmin={user?.role === "admin"} />}
          {activeTab === "data" && <DataSettings />}
        </div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Informacion del Negocio</h2>
      
      <div className="card space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Nombre del Negocio</label>
          <input type="text" defaultValue="Coffee Bunker" className="input-field" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Direccion</label>
          <input type="text" placeholder="Direccion del local" className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Telefono</label>
            <input type="text" placeholder="Telefono de contacto" className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">NIT</label>
            <input type="text" placeholder="Numero de identificacion" className="input-field" />
          </div>
        </div>
        <button className="btn-primary">Guardar Cambios</button>
      </div>
    </div>
  )
}

function PaymentSettings() {
  const { paymentMethods } = useDataStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newMethod, setNewMethod] = useState("")

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Metodos de Pago</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Agregar
        </button>
      </div>

      <div className="space-y-3">
        {paymentMethods.map(method => (
          <div key={method.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-text-primary)]">{method.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${method.active ? "badge-success" : "badge-danger"}`}>
                {method.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content w-full max-w-md animate-slide-up">
            <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Nuevo Metodo de Pago</h3>
              <button onClick={() => setShowAdd(false)} className="btn-ghost p-2"><X size={20} /></button>
            </div>
            <div className="p-5">
              <input
                type="text"
                value={newMethod}
                onChange={e => setNewMethod(e.target.value)}
                className="input-field"
                placeholder="Nombre del metodo"
              />
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => setShowAdd(false)} className="btn-primary flex-1">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserSettings({ isAdmin }: { isAdmin: boolean }) {
  const MOCK_USERS = [
    { id: 1, username: "admin", name: "Administrador", role: "admin" },
    { id: 2, username: "cajero", name: "Juan Cajero", role: "cashier" },
  ]

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Acceso Restringido</h2>
        <p className="text-[var(--color-text-muted)]">Solo los administradores pueden gestionar usuarios</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Usuarios del Sistema</h2>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Agregar Usuario
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_USERS.map(user => (
          <div key={user.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center text-[var(--color-primary)] font-semibold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{user.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">@{user.username}</p>
              </div>
            </div>
            <span className={`badge ${user.role === "admin" ? "badge-primary" : "badge-info"}`}>
              {user.role === "admin" ? "Administrador" : "Cajero"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataSettings() {
  const clearAllData = () => {
    if (confirm("Esta seguro de que desea eliminar todos los datos? Esta accion no se puede deshacer.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Gestion de Datos</h2>

      <div className="card border-[var(--color-danger)] bg-[var(--color-danger-muted)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-danger)]/20 flex items-center justify-center">
            <Trash2 size={24} className="text-[var(--color-danger)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--color-danger)] mb-1">Zona de Peligro</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Eliminar todos los datos del sistema. Esta accion reiniciara las ventas, inventario y configuraciones a sus valores por defecto. No se puede deshacer.
            </p>
            <button onClick={clearAllData} className="btn-danger">
              Eliminar Todos los Datos
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Informacion del Sistema</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Version</span>
            <span className="text-[var(--color-text-secondary)]">2.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Almacenamiento</span>
            <span className="text-[var(--color-text-secondary)]">LocalStorage</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Framework</span>
            <span className="text-[var(--color-text-secondary)]">Next.js 15</span>
          </div>
        </div>
      </div>
    </div>
  )
}
