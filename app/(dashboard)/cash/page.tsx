"use client"

import { useState } from "react"
import { useCashStore, useDataStore } from "@/lib/store"
import { DollarSign, Clock, TrendingUp, Lock, Unlock, AlertCircle, Check, X, Receipt } from "lucide-react"

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

export default function CashPage() {
  const { isOpen, initialAmount, currentAmount, openedAt, openCash, closeCash } = useCashStore()
  const { sales } = useDataStore()
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.created_at).toDateString()
    const today = new Date().toDateString()
    return saleDate === today
  })

  const salesTotal = todaySales.reduce((s, sale) => s + sale.total, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Caja Registradora</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Control de apertura y cierre de caja</p>
          </div>
          {isOpen ? (
            <button onClick={() => setShowCloseModal(true)} className="btn-danger flex items-center gap-2">
              <Lock size={18} />
              Cerrar Caja
            </button>
          ) : (
            <button onClick={() => setShowOpenModal(true)} className="btn-primary flex items-center gap-2">
              <Unlock size={18} />
              Abrir Caja
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Status Card */}
        <div className={`card mb-6 border-2 ${isOpen ? "border-[var(--color-success)]" : "border-[var(--color-danger)]"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isOpen ? "bg-[var(--color-success-muted)]" : "bg-[var(--color-danger-muted)]"
            }`}>
              {isOpen ? (
                <Unlock size={32} className="text-[var(--color-success)]" />
              ) : (
                <Lock size={32} className="text-[var(--color-danger)]" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Caja {isOpen ? "Abierta" : "Cerrada"}
              </h2>
              {isOpen && openedAt && (
                <p className="text-[var(--color-text-muted)] flex items-center gap-2 mt-1">
                  <Clock size={14} />
                  Abierta desde: {new Date(openedAt).toLocaleString("es-CO")}
                </p>
              )}
            </div>
            <div className={`status-dot ${isOpen ? "status-dot-success" : "status-dot-danger"}`} />
          </div>
        </div>

        {/* Stats */}
        {isOpen && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-info-muted)] flex items-center justify-center">
                  <DollarSign size={24} className="text-[var(--color-info)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Monto Inicial</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatMoney(initialAmount)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center">
                  <TrendingUp size={24} className="text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Ventas del Dia</p>
                  <p className="text-2xl font-bold text-[var(--color-success)]">{formatMoney(salesTotal)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center">
                  <DollarSign size={24} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">En Caja</p>
                  <p className="text-2xl font-bold text-[var(--color-primary)]">{formatMoney(currentAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Sales */}
        <div className="card">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Receipt size={20} className="text-[var(--color-primary)]" />
            Ventas de Hoy
          </h3>
          {todaySales.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mx-auto mb-4">
                <Receipt size={32} className="text-[var(--color-text-muted)]" />
              </div>
              <p className="text-[var(--color-text-muted)]">No hay ventas registradas hoy</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {todaySales.slice().reverse().map(sale => (
                <div key={sale.id} className="bg-[var(--color-bg-tertiary)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[var(--color-primary)]">{sale.sale_number}</span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {new Date(sale.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {sale.items.length} productos - {sale.user_name}
                    </span>
                    <span className="font-bold text-[var(--color-text-primary)]">{formatMoney(sale.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Open Modal */}
      {showOpenModal && (
        <OpenCashModal
          onClose={() => setShowOpenModal(false)}
          onOpen={(amount) => {
            openCash(amount)
            setShowOpenModal(false)
          }}
        />
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <CloseCashModal
          currentAmount={currentAmount}
          initialAmount={initialAmount}
          salesTotal={salesTotal}
          onClose={() => setShowCloseModal(false)}
          onConfirm={() => {
            closeCash()
            setShowCloseModal(false)
          }}
        />
      )}
    </div>
  )
}

function OpenCashModal({ onClose, onOpen }: { onClose: () => void; onOpen: (amount: number) => void }) {
  const [amount, setAmount] = useState("")

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Abrir Caja</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-[var(--color-info-muted)] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-[var(--color-info)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-info)]">
              Ingresa el monto con el que inicias la caja. Este valor se usara para calcular las ventas del dia.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Monto Inicial</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input-field pl-8 text-lg"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => onOpen(parseFloat(amount) || 0)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Unlock size={18} />
            Abrir Caja
          </button>
        </div>
      </div>
    </div>
  )
}

function CloseCashModal({
  currentAmount,
  initialAmount,
  salesTotal,
  onClose,
  onConfirm,
}: {
  currentAmount: number
  initialAmount: number
  salesTotal: number
  onClose: () => void
  onConfirm: () => void
}) {
  const [counted, setCounted] = useState("")
  const countedAmount = parseFloat(counted) || 0
  const expectedAmount = currentAmount
  const difference = countedAmount - expectedAmount

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Cerrar Caja</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Monto inicial</span>
              <span className="text-[var(--color-text-secondary)]">{formatMoney(initialAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Ventas del dia</span>
              <span className="text-[var(--color-success)]">+{formatMoney(salesTotal)}</span>
            </div>
            <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
              <span className="font-medium text-[var(--color-text-primary)]">Esperado en caja</span>
              <span className="font-bold text-[var(--color-primary)]">{formatMoney(expectedAmount)}</span>
            </div>
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Monto Contado</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
              <input
                type="number"
                value={counted}
                onChange={e => setCounted(e.target.value)}
                className="input-field pl-8 text-lg"
                placeholder="0"
              />
            </div>
          </div>

          {/* Difference */}
          {counted && (
            <div className={`rounded-xl p-4 ${
              difference === 0
                ? "bg-[var(--color-success-muted)]"
                : difference > 0
                  ? "bg-[var(--color-warning-muted)]"
                  : "bg-[var(--color-danger-muted)]"
            }`}>
              <div className="flex items-center justify-between">
                <span className={
                  difference === 0
                    ? "text-[var(--color-success)]"
                    : difference > 0
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--color-danger)]"
                }>
                  {difference === 0 ? "Cuadre perfecto" : difference > 0 ? "Sobrante" : "Faltante"}
                </span>
                <span className={`font-bold ${
                  difference === 0
                    ? "text-[var(--color-success)]"
                    : difference > 0
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--color-danger)]"
                }`}>
                  {difference > 0 ? "+" : ""}{formatMoney(difference)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={onConfirm} className="btn-danger flex-1 flex items-center justify-center gap-2">
            <Lock size={18} />
            Cerrar Caja
          </button>
        </div>
      </div>
    </div>
  )
}
