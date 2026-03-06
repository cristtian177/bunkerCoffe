const express = require('express');
const { all, get, run } = require('../db');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Generate sale number
function nextSaleNumber() {
  const last = get("SELECT sale_number FROM sales ORDER BY id DESC LIMIT 1");
  if (!last) return 'VTA-0001';
  const num = parseInt(last.sale_number.split('-')[1]) + 1;
  return `VTA-${String(num).padStart(4, '0')}`;
}

// GET all sales (with filters)
router.get('/', authMiddleware, (req, res) => {
  const { date, cash_register_id, limit = 50 } = req.query;
  let sql = `
    SELECT s.*, u.name as user_name
    FROM sales s
    JOIN users u ON s.user_id = u.id
  `;
  const params = [];
  const conditions = [];

  if (date) {
    conditions.push("DATE(s.created_at) = ?");
    params.push(date);
  }
  if (cash_register_id) {
    conditions.push("s.cash_register_id = ?");
    params.push(cash_register_id);
  }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ` ORDER BY s.created_at DESC LIMIT ?`;
  params.push(parseInt(limit));

  const sales = all(sql, params);
  res.json(sales);
});

// GET single sale with items and payments
router.get('/:id', authMiddleware, (req, res) => {
  const sale = get("SELECT s.*, u.name as user_name FROM sales s JOIN users u ON s.user_id = u.id WHERE s.id = ?", [req.params.id]);
  if (!sale) return res.status(404).json({ error: 'No encontrada' });

  sale.items = all(`
    SELECT si.*, p.name as product_name
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.sale_id = ?
  `, [sale.id]);

  sale.payments = all(`
    SELECT sp.*, pm.name as method_name
    FROM sale_payments sp
    JOIN payment_methods pm ON sp.payment_method_id = pm.id
    WHERE sp.sale_id = ?
  `, [sale.id]);

  res.json(sale);
});

// POST create sale (the main POS action)
router.post('/', authMiddleware, (req, res) => {
  const { items, payments, discount = 0, notes } = req.body;

  if (!items || !items.length) return res.status(400).json({ error: 'Agrega productos' });
  if (!payments || !payments.length) return res.status(400).json({ error: 'Selecciona método de pago' });

  // Check open cash register
  const cashRegister = get("SELECT * FROM cash_registers WHERE opened_by = ? AND status = 'OPEN'", [req.user.id]);
  if (!cashRegister) {
    // Also check any open register for any user
    const anyOpen = get("SELECT * FROM cash_registers WHERE status = 'OPEN'");
    if (!anyOpen) return res.status(400).json({ error: 'Debes abrir caja primero' });
  }
  const crId = cashRegister ? cashRegister.id : get("SELECT * FROM cash_registers WHERE status = 'OPEN'").id;

  // Calculate totals
  let subtotal = 0;
  const productDetails = [];
  for (const item of items) {
    const product = get("SELECT * FROM products WHERE id = ? AND active = 1", [item.product_id]);
    if (!product) return res.status(400).json({ error: `Producto ${item.product_id} no encontrado` });
    subtotal += product.price * item.quantity;
    productDetails.push({ ...product, qty: item.quantity });
  }

  const total = subtotal - discount;

  // Validate payment amounts
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalPaid < total) return res.status(400).json({ error: `Pago insuficiente. Faltan $${total - totalPaid}` });

  // Check stock for all items before processing
  for (const pd of productDetails) {
    if (pd.type === 'DIRECT' && pd.inventory_id) {
      const inv = get("SELECT * FROM inventory WHERE id = ?", [pd.inventory_id]);
      if (inv.stock < pd.qty) {
        return res.status(400).json({ error: `Stock insuficiente: ${inv.name} (${inv.stock} disponibles)` });
      }
    } else if (pd.type === 'COMPOSITE') {
      const recipe = all("SELECT ri.*, i.name, i.stock FROM recipe_items ri JOIN inventory i ON ri.inventory_id = i.id WHERE ri.product_id = ?", [pd.id]);
      for (const ri of recipe) {
        const needed = ri.quantity * pd.qty;
        if (ri.stock < needed) {
          return res.status(400).json({ error: `Stock insuficiente: ${ri.name} (necesitas ${needed}, hay ${ri.stock})` });
        }
      }
    }
  }

  // Create sale
  const saleNumber = nextSaleNumber();
  const saleResult = run(
    "INSERT INTO sales (sale_number, user_id, cash_register_id, subtotal, discount, total, notes) VALUES (?,?,?,?,?,?,?)",
    [saleNumber, req.user.id, crId, subtotal, discount, total, notes || null]
  );
  const saleId = saleResult.lastID;

  // Create sale items and deduct stock
  for (const pd of productDetails) {
    run("INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?,?,?,?,?)",
      [saleId, pd.id, pd.qty, pd.price, pd.price * pd.qty]);

    // Deduct inventory
    if (pd.type === 'DIRECT' && pd.inventory_id) {
      run("UPDATE inventory SET stock = stock - ?, updated_at = datetime('now','localtime') WHERE id = ?", [pd.qty, pd.inventory_id]);
      run("INSERT INTO stock_movements (inventory_id, type, quantity, reason) VALUES (?,?,?,?)",
        [pd.inventory_id, 'OUT', pd.qty, `Venta ${saleNumber}`]);
    } else if (pd.type === 'COMPOSITE') {
      const recipe = all("SELECT * FROM recipe_items WHERE product_id = ?", [pd.id]);
      for (const ri of recipe) {
        const deduct = ri.quantity * pd.qty;
        run("UPDATE inventory SET stock = stock - ?, updated_at = datetime('now','localtime') WHERE id = ?", [deduct, ri.inventory_id]);
        run("INSERT INTO stock_movements (inventory_id, type, quantity, reason) VALUES (?,?,?,?)",
          [ri.inventory_id, 'OUT', deduct, `Venta ${saleNumber} - ${pd.name}`]);
      }
    }
  }

  // Create payments
  for (const payment of payments) {
    run("INSERT INTO sale_payments (sale_id, payment_method_id, amount) VALUES (?,?,?)",
      [saleId, payment.payment_method_id, payment.amount]);
  }

  // Return full sale
  const sale = get("SELECT s.*, u.name as user_name FROM sales s JOIN users u ON s.user_id = u.id WHERE s.id = ?", [saleId]);
  sale.items = all("SELECT si.*, p.name as product_name FROM sale_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?", [saleId]);
  sale.payments = all("SELECT sp.*, pm.name as method_name FROM sale_payments sp JOIN payment_methods pm ON sp.payment_method_id = pm.id WHERE sp.sale_id = ?", [saleId]);
  sale.change = totalPaid > total ? totalPaid - total : 0;

  res.status(201).json(sale);
});

module.exports = router;
