"use client"

import { useState } from "react"
import { useDataStore } from "@/lib/store"
import { Package, Plus, Search, Edit2, Trash2, X, Check, Coffee, Zap, Cookie, Droplet, Cake } from "lucide-react"

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

const categoryIcons: Record<string, typeof Coffee> = {
  "Bebidas Calientes": Coffee,
  "Bebidas Frias": Droplet,
  "Snacks Fitness": Cookie,
  "Suplementos": Zap,
  "Postres": Cake,
}

export default function ProductsPage() {
  const { products, getCategories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useDataStore()
  const categories = getCategories()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editProduct, setEditProduct] = useState<typeof products[0] | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const filtered = products.filter(p => {
    const matchesCategory = !activeCategory || p.category_id === activeCategory
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Productos</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Gestiona el menu de tu cafeteria</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCategoryModal(true)} className="btn-secondary flex items-center gap-2">
              <Plus size={18} />
              Categoria
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Producto
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`category-pill ${!activeCategory ? "category-pill-active" : "category-pill-inactive"}`}
          >
            Todos ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category_id === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-pill ${activeCategory === cat.id ? "category-pill-active" : "category-pill-inactive"}`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(product => {
            const Icon = categoryIcons[product.category_name] || Package
            return (
              <div key={product.id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    product.available ? "bg-[var(--color-bg-tertiary)]" : "bg-[var(--color-danger-muted)]"
                  }`}>
                    <Icon size={24} className={product.available ? "text-[var(--color-primary)]" : "text-[var(--color-danger)]"} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditProduct(product)} className="btn-ghost p-2">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="btn-ghost p-2 text-[var(--color-danger)]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-1">{product.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-2">{product.category_name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-primary)]">{formatMoney(product.price)}</span>
                  <span className={`badge ${product.available ? "badge-success" : "badge-danger"}`}>
                    {product.available ? "Disponible" : "Agotado"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            addProduct(data)
            setShowAddModal(false)
          }}
        />
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSave={(data) => {
            updateProduct(editProduct.id, data)
            setEditProduct(null)
          }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onAdd={addCategory}
          onDelete={deleteCategory}
        />
      )}
    </div>
  )
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product?: { id: number; name: string; price: number; category_id: number; available: boolean }
  categories: { id: number; name: string }[]
  onClose: () => void
  onSave: (data: { name: string; price: number; category_id: number; category_name: string; available: boolean }) => void
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price || 0,
    category_id: product?.category_id || categories[0]?.id || 0,
    available: product?.available ?? true,
  })

  const selectedCategory = categories.find(c => c.id === form.category_id)

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h3>
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
              placeholder="Nombre del producto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Precio</label>
              <input
                type="number"
                value={form.price || ""}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Categoria</label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) })}
                className="input-field"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`w-12 h-6 rounded-full transition-colors ${
                form.available ? "bg-[var(--color-success)]" : "bg-[var(--color-bg-tertiary)]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                form.available ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {form.available ? "Disponible" : "No disponible"}
            </span>
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={() => onSave({
              ...form,
              category_name: selectedCategory?.name || ""
            })}
            disabled={!form.name || !form.price}
            className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryModal({
  categories,
  onClose,
  onAdd,
  onDelete,
}: {
  categories: { id: number; name: string }[]
  onClose: () => void
  onAdd: (name: string) => void
  onDelete: (id: number) => void
}) {
  const [newCategory, setNewCategory] = useState("")

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Categorias</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Add new */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="input-field flex-1"
              placeholder="Nueva categoria"
            />
            <button
              onClick={() => {
                if (newCategory.trim()) {
                  onAdd(newCategory.trim())
                  setNewCategory("")
                }
              }}
              className="btn-primary"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-64 overflow-auto">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between bg-[var(--color-bg-tertiary)] rounded-xl px-4 py-3">
                <span className="text-[var(--color-text-primary)]">{cat.name}</span>
                <button
                  onClick={() => onDelete(cat.id)}
                  className="btn-ghost p-2 text-[var(--color-danger)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={onClose} className="btn-secondary w-full">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
