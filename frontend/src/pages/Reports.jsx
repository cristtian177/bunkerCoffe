import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [salesReport, setSalesReport] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setDashboard);
  }, []);

  async function loadReport() {
    const data = await api.getSalesReport(dateFrom, dateTo);
    setSalesReport(data);
  }

  if (!dashboard) return <div className="p-6 text-slate-400">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 size={24} /> Reportes</h1>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-sm"><DollarSign size={16} /> Ventas Hoy</div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatMoney(dashboard.today.total)}</p>
          <p className="text-xs text-slate-400">{dashboard.today.count} ventas</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-sm"><TrendingUp size={16} /> Ticket Promedio</div>
          <p className="text-2xl font-bold text-blue-400 mt-1">{formatMoney(dashboard.today.count > 0 ? dashboard.today.total / dashboard.today.count : 0)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-sm"><Package size={16} /> Alertas Stock</div>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{dashboard.low_stock.length}</p>
          <p className="text-xs text-slate-400">insumos bajos</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-sm">💳 Pagos Hoy</div>
          <div className="mt-1 space-y-0.5">
            {dashboard.payment_breakdown.map(p => (
              <div key={p.name} className="flex justify-between text-sm">
                <span className="text-slate-300">{p.name}</span>
                <span className="text-white font-medium">{formatMoney(p.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products */}
      {dashboard.top_products.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-white mb-3">Top Productos Hoy</h3>
          <div className="space-y-2">
            {dashboard.top_products.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-sm text-white">{p.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-emerald-400 font-medium">{formatMoney(p.total_revenue)}</span>
                  <span className="text-xs text-slate-400 ml-2">({p.total_qty} uds)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales report by date */}
      <div className="card">
        <h3 className="font-bold text-white mb-3">Reporte por Fecha</h3>
        <div className="flex gap-3 items-end mb-4">
          <div>
            <label className="text-xs text-slate-400">Desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" />
          </div>
          <button onClick={loadReport} className="btn-primary">Consultar</button>
        </div>

        {salesReport && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-lg font-bold text-emerald-400">{formatMoney(salesReport.summary.total)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Ventas</p>
                <p className="text-lg font-bold text-white">{salesReport.summary.count}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Promedio</p>
                <p className="text-lg font-bold text-blue-400">{formatMoney(salesReport.summary.avg_sale)}</p>
              </div>
            </div>

            <div className="space-y-1 max-h-60 overflow-auto">
              {salesReport.sales.map(s => (
                <div key={s.id} className="flex justify-between text-sm py-1.5 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300">{s.sale_number}</span>
                    <span className="text-slate-500 ml-2">{new Date(s.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="text-emerald-400 font-medium">{formatMoney(s.total)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
