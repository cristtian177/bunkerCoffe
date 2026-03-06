import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Coffee, Plus, Edit2, Trash2, X, Search, Filter,
  Loader2, Layers, Box, ChevronDown
} from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: 0, 
    type: 'DIRECT', 
    category_id: '', 
    inventory_id: '', 
    recipe: [] 
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [prods, cats, inv] = await Promise.all([
      api.getProducts(), 
      api.getCategories(), 
      api.getInventory()
    ]);
    setProducts(prods);
    setCategories(cats);
    setInventory(inv);
    setLoading(false);
  }

  function startCreate() {
    setEditProd(null);
    setForm({ 
      name: '', 
      description: '', 
      price: 0, 
      type: 'DIRECT', 
      category_id: categories[0]?.id || '', 
      inventory_id: '', 
      recipe: [] 
    });
    setShowForm(true);
  }

  function startEdit(p) {
    setEditProd(p);
    setForm({
      name: p.name, 
      description: p.description || '', 
      price: p.price, 
      type: p.type,
      category_id: p.category_id, 
      inventory_id: p.inventory_id || '',
      recipe: p.recipe ? p.recipe.map(r => ({ inventory_id: r.inventory_id, quantity: r.quantity })) : []
    });
    setShowForm(true);
  }

  async function handleSave() {
    const data = { 
      ...form, 
      price: parseFloat(form.price), 
      category_id: parseInt(form.category_id) 
    };
    if (data.type === 'DIRECT') data.inventory_id = parseInt(form.inventory_id) || null;
    if (editProd) {
      await api.updateProduct(editProd.id, data);
    } else {
      await api.createProduct(data);
    }
    setShowForm(false);
    loadData();
  }

  async function handleDelete(id) {
    if (confirm('Estas seguro de eliminar este producto?')) {
      await api.deleteProduct(id);
      loadData();
    }
  }

  function addRecipeItem() {
    setForm({ 
      ...form, 
      recipe: [...form.recipe, { inventory_id: inventory[0]?.id || '', quantity: 1 }] 
    });
  }

  function updateRecipeItem(idx, field, value) {
    const updated = [...form.recipe];
    updated[idx][field] = field === 'quantity' ? parseFloat(value) || 0 : parseInt(value);
    setForm({ ...form, recipe: updated });
  }

  function removeRecipeItem(idx) {
    setForm({ ...form, recipe: form.recipe.filter((_, i) => i !== idx) });
  }

  const filtered = products.filter(p => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category_id === parseInt(filterCategory);
    const matchesType = !filterType || p.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const stats = {
    total: products.length,
    direct: products.filter(p => p.type === 'DIRECT').length,
    composite: products.filter(p => p.type === 'COMPOSITE').length
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Coffee size={24} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Productos</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{stats.total} productos en el menu</p>
            </div>
          </div>
          <button onClick={startCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
              <Coffee size={16} />
              Total
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
              <Box size={16} />
              Directos
            </div>
            <p className="text-2xl font-bold text-[var(--color-info)]">{stats.direct}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
              <Layers size={16} />
              Compuestos
            </div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">{stats.composite}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="input-field pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todas las categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
          <div className="flex gap-2">
            {['', 'DIRECT', 'COMPOSITE'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-[var(--color-primary)] text-[#0a0a0a]'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                }`}
              >
                {type === '' ? 'Todos' : type === 'DIRECT' ? 'Directos' : 'Compuestos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-muted)]">
            <Coffee size={48} className="mb-3 opacity-30" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      p.type === 'COMPOSITE' 
                        ? 'bg-[var(--color-primary)]/10' 
                        : 'bg-[var(--color-info)]/10'
                    }`}>
                      {p.type === 'COMPOSITE' 
                        ? <Layers size={18} className="text-[var(--color-primary)]" />
                        : <Box size={18} className="text-[var(--color-info)]" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text-primary)]">{p.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{p.category_name}</p>
                    </div>
                  </div>
                  <span className={`badge ${p.type === 'COMPOSITE' ? 'badge-primary' : 'badge-info'}`}>
                    {p.type === 'COMPOSITE' ? 'Compuesto' : 'Directo'}
                  </span>
                </div>

                <p className="text-2xl font-bold text-[var(--color-primary)] mb-3">
                  {formatMoney(p.price)}
                </p>

                {p.recipe && p.recipe.length > 0 && (
                  <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Receta:</p>
                    <div className="space-y-1">
                      {p.recipe.slice(0, 3).map((r, i) => (
                        <p key={i} className="text-xs text-[var(--color-text-secondary)]">
                          {r.quantity} {r.unit} {r.inventory_name}
                        </p>
                      ))}
                      {p.recipe.length > 3 && (
                        <p className="text-xs text-[var(--color-text-muted)]">
                          +{p.recipe.length - 3} mas...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-3 border-t border-[var(--color-border)]">
                  <button 
                    onClick={() => startEdit(p)} 
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)} 
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editProd ? 'Editar' : 'Nuevo'} Producto
              </h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Nombre del producto
                </label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  className="input-field" 
                  placeholder="Ej: Batido Proteico Vainilla" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Descripcion (opcional)
                </label>
                <input 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  className="input-field" 
                  placeholder="Descripcion breve" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Precio</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input 
                      type="number" 
                      value={form.price} 
                      onChange={e => setForm({ ...form, price: e.target.value })} 
                      className="input-field pl-8" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Categoria</label>
                  <select 
                    value={form.category_id} 
                    onChange={e => setForm({ ...form, category_id: e.target.value })} 
                    className="input-field"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                  Tipo de producto
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'DIRECT', recipe: [] })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      form.type === 'DIRECT'
                        ? 'border-[var(--color-info)] bg-[var(--color-info)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-light)]'
                    }`}
                  >
                    <Box size={20} className={form.type === 'DIRECT' ? 'text-[var(--color-info)]' : 'text-[var(--color-text-muted)]'} />
                    <div className="text-left">
                      <p className={`font-medium ${form.type === 'DIRECT' ? 'text-[var(--color-info)]' : 'text-[var(--color-text-primary)]'}`}>
                        Directo
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">Se descuenta del inventario</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'COMPOSITE', inventory_id: '' })}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      form.type === 'COMPOSITE'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-light)]'
                    }`}
                  >
                    <Layers size={20} className={form.type === 'COMPOSITE' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                    <div className="text-left">
                      <p className={`font-medium ${form.type === 'COMPOSITE' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        Compuesto
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">Tiene receta de ingredientes</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Direct Product - Inventory Link */}
              {form.type === 'DIRECT' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Vincular a insumo del inventario
                  </label>
                  <select 
                    value={form.inventory_id} 
                    onChange={e => setForm({ ...form, inventory_id: e.target.value })} 
                    className="input-field"
                  >
                    <option value="">Seleccionar insumo...</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.stock} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Composite Product - Recipe */}
              {form.type === 'COMPOSITE' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Receta (ingredientes)
                    </label>
                    <button 
                      type="button"
                      onClick={addRecipeItem} 
                      className="text-xs text-[var(--color-primary)] hover:underline font-medium flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Agregar ingrediente
                    </button>
                  </div>
                  
                  {form.recipe.length === 0 ? (
                    <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-center">
                      <p className="text-sm text-[var(--color-text-muted)]">
                        No hay ingredientes agregados
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.recipe.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[var(--color-bg-secondary)] rounded-xl p-3">
                          <select 
                            value={r.inventory_id} 
                            onChange={e => updateRecipeItem(i, 'inventory_id', e.target.value)} 
                            className="input-field flex-1 py-2"
                          >
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} ({inv.unit})
                              </option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            value={r.quantity} 
                            onChange={e => updateRecipeItem(i, 'quantity', e.target.value)} 
                            className="input-field w-24 py-2 text-center" 
                            placeholder="Cant"
                          />
                          <button 
                            type="button"
                            onClick={() => removeRecipeItem(i)} 
                            className="w-9 h-9 rounded-lg bg-[var(--color-danger-muted)] text-[var(--color-danger)] flex items-center justify-center hover:bg-[var(--color-danger)] hover:text-white transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 pt-0">
              <button onClick={handleSave} className="btn-primary w-full">
                {editProd ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
