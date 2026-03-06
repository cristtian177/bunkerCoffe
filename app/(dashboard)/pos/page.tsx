"use client"

import { useState, useMemo } from "react"
import { useAuthStore, useCashStore, useDataStore, CartItem, Sale } from "@/lib/store"
import {
  ShoppingCart, Plus, Minus, Trash2, X, Printer,
  Check, Search, CreditCard, Banknote, Loader2, Receipt, Clock, AlertCircle, Coffee
} from "lucide-react"

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

// Receipt Modal
function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const printReceipt = () => {
    const w = window.open("", "_blank", "width=360,height=600")
    if (!w) return
    w.document.write(`
      <html><head><title>Recibo ${sale.sale_number}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; max-width: 280px; margin: 0 auto; color: #000; }
        .header { text-align: center; margin-bottom: 16px; }
        .header h1 { font-size: 18px; margin-bottom: 4px; }
        .header p { font-size: 10px; color: #666; }
        .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
        .info { font-size: 11px; margin-bottom: 8px; }
        .info span { display: block; margin-bottom: 2px; }
        .items { margin: 12px 0; }
        .item { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; }
        .item-name { flex: 1; }
        .totals { margin-top: 12px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .total-row.main { font-size: 16px; font-weight: bold; margin-top: 8px; }
        .payments { margin-top: 12px; font-size: 11px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
      </style></head><body>
      <div class="header">
        <h1>COFFEE BUNKER</h1>
        <p>Cafeteria Fitness</p>
      </div>
      <div class="divider"></div>
      <div class="info">
        <span><strong>Recibo:</strong> ${sale.sale_number}</span>
        <span><strong>Fecha:</strong> ${new Date(sale.created_at).toLocaleString("es-CO")}</span>
        <span><strong>Atendio:</strong> ${sale.user_name}</span>
      </div>
      <div class="divider"></div>
      <div class="items">
        ${sale.items.map(i => `
          <div class="item">
            <span class="item-name">${i.quantity}x ${i.product_name}</span>
            <span>${Number(i.subtotal).toLocaleString("es-CO")}</span>
          </div>
        `).join("")}
      </div>
      <div class="divider"></div>
      <div class="totals">
        ${sale.discount > 0 ? `
          <div class="total-row">
            <span>Descuento:</span>
            <span>-${Number(sale.discount).toLocaleString("es-CO")}</span>
          </div>
        ` : ""}
        <div class="total-row main">
          <span>TOTAL:</span>
          <span>$${Number(sale.total).toLocaleString("es-CO")}</span>
        </div>
      </div>
      <div class="divider"></div>
      <div class="payments">
        ${sale.payments.map(p => `
          <div class="total-row">
            <span>${p.method_name}:</span>
            <span>$${Number(p.amount).toLocaleString("es-CO")}</span>
          </div>
        `).join("")}
        ${sale.change > 0 ? `
          <div class="total-row" style="font-weight: bold; margin-top: 8px;">
            <span>Cambio:</span>
            <span>$${Number(sale.change).toLocaleString("es-CO")}</span>
          </div>
        ` : ""}
      </div>
      <div class="divider"></div>
      <div class="footer">
        <p>Gracias por tu compra!</p>
        <p>Keep pushing!</p>
      </div>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        {/* Success Header */}
        <div className="bg-[var(--color-success)] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Check size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Venta Exitosa</h3>
          <p className="text-white/80 text-sm mt-1">{sale.sale_number}</p>
        </div>

        {/* Receipt Content */}
        <div className="p-5 space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">{item.quantity}x {item.product_name}</span>
                <span className="text-[var(--color-text-primary)]">{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* Totals */}
          <div className="space-y-2">
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-warning)]">Descuento</span>
                <span className="text-[var(--color-warning)]">-{formatMoney(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span className="text-[var(--color-text-primary)]">Total</span>
              <span className="text-[var(--color-primary)]">{formatMoney(sale.total)}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Payments */}
          <div className="space-y-2">
            {sale.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">{p.method_name}</span>
                <span className="text-[var(--color-text-secondary)]">{formatMoney(p.amount)}</span>
              </div>
            ))}
            {sale.change > 0 && (
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[var(--color-warning)]">Cambio</span>
                <span className="text-[var(--color-warning)]">{formatMoney(sale.change)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={printReceipt} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Printer size={18} />
            <span>Imprimir</span>
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  )
}

// Payment Modal
function PaymentModal({
  cart,
  total,
  discount,
  onConfirm,
  onClose,
}: {
  cart: CartItem[]
  total: number
  discount: number
  onConfirm: (payments: { payment_method_id: number; amount: number }[], discount: number) => Promise<void>
  onClose: () => void
}) {
  const paymentMethods = useDataStore(state => state.getPaymentMethods())
  const [payments, setPayments] = useState<{ payment_method_id: number; method_name: string; amount: number }[]>([])
  const [selectedMethod, setSelectedMethod] = useState<typeof paymentMethods[0] | null>(null)
  const [loading, setLoading] = useState(false)

  const finalTotal = total - discount
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const remaining = finalTotal - totalPaid

  // Auto-select cash on mount
  useState(() => {
    const cash = paymentMethods.find(m => m.name.toLowerCase().includes("efectivo"))
    if (cash) {
      setSelectedMethod(cash)
      setPayments([{ payment_method_id: cash.id, method_name: cash.name, amount: finalTotal }])
    }
  })

  function addPayment() {
    if (!selectedMethod || payments.find(p => p.payment_method_id === selectedMethod.id)) return
    setPayments([...payments, {
      payment_method_id: selectedMethod.id,
      method_name: selectedMethod.name,
      amount: remaining > 0 ? remaining : 0
    }])
  }

  function updateAmount(idx: number, amount: string) {
    const updated = [...payments]
    updated[idx].amount = parseFloat(amount) || 0
    setPayments(updated)
  }

  function removePayment(idx: number) {
    setPayments(payments.filter((_, i) => i !== idx))
  }

  async function handleConfirm() {
    setLoading(true)
    await onConfirm(payments.map(p => ({ payment_method_id: p.payment_method_id, amount: p.amount })), discount)
    setLoading(false)
  }

  const getMethodIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("efectivo") || lower.includes("cash")) return Banknote
    return CreditCard
  }

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Metodo de Pago</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{cart.length} productos</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Total Display */}
          <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Total a cobrar</p>
            <p className="text-4xl font-bold text-[var(--color-primary)]">{formatMoney(finalTotal)}</p>
          </div>

          {/* Method Selector */}
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Seleccionar metodo</p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(m => {
                const Icon = getMethodIcon(m.name)
                const isSelected = selectedMethod?.id === m.id
                const isAdded = payments.find(p => p.payment_method_id === m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => !isAdded && setSelectedMethod(m)}
                    disabled={!!isAdded}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isAdded
                        ? "bg-[var(--color-success-muted)] text-[var(--color-success)] cursor-default"
                        : isSelected
                          ? "bg-[var(--color-primary)] text-[#0a0a0a]"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
                    }`}
                  >
                    <Icon size={18} />
                    {m.name}
                    {isAdded && <Check size={14} className="ml-auto" />}
                  </button>
                )
              })}
            </div>
            {selectedMethod && !payments.find(p => p.payment_method_id === selectedMethod.id) && (
              <button onClick={addPayment} className="btn-secondary w-full mt-3 text-sm">
                <Plus size={16} className="inline mr-2" />
                Agregar {selectedMethod.name}
              </button>
            )}
          </div>

          {/* Payment Lines */}
          {payments.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Pagos</p>
              {payments.map((p, i) => {
                const Icon = getMethodIcon(p.method_name)
                return (
                  <div key={i} className="flex items-center gap-3 bg-[var(--color-bg-tertiary)] rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center">
                      <Icon size={18} className="text-[var(--color-text-muted)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)] w-24">{p.method_name}</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                      <input
                        type="number"
                        value={p.amount}
                        onChange={e => updateAmount(i, e.target.value)}
                        className="input-field pl-7 py-2 text-right font-medium"
                      />
                    </div>
                    <button
                      onClick={() => removePayment(i)}
                      className="w-9 h-9 rounded-lg bg-[var(--color-danger-muted)] text-[var(--color-danger)] flex items-center justify-center hover:bg-[var(--color-danger)] hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              })}

              {/* Summary */}
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Total pagado</span>
                  <span className={`font-semibold ${totalPaid >= finalTotal ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    {formatMoney(totalPaid)}
                  </span>
                </div>
                {remaining > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-danger)]">Falta</span>
                    <span className="text-[var(--color-danger)] font-semibold">{formatMoney(remaining)}</span>
                  </div>
                )}
                {totalPaid > finalTotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-warning)]">Cambio</span>
                    <span className="text-[var(--color-warning)] font-semibold">{formatMoney(totalPaid - finalTotal)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={payments.length === 0 || totalPaid < finalTotal || loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Open Cash Modal
function OpenCashModal({ onOpen }: { onOpen: (amount: number) => void }) {
  const [amount, setAmount] = useState("")

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="card max-w-md w-full text-center animate-slide-up">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-warning-muted)] flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-[var(--color-warning)]" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">Caja Cerrada</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Para comenzar a vender, debes abrir la caja registradora
        </p>

        <div className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Monto Inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="input-field pl-8 text-lg"
              />
            </div>
          </div>

          <button
            onClick={() => onOpen(parseFloat(amount) || 0)}
            className="btn-primary w-full py-3"
          >
            Abrir Caja
          </button>
        </div>
      </div>
    </div>
  )
}

// Main POS Component
export default function POSPage() {
  const user = useAuthStore(state => state.user)
  const { isOpen, openCash, addSale: addCashSale } = useCashStore()
  const { products, getCategories, addSale } = useDataStore()
  const categories = getCategories()

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [receipt, setReceipt] = useState<Sale | null>(null)

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = !activeCategory || p.category_name === activeCategory
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch && p.available
    })
  }, [products, activeCategory, searchTerm])

  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0)
  const total = subtotal
  const itemCount = cart.reduce((s, c) => s + c.qty, 0)

  function addToCart(product: typeof products[0]) {
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  function updateQty(id: number, delta: number) {
    setCart(cart.map(c => {
      if (c.id !== id) return c
      const newQty = c.qty + delta
      return newQty > 0 ? { ...c, qty: newQty } : c
    }).filter(c => c.qty > 0))
  }

  function removeFromCart(id: number) {
    setCart(cart.filter(c => c.id !== id))
  }

  function clearCart() {
    setCart([])
    setDiscount(0)
  }

  async function handleConfirmSale(payments: { payment_method_id: number; amount: number }[], disc: number) {
    if (!user) return
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
    const finalTotal = total - disc
    const sale = addSale({
      total: finalTotal,
      discount: disc,
      change: totalPaid - finalTotal,
      items: cart
    }, user, payments)
    addCashSale(finalTotal)
    setReceipt(sale)
    setCart([])
    setDiscount(0)
    setShowPayment(false)
  }

  if (!isOpen) {
    return <OpenCashModal onOpen={openCash} />
  }

  return (
    <div className="flex h-full">
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search */}
        <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-11 py-2.5"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Clock size={16} />
              <span>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`category-pill ${!activeCategory ? "category-pill-active" : "category-pill-inactive"}`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`category-pill ${activeCategory === cat.name ? "category-pill-active" : "category-pill-inactive"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(product => {
              const inCart = cart.find(c => c.id === product.id)
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="card product-card text-left relative"
                >
                  {inCart && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--color-primary)] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
                      {inCart.qty}
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-3">
                    <Coffee size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="font-medium text-[var(--color-text-primary)] text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">{product.category_name}</p>
                  <p className="font-bold text-[var(--color-primary)]">{formatMoney(product.price)}</p>
                </button>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Search size={48} className="text-[var(--color-text-muted)] mb-4" />
              <p className="text-[var(--color-text-secondary)]">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col">
        {/* Cart Header */}
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-[var(--color-primary)]" />
              <h2 className="font-semibold text-[var(--color-text-primary)]">Orden Actual</h2>
              {itemCount > 0 && (
                <span className="badge badge-primary">{itemCount}</span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="btn-ghost text-xs text-[var(--color-danger)]">
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-[var(--color-text-muted)]" />
              </div>
              <p className="text-[var(--color-text-secondary)] mb-1">Carrito vacio</p>
              <p className="text-sm text-[var(--color-text-muted)]">Selecciona productos para agregar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--color-text-primary)] text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatMoney(item.price)} c/u</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="qty-btn">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium text-[var(--color-text-primary)]">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="qty-btn">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatMoney(item.price * item.qty)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[var(--color-border)] space-y-4">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Descuento"
                value={discount || ""}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="input-field py-2 text-sm flex-1"
              />
              <span className="text-sm text-[var(--color-text-muted)]">COP</span>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="text-[var(--color-text-secondary)]">{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-warning)]">Descuento</span>
                  <span className="text-[var(--color-warning)]">-{formatMoney(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-text-primary)]">Total</span>
                <span className="text-[var(--color-primary)]">{formatMoney(total - discount)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={() => setShowPayment(true)}
              className="btn-primary w-full py-3 text-base animate-pulse-glow"
            >
              Cobrar {formatMoney(total - discount)}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          total={total}
          discount={discount}
          onConfirm={handleConfirmSale}
          onClose={() => setShowPayment(false)}
        />
      )}

      {receipt && (
        <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  )
}
