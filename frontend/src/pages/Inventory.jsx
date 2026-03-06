import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Plus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, 
  Settings2, X, Search, Filter, Loader2, TrendingDown, TrendingUp,
  MoreHorizontal, Edit2, History
} from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Inventory() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMovement, setShowMovement] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    stock: 0, 
    unit: 'units', 
    min_stock: 0, 
    cost_per_unit: 0 
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [inv, alts] = await Promise.all([api.getInventory(), api.getAlerts()]);
    setItems(inv);
    setAlerts(alts);
    setLoading(false);
  }

  async function handleSave() {
    if (editItem) {
      await api.updateInventoryItem(editItem.id, form);
    } else {
      await api.createInventoryItem(form);
    }
    setShowForm(false);
    setEditItem(null);
    setForm({ name: '', description: '', stock: 0, unit: 'units', min_stock: 0, cost_per_unit: 0 });
    loadData();
  }

  function startEdit(item) {
    setEditItem(item);
    setForm({ 
      name: item.name, 
      description: item.description || '', 
      stock: item.stock, 
      unit: item.unit, 
      min_stock: item.min_stock, 
      cost_per_unit: item.cost_per_unit 
    });
    setShowForm(true);
  }

  function startCreate() {
    setEditItem(null);
    setForm({ name: '', description: '', stock: 0, unit: 'units', min_stock: 0, cost_per_unit: 0 });
    setShowForm(true);
  }

  const filtered = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterLow || item.stock <= item.min_stock;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: items.length,
    lowStock: alerts.length,
    totalValue: items.reduce((s, i) => s + (i.stock * i.cost_per_unit), 0)
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Package size={24} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Inventario</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{stats.total} insumos registrados</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={startCreate} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Nuevo Insumo
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
              <Package size={16} />
              Total Insumos
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
              <AlertTriangle size={16} />
              Stock Bajo
            </div>
            <p className={`text-2xl font-bold ${stats.lowStock > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
              {stats.lowStock}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
              <TrendingUp size={16} />
              Valor Total
            </div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">{formatMoney(stats.totalValue)}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar insumos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setFilterLow(!filterLow)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              filterLow 
                ? 'bg-[var(--color-danger)] text-white' 
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
            }`}
          >
            <Filter size={16} />
            Stock Bajo
            {alerts.length > 0 && (
              <span className={`text-xs px-1.5 rounded-full ${filterLow ? 'bg-white/20' : 'bg-[var(--color-danger)] text-white'}`}>
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && !filterLow && (
        <div className="mx-6 mt-4 bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-[var(--color-warning)] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-warning)]">
                {alerts.length} insumo{alerts.length > 1 ? 's' : ''} con stock bajo
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {alerts.map(a => a.name).join(', ')}
              </p>
            </div>
            <button 
              onClick={() => setFilterLow(true)}
              className="text-xs text-[var(--color-warning)] hover:underline font-medium"
            >
              Ver todos
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-muted)]">
            <Package size={48} className="mb-3 opacity-30" />
            <p>{searchTerm || filterLow ? 'No se encontraron insumos' : 'No hay insumos registrados'}</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-4 px-5 table-header">Insumo</th>
                  <th className="text-left py-4 px-5 table-header">Stock</th>
                  <th className="text-left py-4 px-5 table-header">Unidad</th>
                  <th className="text-left py-4 px-5 table-header">Stock Min</th>
                  <th className="text-left py-4 px-5 table-header">Costo/U</th>
                  <th className="text-left py-4 px-5 table-header">Valor Total</th>
                  {isAdmin && <th className="text-right py-4 px-5 table-header">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.stock <= item.min_stock;
                  const totalValue = item.stock * item.cost_per_unit;
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLow ? 'bg-[var(--color-danger-muted)]' : 'bg-[var(--color-bg-tertiary)]'
                          }`}>
                            <Package size={18} className={isLow ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'} />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[200px]">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${isLow ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                            {item.stock}
                          </span>
                          {isLow && (
                            <TrendingDown size={16} className="text-[var(--color-danger)]" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="badge badge-info">{item.unit}</span>
                      </td>
                      <td className="py-4 px-5 text-[var(--color-text-muted)]">{item.min_stock}</td>
                      <td className="py-4 px-5 text-[var(--color-text-secondary)]">{formatMoney(item.cost_per_unit)}</td>
                      <td className="py-4 px-5">
                        <span className="font-medium text-[var(--color-primary)]">{formatMoney(totalValue)}</span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setShowMovement(item)}
                              className="btn-ghost p-2 text-[var(--color-info)]"
                              title="Registrar movimiento"
                            >
                              <History size={16} />
                            </button>
                            <button 
                              onClick={() => startEdit(item)}
                              className="btn-ghost p-2"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content w-full max-w-md animate-slide-up">
            <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editItem ? 'Editar' : 'Nuevo'} Insumo
              </h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Nombre</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  className="input-field" 
                  placeholder="Ej: Whey Protein Vainilla" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Descripcion (opcional)</label>
                <input 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  className="input-field" 
                  placeholder="Descripcion breve" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {!editItem && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Stock inicial</label>
                    <input 
                      type="number" 
                      value={form.stock} 
                      onChange={e => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} 
                      className="input-field" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Unidad</label>
                  <select 
                    value={form.unit} 
                    onChange={e => setForm({ ...form, unit: e.target.value })} 
                    className="input-field"
                  >
                    <option value="units">Unidades</option>
                    <option value="g">Gramos</option>
                    <option value="ml">Mililitros</option>
                    <option value="kg">Kilogramos</option>
                    <option value="l">Litros</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Stock minimo</label>
                  <input 
                    type="number" 
                    value={form.min_stock} 
                    onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} 
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Costo/unidad</label>
                  <input 
                    type="number" 
                    value={form.cost_per_unit} 
                    onChange={e => setForm({ ...form, cost_per_unit: parseFloat(e.target.value) || 0 })} 
                    className="input-field" 
                  />
                </div>
              </div>
            </div>
            
            <div className="p-5 pt-0">
              <button onClick={handleSave} className="btn-primary w-full">
                {editItem ? 'Guardar Cambios' : 'Crear Insumo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovement && (
        <MovementModal 
          item={showMovement} 
          onClose={() => { setShowMovement(null); loadData(); }} 
        />
      )}
    </div>
  );
}

function MovementModal({ item, onClose }) {
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    await api.addMovement(item.id, { type, quantity: parseFloat(quantity), reason });
    setLoading(false);
    onClose();
  }

  const types = [
    { id: 'IN', label: 'Entrada', icon: ArrowDownCircle, color: 'success' },
    { id: 'OUT', label: 'Salida', icon: ArrowUpCircle, color: 'danger' },
    { id: 'ADJUSTMENT', label: 'Ajuste', icon: Settings2, color: 'warning' },
  ];

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content w-full max-w-md animate-slide-up">
        <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Movimiento de Stock</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{item.name}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {/* Current Stock */}
          <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Stock actual</p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">
              {item.stock} <span className="text-lg text-[var(--color-text-muted)]">{item.unit}</span>
            </p>
          </div>
          
          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">Tipo de movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              {types.map(t => {
                const isActive = type === t.id;
                return (
                  <button 
                    key={t.id} 
                    onClick={() => setType(t.id)} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isActive 
                        ? `bg-[var(--color-${t.color})]/10 border-2 border-[var(--color-${t.color})]` 
                        : 'bg-[var(--color-bg-tertiary)] border-2 border-transparent hover:border-[var(--color-border)]'
                    }`}
                  >
                    <t.icon size={24} className={isActive ? `text-[var(--color-${t.color})]` : 'text-[var(--color-text-muted)]'} />
                    <span className={`text-sm font-medium ${isActive ? `text-[var(--color-${t.color})]` : 'text-[var(--color-text-secondary)]'}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              {type === 'ADJUSTMENT' ? 'Stock nuevo' : 'Cantidad'}
            </label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              className="input-field text-lg font-semibold" 
              placeholder="0"
            />
          </div>
          
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Razon</label>
            <input 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              className="input-field" 
              placeholder="Ej: Compra proveedor, Ajuste por conteo..." 
            />
          </div>
        </div>
        
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button 
            onClick={handleSubmit} 
            disabled={!quantity || loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
