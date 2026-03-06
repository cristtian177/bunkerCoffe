import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Coffee, Plus, Edit2, Trash2, X } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, type: 'DIRECT', category_id: '', inventory_id: '', recipe: [] });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [prods, cats, inv] = await Promise.all([api.getProducts(), api.getCategories(), api.getInventory()]);
    setProducts(prods);
    setCategories(cats);
    setInventory(inv);
  }

  function startCreate() {
    setEditProd(null);
    setForm({ name: '', description: '', price: 0, type: 'DIRECT', category_id: categories[0]?.id || '', inventory_id: '', recipe: [] });
    setShowForm(true);
  }

  function startEdit(p) {
    setEditProd(p);
    setForm({
      name: p.name, description: p.description || '', price: p.price, type: p.type,
      category_id: p.category_id, inventory_id: p.inventory_id || '',
      recipe: p.recipe ? p.recipe.map(r => ({ inventory_id: r.inventory_id, quantity: r.quantity })) : []
    });
    setShowForm(true);
  }

  async function handleSave() {
    const data = { ...form, price: parseFloat(form.price), category_id: parseInt(form.category_id) };
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
    if (confirm('¿Eliminar producto?')) {
      await api.deleteProduct(id);
      loadData();
    }
  }

  function addRecipeItem() {
    setForm({ ...form, recipe: [...form.recipe, { inventory_id: inventory[0]?.id || '', quantity: 1 }] });
  }

  function updateRecipeItem(idx, field, value) {
    const updated = [...form.recipe];
    updated[idx][field] = field === 'quantity' ? parseFloat(value) || 0 : parseInt(value);
    setForm({ ...form, recipe: updated });
  }

  function removeRecipeItem(idx) {
    setForm({ ...form, recipe: form.recipe.filter((_, i) => i !== idx) });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Coffee size={24} /> Productos</h1>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nuevo Producto</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category_name}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.type === 'COMPOSITE' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {p.type === 'COMPOSITE' ? 'Compuesto' : 'Directo'}
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-2">{formatMoney(p.price)}</p>
            {p.recipe && p.recipe.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-400">Receta:</p>
                {p.recipe.map((r, i) => (
                  <p key={i} className="text-xs text-slate-300">• {r.quantity} {r.unit} {r.inventory_name}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => startEdit(p)} className="btn-secondary text-xs flex items-center gap-1"><Edit2 size={12} /> Editar</button>
              <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs flex items-center gap-1"><Trash2 size={12} /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-600 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{editProd ? 'Editar' : 'Nuevo'} Producto</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Nombre del producto" />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Descripción" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="Precio" />
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field">
                <option value="">Categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.type === 'DIRECT'} onChange={() => setForm({ ...form, type: 'DIRECT', recipe: [] })} className="accent-emerald-500" />
                <span className="text-sm">Directo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.type === 'COMPOSITE'} onChange={() => setForm({ ...form, type: 'COMPOSITE', inventory_id: '' })} className="accent-emerald-500" />
                <span className="text-sm">Compuesto (receta)</span>
              </label>
            </div>

            {form.type === 'DIRECT' && (
              <select value={form.inventory_id} onChange={e => setForm({ ...form, inventory_id: e.target.value })} className="input-field">
                <option value="">Vincular a insumo del inventario</option>
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.stock} {i.unit})</option>)}
              </select>
            )}

            {form.type === 'COMPOSITE' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-300">Receta (ingredientes)</p>
                  <button onClick={addRecipeItem} className="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded hover:bg-emerald-600/30">
                    + Ingrediente
                  </button>
                </div>
                {form.recipe.map((r, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={r.inventory_id} onChange={e => updateRecipeItem(i, 'inventory_id', e.target.value)} className="input-field flex-1">
                      {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>)}
                    </select>
                    <input type="number" value={r.quantity} onChange={e => updateRecipeItem(i, 'quantity', e.target.value)} className="input-field w-20" placeholder="Cant" />
                    <button onClick={() => removeRecipeItem(i)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleSave} className="btn-primary w-full">{editProd ? 'Guardar' : 'Crear Producto'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
