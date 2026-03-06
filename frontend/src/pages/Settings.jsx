import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings as SettingsIcon, CreditCard, Users, Tags, Plus, Trash2, Edit2, X } from 'lucide-react';

export default function Settings() {
  const [tab, setTab] = useState('payments');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [pm, cats, usrs] = await Promise.all([api.getPaymentMethods(), api.getCategories(), api.getUsers()]);
    setPaymentMethods(pm);
    setCategories(cats);
    setUsers(usrs);
  }

  // Payment Methods
  async function savePayment() {
    if (formData.id) await api.updatePaymentMethod(formData.id, formData.name);
    else await api.createPaymentMethod(formData.name);
    setShowForm(false);
    loadAll();
  }

  async function deletePayment(id) {
    if (confirm('¿Eliminar método de pago?')) { await api.deletePaymentMethod(id); loadAll(); }
  }

  // Categories
  async function saveCategory() {
    if (formData.id) await api.updateCategory(formData.id, formData);
    else await api.createCategory(formData);
    setShowForm(false);
    loadAll();
  }

  async function deleteCategory(id) {
    if (confirm('¿Eliminar categoría?')) { await api.deleteCategory(id); loadAll(); }
  }

  // Users
  async function saveUser() {
    if (formData.id) await api.updateUser(formData.id, formData);
    else await api.createUser(formData);
    setShowForm(false);
    loadAll();
  }

  const tabs = [
    { id: 'payments', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'users', label: 'Usuarios', icon: Users },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><SettingsIcon size={24} /> Configuración</h1>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Payment Methods */}
      {tab === 'payments' && (
        <div className="space-y-3">
          <button onClick={() => { setFormData({ name: '' }); setShowForm('payment'); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14} /> Nuevo Método</button>
          {paymentMethods.map(pm => (
            <div key={pm.id} className="card flex justify-between items-center">
              <span className="text-white font-medium">{pm.name}</span>
              <div className="flex gap-2">
                <button onClick={() => { setFormData(pm); setShowForm('payment'); }} className="text-slate-400 hover:text-white"><Edit2 size={14} /></button>
                <button onClick={() => deletePayment(pm.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {tab === 'categories' && (
        <div className="space-y-3">
          <button onClick={() => { setFormData({ name: '', type: 'DIRECT', color: '#3B82F6' }); setShowForm('category'); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14} /> Nueva Categoría</button>
          {categories.map(cat => (
            <div key={cat.id} className="card flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color || '#666' }}></div>
                <div>
                  <span className="text-white font-medium">{cat.name}</span>
                  <span className="text-xs text-slate-400 ml-2">{cat.type}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setFormData(cat); setShowForm('category'); }} className="text-slate-400 hover:text-white"><Edit2 size={14} /></button>
                <button onClick={() => deleteCategory(cat.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-3">
          <button onClick={() => { setFormData({ name: '', username: '', password: '', role: 'OPERATOR', active: true }); setShowForm('user'); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14} /> Nuevo Usuario</button>
          {users.map(u => (
            <div key={u.id} className="card flex justify-between items-center">
              <div>
                <span className="text-white font-medium">{u.name}</span>
                <span className="text-xs text-slate-400 ml-2">@{u.username}</span>
                <span className={`text-xs ml-2 px-2 py-0.5 rounded ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>{u.role}</span>
                {!u.active && <span className="text-xs ml-2 text-red-400">(inactivo)</span>}
              </div>
              <button onClick={() => { setFormData({ ...u, password: '' }); setShowForm('user'); }} className="text-slate-400 hover:text-white"><Edit2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Generic Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-600 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {showForm === 'payment' ? 'Método de Pago' : showForm === 'category' ? 'Categoría' : 'Usuario'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            {showForm === 'payment' && (
              <>
                <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Nombre (ej: Nequi)" />
                <button onClick={savePayment} className="btn-primary w-full">Guardar</button>
              </>
            )}

            {showForm === 'category' && (
              <>
                <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Nombre" />
                <select value={formData.type || 'DIRECT'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="input-field">
                  <option value="DIRECT">Directa</option>
                  <option value="COMPOSITE">Compuesta</option>
                </select>
                <div>
                  <label className="text-xs text-slate-400">Color</label>
                  <input type="color" value={formData.color || '#3B82F6'} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
                </div>
                <button onClick={saveCategory} className="btn-primary w-full">Guardar</button>
              </>
            )}

            {showForm === 'user' && (
              <>
                <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Nombre completo" />
                <input value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} className="input-field" placeholder="Username" />
                <input type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-field" placeholder={formData.id ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'} />
                <select value={formData.role || 'OPERATOR'} onChange={e => setFormData({ ...formData, role: e.target.value })} className="input-field">
                  <option value="OPERATOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {formData.id && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.active !== false} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="accent-emerald-500" />
                    Activo
                  </label>
                )}
                <button onClick={saveUser} className="btn-primary w-full">Guardar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
