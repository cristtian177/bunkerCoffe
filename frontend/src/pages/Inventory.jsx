import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, AlertTriangle, ArrowDown, ArrowUp, Settings, X } from 'lucide-react';

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
  const [form, setForm] = useState({ name: '', description: '', stock: 0, unit: 'units', min_stock: 0, cost_per_unit: 0 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [inv, alts] = await Promise.all([api.getInventory(), api.getAlerts()]);
    setItems(inv);
    setAlerts(alts);
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
    setForm({ name: item.name, description: item.description || '', stock: item.stock, unit: item.unit, min_stock: item.min_stock, cost_per_unit: item.cost_per_unit });
    setShowForm(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Package size={24} /> Inventario</h1>
        {isAdmin && (
          <button onClick={() => { setEditItem(null); setForm({ name: '', description: '', stock: 0, unit: 'units', min_stock: 0, cost_per_unit: 0 }); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nuevo Insumo
          </button>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h3 className="text-yellow-400 font-medium flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Stock Bajo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {alerts.map(a => (
              <div key={a.id} className="bg-yellow-500/10 rounded-lg p-2 text-sm">
                <p className="font-medium text-yellow-300">{a.name}</p>
                <p className="text-yellow-400">{a.stock} {a.unit} (mín: {a.min_stock})</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="pb-3 font-medium">Insumo</th>
              <th className="pb-3 font-medium">Stock</th>
              <th className="pb-3 font-medium">Unidad</th>
              <th className="pb-3 font-medium">Mín</th>
              <th className="pb-3 font-medium">Costo/u</th>
              <th className="pb-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-3">
                  <p className="font-medium text-white">{item.name}</p>
                  {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                </td>
                <td className={`py-3 font-medium ${item.stock <= item.min_stock ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.stock}
                </td>
                <td className="py-3 text-slate-300">{item.unit}</td>
                <td className="py-3 text-slate-400">{item.min_stock}</td>
                <td className="py-3 text-slate-300">{formatMoney(item.cost_per_unit)}</td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {isAdmin && (
                      <>
                        <button onClick={() => setShowMovement(item)} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-600/30">
                          <ArrowDown size={12} className="inline" /> Mover
                        </button>
                        <button onClick={() => startEdit(item)} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600">
                          <Settings size={12} className="inline" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-600 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{editItem ? 'Editar' : 'Nuevo'} Insumo</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Nombre" />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Descripción (opcional)" />
            <div className="grid grid-cols-2 gap-3">
              {!editItem && <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} className="input-field" placeholder="Stock inicial" />}
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field">
                <option value="units">Unidades</option>
                <option value="g">Gramos</option>
                <option value="ml">Mililitros</option>
                <option value="kg">Kilogramos</option>
                <option value="l">Litros</option>
              </select>
              <input type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} className="input-field" placeholder="Stock mínimo" />
              <input type="number" value={form.cost_per_unit} onChange={e => setForm({ ...form, cost_per_unit: parseFloat(e.target.value) || 0 })} className="input-field" placeholder="Costo/unidad" />
            </div>
            <button onClick={handleSave} className="btn-primary w-full">{editItem ? 'Guardar' : 'Crear'}</button>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovement && <MovementModal item={showMovement} onClose={() => { setShowMovement(null); loadData(); }} />}
    </div>
  );
}

function MovementModal({ item, onClose }) {
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  async function handleSubmit() {
    await api.addMovement(item.id, { type, quantity, reason });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-600 p-6 space-y-4">
        <h3 className="text-lg font-bold">Movimiento: {item.name}</h3>
        <p className="text-sm text-slate-400">Stock actual: {item.stock} {item.unit}</p>
        <div className="flex gap-2">
          {['IN', 'OUT', 'ADJUSTMENT'].map(t => (
            <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${type === t ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              {t === 'IN' ? '⬆ Entrada' : t === 'OUT' ? '⬇ Salida' : '⚙ Ajuste'}
            </button>
          ))}
        </div>
        <input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} className="input-field" placeholder={type === 'ADJUSTMENT' ? 'Stock nuevo' : 'Cantidad'} />
        <input value={reason} onChange={e => setReason(e.target.value)} className="input-field" placeholder="Razón (ej: Compra proveedor)" />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
