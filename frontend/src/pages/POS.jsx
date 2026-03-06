import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus, Minus, Trash2, X, Printer, Download, AlertCircle, Check } from 'lucide-react';

function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// Receipt Modal
function ReceiptModal({ sale, onClose }) {
  if (!sale) return null;

  const receiptRef = () => {
    // Simple approach: open printable version
    const w = window.open('', '_blank', 'width=360,height=600');
    w.document.write(`
      <html><head><title>Recibo ${sale.sale_number}</title>
      <style>
        body{font-family:monospace;font-size:12px;padding:10px;max-width:300px;margin:0 auto}
        h2{text-align:center;margin:0}
        .line{border-top:1px dashed #000;margin:8px 0}
        .row{display:flex;justify-content:space-between}
        .center{text-align:center}
        .bold{font-weight:bold}
      </style></head><body>
      <h2>☕ COFFEE BUNKER</h2>
      <p class="center">Cafetería Fitness</p>
      <div class="line"></div>
      <p>Recibo: ${sale.sale_number}</p>
      <p>Fecha: ${new Date(sale.created_at).toLocaleString('es-CO')}</p>
      <p>Atendió: ${sale.user_name}</p>
      <div class="line"></div>
      ${sale.items.map(i => `
        <div class="row"><span>${i.quantity}x ${i.product_name}</span><span>${Number(i.subtotal).toLocaleString('es-CO')}</span></div>
      `).join('')}
      <div class="line"></div>
      ${sale.discount > 0 ? `<div class="row"><span>Descuento:</span><span>-${Number(sale.discount).toLocaleString('es-CO')}</span></div>` : ''}
      <div class="row bold"><span>TOTAL:</span><span>${Number(sale.total).toLocaleString('es-CO')}</span></div>
      <div class="line"></div>
      ${sale.payments.map(p => `
        <div class="row"><span>${p.method_name}:</span><span>${Number(p.amount).toLocaleString('es-CO')}</span></div>
      `).join('')}
      ${sale.change > 0 ? `<div class="row bold"><span>Cambio:</span><span>${Number(sale.change).toLocaleString('es-CO')}</span></div>` : ''}
      <div class="line"></div>
      <p class="center">¡Gracias por tu compra!</p>
      <p class="center">💪 Keep pushing!</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-600 overflow-hidden">
        <div className="bg-emerald-600 p-4 text-center">
          <Check size={40} className="mx-auto mb-2" />
          <h3 className="text-xl font-bold">¡Venta Exitosa!</h3>
          <p className="text-emerald-100">{sale.sale_number}</p>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-300">{item.quantity}x {item.product_name}</span>
                <span>{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-600 pt-2">
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm text-orange-400">
                <span>Descuento</span>
                <span>-{formatMoney(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-emerald-400">
              <span>Total</span>
              <span>{formatMoney(sale.total)}</span>
            </div>
          </div>

          <div className="border-t border-slate-600 pt-2 space-y-1">
            {sale.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-400">{p.method_name}</span>
                <span>{formatMoney(p.amount)}</span>
              </div>
            ))}
            {sale.change > 0 && (
              <div className="flex justify-between text-sm font-bold text-yellow-400">
                <span>Cambio</span>
                <span>{formatMoney(sale.change)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex gap-2">
          <button onClick={receiptRef} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Printer size={16} /> Imprimir
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Modal
function PaymentModal({ cart, total, discount, onConfirm, onClose }) {
  const [methods, setMethods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    api.getPaymentMethods().then(setMethods);
  }, []);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = total - discount - totalPaid;

  function addPayment() {
    if (!selectedMethod) return;
    const amount = remaining > 0 ? remaining : 0;
    setPayments([...payments, { payment_method_id: selectedMethod.id, method_name: selectedMethod.name, amount }]);
    setSelectedMethod(null);
  }

  function updateAmount(idx, amount) {
    const updated = [...payments];
    updated[idx].amount = parseFloat(amount) || 0;
    setPayments(updated);
  }

  function removePayment(idx) {
    setPayments(payments.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-600">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">Método de Pago</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-900 rounded-xl p-3 text-center">
            <p className="text-sm text-slate-400">Total a cobrar</p>
            <p className="text-3xl font-bold text-emerald-400">{formatMoney(total - discount)}</p>
          </div>

          {/* Method selector */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Seleccionar método:</p>
            <div className="flex gap-2 flex-wrap">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedMethod?.id === m.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            {selectedMethod && (
              <button onClick={addPayment} className="btn-primary mt-2 text-sm">
                + Agregar {selectedMethod.name}
              </button>
            )}
          </div>

          {/* Payment lines */}
          {payments.length > 0 && (
            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-slate-300 w-28">{p.method_name}</span>
                  <input
                    type="number"
                    value={p.amount}
                    onChange={e => updateAmount(i, e.target.value)}
                    className="input-field flex-1"
                  />
                  <button onClick={() => removePayment(i)} className="text-red-400 hover:text-red-300">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-slate-700">
                <span className="text-slate-400">Pagado:</span>
                <span className={totalPaid >= (total - discount) ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {formatMoney(totalPaid)}
                </span>
              </div>
              {remaining > 0 && <p className="text-red-400 text-sm">Falta: {formatMoney(remaining)}</p>}
              {totalPaid > (total - discount) && (
                <p className="text-yellow-400 text-sm">Cambio: {formatMoney(totalPaid - (total - discount))}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={() => onConfirm(payments, discount)}
            disabled={payments.length === 0 || totalPaid < (total - discount)}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
}

export default function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [cashOpen, setCashOpen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [prods, cash] = await Promise.all([api.getProducts(), api.getCashCurrent()]);
      setProducts(prods);
      setCashOpen(cash);
      const cats = [...new Set(prods.map(p => p.category_name))].filter(Boolean);
      setCategories(cats);
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = activeCategory ? products.filter(p => p.category_name === activeCategory) : products;
  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const total = subtotal;

  function addToCart(product) {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  }

  function updateQty(id, delta) {
    setCart(cart.map(c => {
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      return newQty > 0 ? { ...c, qty: newQty } : c;
    }).filter(c => c.qty > 0));
  }

  function removeFromCart(id) {
    setCart(cart.filter(c => c.id !== id));
  }

  async function handleConfirmSale(payments, disc) {
    setError('');
    try {
      const sale = await api.createSale({
        items: cart.map(c => ({ product_id: c.id, quantity: c.qty })),
        payments,
        discount: disc,
      });
      setReceipt(sale);
      setCart([]);
      setDiscount(0);
      setShowPayment(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!cashOpen) {
    return <NoCashRegister onOpen={async (amount) => {
      const reg = await api.openCash(amount);
      setCashOpen(reg);
    }} />;
  }

  return (
    <div className="flex h-full">
      {/* Products grid */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                !activeCategory ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="card hover:border-emerald-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{product.category_name}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    product.type === 'COMPOSITE' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {product.type === 'COMPOSITE' ? 'PREP' : 'DIR'}
                  </span>
                </div>
                <p className="text-emerald-400 font-bold mt-2">{formatMoney(product.price)}</p>
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded">+ Agregar</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart sidebar */}
      <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ShoppingCart size={18} /> Carrito
            {cart.length > 0 && (
              <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.reduce((s, c) => s + c.qty, 0)}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Carrito vacío</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-white flex-1">{item.name}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center hover:bg-slate-600">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center hover:bg-slate-600">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-emerald-400 font-medium text-sm">{formatMoney(item.price * item.qty)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Desc:</label>
            <input
              type="number"
              value={discount}
              onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
              className="input-field text-sm py-1"
              placeholder="0"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-orange-400">
              <span>Descuento</span>
              <span>-{formatMoney(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-emerald-400">
            <span>Total</span>
            <span>{formatMoney(total - discount)}</span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cobrar
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          cart={cart}
          total={total}
          discount={discount}
          onConfirm={handleConfirmSale}
          onClose={() => setShowPayment(false)}
        />
      )}

      {receipt && <ReceiptModal sale={receipt} onClose={() => { setReceipt(null); loadData(); }} />}
    </div>
  );
}

function NoCashRegister({ onOpen }) {
  const [amount, setAmount] = useState(0);
  return (
    <div className="flex items-center justify-center h-full">
      <div className="card w-full max-w-sm text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-yellow-400" />
        <h2 className="text-xl font-bold">Caja Cerrada</h2>
        <p className="text-slate-400 text-sm">Debes abrir caja para empezar a vender</p>
        <div>
          <label className="block text-sm text-slate-300 mb-1 text-left">Monto inicial</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="input-field"
            placeholder="50000"
          />
        </div>
        <button onClick={() => onOpen(amount)} className="btn-primary w-full">
          Abrir Caja
        </button>
      </div>
    </div>
  );
}
