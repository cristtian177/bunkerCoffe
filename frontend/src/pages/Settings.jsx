import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Settings as SettingsIcon, CreditCard, Users, Tags, 
  Plus, Trash2, Edit2, X, Loader2, Check, Shield, Palette
} from 'lucide-react';

export default function Settings() {
  const [tab, setTab] = useState('payments');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [pm, cats, usrs] = await Promise.all([
      api.getPaymentMethods(), 
      api.getCategories(), 
      api.getUsers()
    ]);
    setPaymentMethods(pm);
    setCategories(cats);
    setUsers(usrs);
    setLoading(false);
  }

  // Payment Methods
  async function savePayment() {
    setSaving(true);
    if (formData.id) await api.updatePaymentMethod(formData.id, formData.name);
    else await api.createPaymentMethod(formData.name);
    setShowForm(false);
    await loadAll();
    setSaving(false);
  }

  async function deletePayment(id) {
    if (confirm('Eliminar este metodo de pago?')) { 
      await api.deletePaymentMethod(id); 
      loadAll(); 
    }
  }

  // Categories
  async function saveCategory() {
    setSaving(true);
    if (formData.id) await api.updateCategory(formData.id, formData);
    else await api.createCategory(formData);
    setShowForm(false);
    await loadAll();
    setSaving(false);
  }

  async function deleteCategory(id) {
    if (confirm('Eliminar esta categoria?')) { 
      await api.deleteCategory(id); 
      loadAll(); 
    }
  }

  // Users
  async function saveUser() {
    setSaving(true);
    if (formData.id) await api.updateUser(formData.id, formData);
    else await api.createUser(formData);
    setShowForm(false);
    await loadAll();
    setSaving(false);
  }

  const tabs = [
    { id: 'payments', label: 'Metodos de Pago', icon: CreditCard, count: paymentMethods.length },
    { id: 'categories', label: 'Categorias', icon: Tags, count: categories.length },
    { id: 'users', label: 'Usuarios', icon: Users, count: users.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <SettingsIcon size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Configuracion</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Administra tu sistema POS</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === t.id 
                  ? 'bg-[var(--color-primary)] text-[#0a0a0a]' 
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
              }`}
            >
              <t.icon size={18} />
              {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tab === t.id 
                  ? 'bg-[#0a0a0a]/20 text-[#0a0a0a]' 
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {/* Payment Methods */}
          {tab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">Metodos de Pago</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">Gestiona los metodos de pago aceptados</p>
                </div>
                <button 
                  onClick={() => { setFormData({ name: '' }); setShowForm('payment'); }} 
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Nuevo Metodo
                </button>
              </div>
              
              <div className="divider" />
              
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard size={32} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-sm text-[var(--color-text-muted)]">No hay metodos de pago registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <CreditCard size={18} className="text-[var(--color-primary)]" />
                        </div>
                        <span className="font-medium text-[var(--color-text-primary)]">{pm.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setFormData(pm); setShowForm('payment'); }} 
                          className="btn-ghost p-2"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deletePayment(pm.id)} 
                          className="btn-ghost p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {tab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">Categorias</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">Organiza tus productos por categorias</p>
                </div>
                <button 
                  onClick={() => { setFormData({ name: '', type: 'DIRECT', color: '#c9a77c' }); setShowForm('category'); }} 
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Nueva Categoria
                </button>
              </div>
              
              <div className="divider" />
              
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Tags size={32} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-sm text-[var(--color-text-muted)]">No hay categorias registradas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color || '#c9a77c'}20` }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: cat.color || '#c9a77c' }}
                          />
                        </div>
                        <div>
                          <span className="font-medium text-[var(--color-text-primary)]">{cat.name}</span>
                          <span className="badge ml-2 text-xs" style={{ 
                            backgroundColor: `${cat.color || '#c9a77c'}20`,
                            color: cat.color || '#c9a77c'
                          }}>
                            {cat.type === 'COMPOSITE' ? 'Compuesta' : 'Directa'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setFormData(cat); setShowForm('category'); }} 
                          className="btn-ghost p-2"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteCategory(cat.id)} 
                          className="btn-ghost p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">Usuarios</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">Administra los usuarios del sistema</p>
                </div>
                <button 
                  onClick={() => { 
                    setFormData({ name: '', username: '', password: '', role: 'OPERATOR', active: true }); 
                    setShowForm('user'); 
                  }} 
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Nuevo Usuario
                </button>
              </div>
              
              <div className="divider" />
              
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-50" />
                  <p className="text-sm text-[var(--color-text-muted)]">No hay usuarios registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          u.role === 'ADMIN' 
                            ? 'bg-[var(--color-primary)]/10' 
                            : 'bg-[var(--color-info)]/10'
                        }`}>
                          {u.role === 'ADMIN' ? (
                            <Shield size={18} className="text-[var(--color-primary)]" />
                          ) : (
                            <Users size={18} className="text-[var(--color-info)]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--color-text-primary)]">{u.name}</span>
                            {!u.active && (
                              <span className="badge badge-danger text-xs">Inactivo</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[var(--color-text-muted)]">@{u.username}</span>
                            <span className={`badge text-xs ${
                              u.role === 'ADMIN' ? 'badge-primary' : 'badge-info'
                            }`}>
                              {u.role === 'ADMIN' ? 'Admin' : 'Operador'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setFormData({ ...u, password: '' }); setShowForm('user'); }} 
                        className="btn-ghost p-2"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Forms */}
      {showForm && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content w-full max-w-md animate-slide-up">
            <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {showForm === 'payment' 
                  ? (formData.id ? 'Editar' : 'Nuevo') + ' Metodo de Pago' 
                  : showForm === 'category' 
                    ? (formData.id ? 'Editar' : 'Nueva') + ' Categoria' 
                    : (formData.id ? 'Editar' : 'Nuevo') + ' Usuario'}
              </h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Payment Form */}
              {showForm === 'payment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Nombre del metodo
                    </label>
                    <input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      className="input-field" 
                      placeholder="Ej: Nequi, Efectivo, Tarjeta" 
                    />
                  </div>
                  <button 
                    onClick={savePayment} 
                    disabled={saving || !formData.name}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Guardar
                  </button>
                </>
              )}

              {/* Category Form */}
              {showForm === 'category' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Nombre de la categoria
                    </label>
                    <input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      className="input-field" 
                      placeholder="Ej: Batidos, Snacks, Bebidas" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Tipo de productos
                    </label>
                    <select 
                      value={formData.type || 'DIRECT'} 
                      onChange={e => setFormData({ ...formData, type: e.target.value })} 
                      className="input-field"
                    >
                      <option value="DIRECT">Directa (productos simples)</option>
                      <option value="COMPOSITE">Compuesta (productos con receta)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      <div className="flex items-center gap-2">
                        <Palette size={16} />
                        Color
                      </div>
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={formData.color || '#c9a77c'} 
                        onChange={e => setFormData({ ...formData, color: e.target.value })} 
                        className="w-12 h-12 rounded-lg cursor-pointer border-0 p-1 bg-[var(--color-bg-secondary)]" 
                      />
                      <input 
                        type="text"
                        value={formData.color || '#c9a77c'}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                        className="input-field flex-1 font-mono"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={saveCategory} 
                    disabled={saving || !formData.name}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Guardar
                  </button>
                </>
              )}

              {/* User Form */}
              {showForm === 'user' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Nombre completo
                    </label>
                    <input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      className="input-field" 
                      placeholder="Nombre y apellido" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Usuario
                    </label>
                    <input 
                      value={formData.username || ''} 
                      onChange={e => setFormData({ ...formData, username: e.target.value })} 
                      className="input-field" 
                      placeholder="usuario_login" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      {formData.id ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena'}
                    </label>
                    <input 
                      type="password" 
                      value={formData.password || ''} 
                      onChange={e => setFormData({ ...formData, password: e.target.value })} 
                      className="input-field" 
                      placeholder="********" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Rol
                    </label>
                    <select 
                      value={formData.role || 'OPERATOR'} 
                      onChange={e => setFormData({ ...formData, role: e.target.value })} 
                      className="input-field"
                    >
                      <option value="OPERATOR">Operador</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  {formData.id && (
                    <label className="flex items-center gap-3 p-3 bg-[var(--color-bg-secondary)] rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.active !== false} 
                        onChange={e => setFormData({ ...formData, active: e.target.checked })} 
                        className="w-5 h-5 rounded accent-[var(--color-primary)]" 
                      />
                      <span className="text-sm text-[var(--color-text-primary)]">Usuario activo</span>
                    </label>
                  )}
                  <button 
                    onClick={saveUser} 
                    disabled={saving || !formData.name || !formData.username || (!formData.id && !formData.password)}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Guardar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
