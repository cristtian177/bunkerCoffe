import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Wallet, Clock, CheckCircle, XCircle, X, 
  Loader2, DollarSign, Receipt, TrendingUp, 
  AlertCircle, Zap, Lock, CalendarDays
} from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function CashRegister() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [openAmount, setOpenAmount] = useState('');
  const [closeAmount, setCloseAmount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [showClose, setShowClose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [curr, hist] = await Promise.all([api.getCashCurrent(), api.getCashHistory()]);
    setCurrent(curr);
    setHistory(hist);
    setLoading(false);
  }

  async function handleOpen() {
    setActionLoading(true);
    await api.openCash(parseFloat(openAmount) || 0);
    setOpenAmount('');
    await loadData();
    setActionLoading(false);
  }

  async function handleClose() {
    setActionLoading(true);
    await api.closeCash(parseFloat(closeAmount) || 0, closeNotes);
    setShowClose(false);
    setCloseAmount('');
    setCloseNotes('');
    await loadData();
    setActionLoading(false);
  }

  const quickAmounts = [50000, 100000, 150000, 200000];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Wallet size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Caja Registradora</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {current ? 'Caja abierta' : 'Caja cerrada'} - {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Current Register Status */}
        {current ? (
          <div className="card-elevated border-[var(--color-success)]/30">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="status-dot status-dot-success" />
                <div>
                  <p className="font-semibold text-[var(--color-success)]">Caja Abierta</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Abierta por {current.user_name} - {new Date(current.opened_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setCloseAmount(''); setShowClose(true); }} 
                className="btn-danger flex items-center gap-2"
              >
                <Lock size={16} />
                Cerrar Caja
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-2">
                  <DollarSign size={16} />
                  Monto Inicial
                </div>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                  {formatMoney(current.initial_amount)}
                </p>
              </div>
              
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-2">
                  <Receipt size={16} />
                  Ventas Realizadas
                </div>
                <p className="text-xl font-bold text-[var(--color-success)]">
                  {current.num_sales} <span className="text-sm font-normal text-[var(--color-text-muted)]">ventas</span>
                </p>
              </div>
              
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-2">
                  <TrendingUp size={16} />
                  Total Ventas
                </div>
                <p className="text-xl font-bold text-[var(--color-primary)]">
                  {formatMoney(current.total_sales)}
                </p>
              </div>
              
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-2">
                  <Wallet size={16} />
                  Efectivo Esperado
                </div>
                <p className="text-xl font-bold text-[var(--color-warning)]">
                  {formatMoney(current.expected_amount)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* No Cash Register Open */
          <div className="card-elevated text-center py-12 space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mx-auto">
              <XCircle size={40} className="text-[var(--color-text-muted)]" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">No hay caja abierta</h2>
              <p className="text-[var(--color-text-secondary)] mt-2">
                Abre la caja para comenzar a registrar ventas
              </p>
            </div>
            
            <div className="max-w-sm mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 text-left">
                  Monto inicial
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input
                    type="number"
                    value={openAmount}
                    onChange={e => setOpenAmount(e.target.value)}
                    className="input-field pl-8 text-lg font-semibold text-center"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setOpenAmount(amt.toString())}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      parseFloat(openAmount) === amt 
                        ? 'bg-[var(--color-primary)] text-[#0a0a0a]' 
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                    }`}
                  >
                    {(amt / 1000)}K
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleOpen} 
                disabled={actionLoading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Zap size={20} />
                )}
                Abrir Caja
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Historial de Cajas</h2>
          </div>
          
          {history.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-[var(--color-text-muted)]">No hay historial de cajas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(reg => {
                const isOpen = reg.status === 'OPEN';
                const hasDiff = reg.difference && reg.difference !== 0;
                const isPositive = reg.difference > 0;
                
                return (
                  <div key={reg.id} className="card flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOpen 
                        ? 'bg-[var(--color-success-muted)]' 
                        : 'bg-[var(--color-bg-tertiary)]'
                    }`}>
                      {isOpen ? (
                        <CheckCircle size={24} className="text-[var(--color-success)]" />
                      ) : (
                        <Lock size={24} className="text-[var(--color-text-muted)]" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${isOpen ? 'badge-success' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'}`}>
                          {isOpen ? 'Abierta' : 'Cerrada'}
                        </span>
                        <span className="text-sm text-[var(--color-text-secondary)]">{reg.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <CalendarDays size={12} />
                        <span>{new Date(reg.opened_at).toLocaleString('es-CO')}</span>
                        {reg.closed_at && (
                          <>
                            <span className="text-[var(--color-border)]">-</span>
                            <span>{new Date(reg.closed_at).toLocaleString('es-CO')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Amounts */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Inicial: {formatMoney(reg.initial_amount)}
                      </p>
                      {reg.status === 'CLOSED' && (
                        <>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Final: {formatMoney(reg.final_amount)}
                          </p>
                          {hasDiff && (
                            <p className={`text-sm font-bold ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                              Dif: {isPositive ? '+' : ''}{formatMoney(reg.difference)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Close Modal */}
      {showClose && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content w-full max-w-md animate-slide-up">
            <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Cerrar Caja</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Realiza el arqueo de caja</p>
              </div>
              <button onClick={() => setShowClose(false)} className="btn-ghost p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Expected Amount */}
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Efectivo esperado</p>
                <p className="text-3xl font-bold text-[var(--color-warning)]">
                  {formatMoney(current?.expected_amount || 0)}
                </p>
              </div>
              
              {/* Real Count */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Conteo real (efectivo en caja)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input 
                    type="number" 
                    value={closeAmount} 
                    onChange={e => setCloseAmount(e.target.value)} 
                    className="input-field pl-8 text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Difference Display */}
              {closeAmount && (
                <div className={`rounded-xl p-4 text-center ${
                  parseFloat(closeAmount) - (current?.expected_amount || 0) >= 0 
                    ? 'bg-[var(--color-success-muted)]' 
                    : 'bg-[var(--color-danger-muted)]'
                }`}>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Diferencia</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(closeAmount) - (current?.expected_amount || 0) >= 0 
                      ? 'text-[var(--color-success)]' 
                      : 'text-[var(--color-danger)]'
                  }`}>
                    {parseFloat(closeAmount) - (current?.expected_amount || 0) >= 0 ? '+' : ''}
                    {formatMoney(parseFloat(closeAmount) - (current?.expected_amount || 0))}
                  </p>
                </div>
              )}
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Notas (opcional)
                </label>
                <textarea 
                  value={closeNotes} 
                  onChange={e => setCloseNotes(e.target.value)} 
                  className="input-field resize-none" 
                  placeholder="Observaciones del cierre..."
                  rows={2}
                />
              </div>
            </div>
            
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowClose(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button 
                onClick={handleClose} 
                disabled={actionLoading}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                Cerrar Caja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
