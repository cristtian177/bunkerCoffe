import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Wallet, Clock, CheckCircle, XCircle } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function CashRegister() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [openAmount, setOpenAmount] = useState(0);
  const [closeAmount, setCloseAmount] = useState(0);
  const [closeNotes, setCloseNotes] = useState('');
  const [showClose, setShowClose] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [curr, hist] = await Promise.all([api.getCashCurrent(), api.getCashHistory()]);
    setCurrent(curr);
    setHistory(hist);
  }

  async function handleOpen() {
    await api.openCash(openAmount);
    setOpenAmount(0);
    loadData();
  }

  async function handleClose() {
    await api.closeCash(closeAmount, closeNotes);
    setShowClose(false);
    setCloseAmount(0);
    setCloseNotes('');
    loadData();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Wallet size={24} /> Caja Registradora</h1>

      {/* Current register status */}
      {current ? (
        <div className="card border-emerald-500/30">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-emerald-400 font-medium">Caja Abierta</span>
              </div>
              <p className="text-sm text-slate-400">Abierta por: {current.user_name}</p>
              <p className="text-sm text-slate-400">Desde: {new Date(current.opened_at).toLocaleString('es-CO')}</p>
            </div>
            <button onClick={() => { setCloseAmount(0); setShowClose(true); }} className="btn-danger text-sm">
              Cerrar Caja
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-slate-900 rounded-lg p-3">
              <p className="text-xs text-slate-400">Monto Inicial</p>
              <p className="text-lg font-bold text-white">{formatMoney(current.initial_amount)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <p className="text-xs text-slate-400">Ventas Hoy</p>
              <p className="text-lg font-bold text-emerald-400">{current.num_sales} ventas</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <p className="text-xs text-slate-400">Total Ventas</p>
              <p className="text-lg font-bold text-emerald-400">{formatMoney(current.total_sales)}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <p className="text-xs text-slate-400">Efectivo Esperado</p>
              <p className="text-lg font-bold text-yellow-400">{formatMoney(current.expected_amount)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 space-y-4">
          <XCircle size={40} className="mx-auto text-slate-500" />
          <p className="text-slate-400">No hay caja abierta</p>
          <div className="flex items-center gap-2 justify-center">
            <input
              type="number" value={openAmount} onChange={e => setOpenAmount(parseFloat(e.target.value) || 0)}
              className="input-field w-40" placeholder="Monto inicial"
            />
            <button onClick={handleOpen} className="btn-primary">Abrir Caja</button>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Clock size={18} /> Historial</h2>
        <div className="space-y-2">
          {history.map(reg => (
            <div key={reg.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {reg.status === 'OPEN' ? (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Abierta</span>
                  ) : (
                    <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">Cerrada</span>
                  )}
                  <span className="text-sm text-slate-300">{reg.user_name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(reg.opened_at).toLocaleString('es-CO')}
                  {reg.closed_at && ` → ${new Date(reg.closed_at).toLocaleString('es-CO')}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">Inicial: {formatMoney(reg.initial_amount)}</p>
                {reg.status === 'CLOSED' && (
                  <>
                    <p className="text-sm">Final: {formatMoney(reg.final_amount)}</p>
                    <p className={`text-sm font-bold ${reg.difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      Dif: {reg.difference >= 0 ? '+' : ''}{formatMoney(reg.difference)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-600 p-6 space-y-4">
            <h3 className="text-lg font-bold">Cerrar Caja</h3>
            <p className="text-sm text-slate-400">Esperado en efectivo: <strong className="text-yellow-400">{formatMoney(current?.expected_amount || 0)}</strong></p>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Conteo real (efectivo en caja)</label>
              <input type="number" value={closeAmount} onChange={e => setCloseAmount(parseFloat(e.target.value) || 0)} className="input-field" placeholder="0" />
            </div>
            {closeAmount > 0 && (
              <div className={`text-center p-2 rounded-lg ${closeAmount - (current?.expected_amount || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                Diferencia: {formatMoney(closeAmount - (current?.expected_amount || 0))}
              </div>
            )}
            <textarea value={closeNotes} onChange={e => setCloseNotes(e.target.value)} className="input-field" placeholder="Notas (opcional)" rows={2} />
            <div className="flex gap-2">
              <button onClick={() => setShowClose(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleClose} className="btn-danger flex-1">Cerrar Caja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
