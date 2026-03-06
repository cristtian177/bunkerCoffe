"use client"

import { useMemo } from "react"
import { useDataStore } from "@/lib/store"
import { BarChart3, TrendingUp, ShoppingCart, Package, AlertTriangle, DollarSign, Coffee } from "lucide-react"

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

export default function ReportsPage() {
  const { sales, products, inventory } = useDataStore()

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === today)
    
    const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0)
    const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0)
    const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0
    
    // Product ranking
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 }
        }
        productSales[item.product_name].qty += item.quantity
        productSales[item.product_name].revenue += item.subtotal
      })
    })
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Low stock items
    const lowStock = inventory.filter(i => i.quantity <= i.min_stock)

    return {
      totalSales: sales.length,
      todaySales: todaySales.length,
      totalRevenue,
      todayRevenue,
      avgTicket,
      topProducts,
      lowStock,
      activeProducts: products.filter(p => p.available).length,
    }
  }, [sales, products, inventory])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Reportes</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Analisis y metricas de tu negocio</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center">
                <DollarSign size={24} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Ventas Totales</p>
                <p className="text-2xl font-bold text-[var(--color-primary)]">{formatMoney(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center">
                <TrendingUp size={24} className="text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Ventas Hoy</p>
                <p className="text-2xl font-bold text-[var(--color-success)]">{formatMoney(stats.todayRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-info-muted)] flex items-center justify-center">
                <ShoppingCart size={24} className="text-[var(--color-info)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Transacciones</p>
                <p className="text-2xl font-bold text-[var(--color-info)]">{stats.totalSales}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-muted)] flex items-center justify-center">
                <BarChart3 size={24} className="text-[var(--color-warning)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Ticket Promedio</p>
                <p className="text-2xl font-bold text-[var(--color-warning)]">{formatMoney(stats.avgTicket)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Coffee size={20} className="text-[var(--color-primary)]" />
              Productos Mas Vendidos
            </h3>
            {stats.topProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--color-text-muted)]">No hay datos de ventas aun</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product, i) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 ? "bg-[var(--color-primary)] text-[#0a0a0a]" :
                      i === 1 ? "bg-[var(--color-text-muted)] text-[#0a0a0a]" :
                      "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-text-primary)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{product.qty} vendidos</p>
                    </div>
                    <span className="font-semibold text-[var(--color-primary)]">{formatMoney(product.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-[var(--color-warning)]" />
              Alertas de Stock
            </h3>
            {stats.lowStock.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center mx-auto mb-3">
                  <Package size={24} className="text-[var(--color-success)]" />
                </div>
                <p className="text-[var(--color-success)]">Todo el inventario esta en orden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStock.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-[var(--color-warning-muted)] rounded-xl p-3">
                    <AlertTriangle size={18} className="text-[var(--color-warning)]" />
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Stock: {item.quantity} {item.unit} (Min: {item.min_stock})
                      </p>
                    </div>
                    <span className="badge badge-warning">Bajo</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="card text-center">
            <Package size={32} className="text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.activeProducts}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Productos Activos</p>
          </div>
          <div className="card text-center">
            <ShoppingCart size={32} className="text-[var(--color-success)] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.todaySales}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Ventas Hoy</p>
          </div>
          <div className="card text-center">
            <AlertTriangle size={32} className="text-[var(--color-warning)] mx-auto mb-2" />
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.lowStock.length}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Items Stock Bajo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
