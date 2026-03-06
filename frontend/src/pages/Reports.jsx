import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, TrendingUp, Package, DollarSign, 
  Calendar, Search, Loader2, Receipt, CreditCard,
  AlertTriangle, ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const data = await api.getDashboard();
    setDashboard(data);
    setLoading(false);
  }

  async function loadReport() {
    setReportLoading(true);
    const data = await api.getSalesReport(dateFrom, dateTo);
    setSalesReport(data);
    setReportLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const avgTicket = dashboard.today.count > 0 
    ? dashboard.today.total / dashboard.today.count 
    : 0;

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <BarChart3 size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reportes</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Resumen del dia - {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sales Today */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center">
                <DollarSign size={20} className="text-[var(--color-success)]" />
              </div>
              <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                <ArrowUpRight size={14} />
                Hoy
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Ventas Hoy</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {formatMoney(dashboard.today.total)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {dashboard.today.count} ventas realizadas
            </p>
          </div>

          {/* Average Ticket */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-info-muted)] flex items-center justify-center">
                <TrendingUp size={20} className="text-[var(--color-info)]" />
              </div>
              <span className="flex items-center gap-1 text-xs text-[var(--color-info)]">
                <Receipt size={14} />
                Promedio
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Ticket Promedio</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {formatMoney(avgTicket)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Por transaccion
            </p>
          </div>

          {/* Low Stock Alerts */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                dashboard.low_stock.length > 0 
                  ? 'bg-[var(--color-warning-muted)]' 
                  : 'bg-[var(--color-bg-tertiary)]'
              }`}>
                <AlertTriangle size={20} className={
                  dashboard.low_stock.length > 0 
                    ? 'text-[var(--color-warning)]' 
                    : 'text-[var(--color-text-muted)]'
                } />
              </div>
              {dashboard.low_stock.length > 0 && (
                <span className="badge badge-warning">Alerta</span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Stock Bajo</p>
            <p className={`text-2xl font-bold ${
              dashboard.low_stock.length > 0 
                ? 'text-[var(--color-warning)]' 
                : 'text-[var(--color-success)]'
            }`}>
              {dashboard.low_stock.length}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              insumos por reabastecer
            </p>
          </div>

          {/* Payment Methods */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <CreditCard size={20} className="text-[var(--color-primary)]" />
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">Pagos Hoy</p>
            <div className="space-y-1.5">
              {dashboard.payment_breakdown.length > 0 ? (
                dashboard.payment_breakdown.slice(0, 3).map(p => (
                  <div key={p.name} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">{p.name}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {formatMoney(p.total)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">Sin ventas aun</p>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-text-primary)]">Top Productos Hoy</h3>
              <span className="badge badge-primary">Ranking</span>
            </div>
            
            {dashboard.top_products.length > 0 ? (
              <div className="space-y-3">
                {dashboard.top_products.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0 
                        ? 'bg-[var(--color-primary)] text-[#0a0a0a]' 
                        : i === 1 
                          ? 'bg-[var(--color-text-muted)] text-white' 
                          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {p.total_qty} unidades vendidas
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                      {formatMoney(p.total_revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package size={32} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-50" />
                <p className="text-sm text-[var(--color-text-muted)]">Sin ventas registradas hoy</p>
              </div>
            )}
          </div>

          {/* Low Stock Items */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-text-primary)]">Alertas de Stock</h3>
              {dashboard.low_stock.length > 0 && (
                <span className="badge badge-warning">{dashboard.low_stock.length} bajos</span>
              )}
            </div>
            
            {dashboard.low_stock.length > 0 ? (
              <div className="space-y-3">
                {dashboard.low_stock.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[var(--color-warning-muted)] rounded-lg">
                    <AlertTriangle size={18} className="text-[var(--color-warning)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Stock: {item.stock} {item.unit} (min: {item.min_stock})
                      </p>
                    </div>
                    <ArrowDownRight size={16} className="text-[var(--color-warning)]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success-muted)] flex items-center justify-center mx-auto mb-2">
                  <Package size={24} className="text-[var(--color-success)]" />
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">Todo el inventario esta bien abastecido</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales Report by Date */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">Reporte por Fecha</h3>
          </div>
          
          <div className="flex flex-wrap gap-3 items-end mb-6">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Desde</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                  className="input-field pl-10 w-44" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Hasta</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                  className="input-field pl-10 w-44" 
                />
              </div>
            </div>
            <button 
              onClick={loadReport} 
              disabled={reportLoading}
              className="btn-primary flex items-center gap-2"
            >
              {reportLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Consultar
            </button>
          </div>

          {salesReport && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Vendido</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">
                    {formatMoney(salesReport.summary.total)}
                  </p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Transacciones</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">
                    {salesReport.summary.count}
                  </p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Promedio</p>
                  <p className="text-xl font-bold text-[var(--color-info)]">
                    {formatMoney(salesReport.summary.avg_sale)}
                  </p>
                </div>
              </div>

              {/* Sales List */}
              {salesReport.sales.length > 0 ? (
                <div className="max-h-80 overflow-auto rounded-xl border border-[var(--color-border)]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[var(--color-bg-secondary)]">
                      <tr>
                        <th className="text-left py-3 px-4 table-header">Venta</th>
                        <th className="text-left py-3 px-4 table-header">Fecha</th>
                        <th className="text-left py-3 px-4 table-header">Hora</th>
                        <th className="text-right py-3 px-4 table-header">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.sales.map(s => (
                        <tr key={s.id} className="table-row">
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                              {s.sale_number}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
                            {new Date(s.created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--color-text-muted)]">
                            {new Date(s.created_at).toLocaleTimeString('es-CO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-sm font-semibold text-[var(--color-primary)]">
                              {formatMoney(s.total)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No hay ventas en este periodo
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
