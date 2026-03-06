"use client"

import { useState } from "react"
import { useDataStore } from "@/lib/store"
import { Box, Plus, Search, AlertTriangle, Package, Edit2, X, Check, ArrowUpDown } from "lucide-react"

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

export default function InventoryPage() {
  const { inventory, updateInventoryItem, addInventoryItem } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState<typeof inventory[0] | null>(null)

  const filtered = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = inventory.filter(i => i.quantity <= i.min_stock).length
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.cost, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Inventario</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Gestiona los insumos de tu cafeteria</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Agregar Insumo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-info-muted)] flex items-center justify-center">
                <Box size={20} className="text-[var(--color-info)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Total Items</p>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">{inventory.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-muted)] flex items-center justify-center">
                <AlertTriangle size={20} className="text-[var(--color-warning)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Stock Bajo</p>
                <p className="text-xl font-bold text-[var(--color-warning)]">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center">
                <Package size={20} className="text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Valor Total</p>
                <p className="text-xl font-bold text-[var(--color-success)]">{formatMoney(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="table-header pb-4 pl-4">Insumo</th>
              <th className="table-header pb-4">Cantidad</th>
              <th className="table-header pb-4">Unidad</th>
              <th className="table-header pb-4">Min. Stock</th>
              <th className="table-header pb-4">Costo Unit.</th>
              <th className="table-header pb-4">Valor Total</th>
              <th className="table-header pb-4 text-right pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.quantity <= item.min_stock
              return (
                <tr key={item.id} className="table-row">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isLow ? "bg-[var(--color-warning-muted)]" : "bg-[var(--color-bg-tertiary)]"
                      }`}>
                        <Box size={18} className={isLow ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]"} />
                      </div>
                      <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`font-semibold ${isLow ? "text-[var(--color-warning)]" : "text-[var(--color-text-primary)]"}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-4 text-[var(--color-text-secondary)]">{item.unit}</td>
                  <td className="py-4 text-[var(--color-text-muted)]">{item.min_stock}</td>
                  <td className="py-4 text-[var(--color-text-secondary)]">{formatMoney(item.cost)}</td>
                  <td className="py-4 font-medium text-[var(--color-text-primary)]">{formatMoney(item.quantity * item.cost)}</td>
                  <td className="py-4 pr-4 text-right">
                    <button
                      onClick={() => setEditItem(item)}
                      className="btn-ghost p-2"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={(item) => {
            addInventoryItem(item)
            setShowAddModal(false)
          }}
        />
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={(data) => {
            updateInventoryItem(editItem.id, data)
            setEditItem(null)
          }}
        />
      )}
    </div>
  )
}

function AddItemModal({ onClose, onAdd }: { 
  onClose: () => void
  onAdd: (item: { name: string; unit: string; quantity: number; min_stock: number; cost: number }) => void 
}) {
  const [form, setForm] = useState({ name: "", unit: "", quantity: 0, min_stock: 0, cost: 0 })

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Nuevo Insumo</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Nombre del insumo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Unidad</label>
              <input
                type="text"
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="input-field"
                placeholder="kg, L, unidad"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Cantidad</label>
              <input
                type="number"
                value={form.quantity || ""}
                onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Stock Minimo</label>
              <input
                type="number"
                value={form.min_stock || ""}
                onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Costo Unitario</label>
              <input
                type="number"
                value={form.cost || ""}
                onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={() => onAdd(form)}
            disabled={!form.name || !form.unit}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function EditItemModal({ item, onClose, onSave }: {
  item: { id: number; name: string; unit: string; quantity: number; min_stock: number; cost: number }
  onClose: () => void
  onSave: (data: Partial<typeof item>) => void
}) {
  const [form, setForm] = useState(item)
  const [adjustment, setAdjustment] = useState(0)

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Editar Insumo</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Quick Adjustment */}
          <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-4">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Ajuste Rapido de Cantidad</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={adjustment || ""}
                onChange={e => setAdjustment(parseFloat(e.target.value) || 0)}
                className="input-field flex-1"
                placeholder="Cantidad a ajustar"
              />
              <button
                onClick={() => {
                  setForm({ ...form, quantity: form.quantity + adjustment })
                  setAdjustment(0)
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowUpDown size={16} />
                Aplicar
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Usa numeros positivos para agregar, negativos para reducir
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Cantidad Actual</label>
              <input
                type="number"
                value={form.quantity || ""}
                onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Stock Minimo</label>
              <input
                type="number"
                value={form.min_stock || ""}
                onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Costo Unitario</label>
            <input
              type="number"
              value={form.cost || ""}
              onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
              className="input-field"
            />
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => onSave(form)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Check size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
