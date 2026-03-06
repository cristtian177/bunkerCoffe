const express = require('express');
const { all, get, run } = require('../db');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// GET current open register
router.get('/current', authMiddleware, (req, res) => {
  const reg = get("SELECT cr.*, u.name as user_name FROM cash_registers cr JOIN users u ON cr.opened_by = u.id WHERE cr.status = 'OPEN' ORDER BY cr.opened_at DESC LIMIT 1");
  if (!reg) return res.json(null);

  // Calculate sales total for this register
  const salesData = get("SELECT COALESCE(SUM(total),0) as total_sales, COUNT(*) as num_sales FROM sales WHERE cash_register_id = ?", [reg.id]);
  const cashSales = get(`
    SELECT COALESCE(SUM(sp.amount),0) as cash_total
    FROM sale_payments sp
    JOIN sales s ON sp.sale_id = s.id
    JOIN payment_methods pm ON sp.payment_method_id = pm.id
    WHERE s.cash_register_id = ? AND pm.name = 'Efectivo'
  `, [reg.id]);

  reg.total_sales = salesData.total_sales;
  reg.num_sales = salesData.num_sales;
  reg.cash_sales = cashSales.cash_total;
  reg.expected_amount = reg.initial_amount + cashSales.cash_total;
  res.json(reg);
});

// GET history
router.get('/history', authMiddleware, (req, res) => {
  const registers = all(`
    SELECT cr.*, u.name as user_name
    FROM cash_registers cr
    JOIN users u ON cr.opened_by = u.id
    ORDER BY cr.opened_at DESC
    LIMIT 30
  `);
  res.json(registers);
});

// POST open register
router.post('/open', authMiddleware, (req, res) => {
  const { initial_amount = 0 } = req.body;

  // Check no open register
  const existing = get("SELECT * FROM cash_registers WHERE status = 'OPEN'");
  if (existing) return res.status(400).json({ error: 'Ya hay una caja abierta' });

  const result = run(
    "INSERT INTO cash_registers (opened_by, initial_amount) VALUES (?,?)",
    [req.user.id, initial_amount]
  );

  const reg = get("SELECT cr.*, u.name as user_name FROM cash_registers cr JOIN users u ON cr.opened_by = u.id WHERE cr.id = ?", [result.lastID]);
  res.status(201).json(reg);
});

// POST close register
router.post('/close', authMiddleware, (req, res) => {
  const { final_amount, notes } = req.body;
  if (final_amount === undefined) return res.status(400).json({ error: 'Monto final requerido' });

  const reg = get("SELECT * FROM cash_registers WHERE status = 'OPEN'");
  if (!reg) return res.status(400).json({ error: 'No hay caja abierta' });

  // Calculate expected
  const cashSales = get(`
    SELECT COALESCE(SUM(sp.amount),0) as cash_total
    FROM sale_payments sp
    JOIN sales s ON sp.sale_id = s.id
    JOIN payment_methods pm ON sp.payment_method_id = pm.id
    WHERE s.cash_register_id = ? AND pm.name = 'Efectivo'
  `, [reg.id]);

  const expected = reg.initial_amount + cashSales.cash_total;
  const difference = final_amount - expected;

  run(
    "UPDATE cash_registers SET closed_at=datetime('now','localtime'), final_amount=?, expected_amount=?, difference=?, notes=?, status='CLOSED' WHERE id=?",
    [final_amount, expected, difference, notes || null, reg.id]
  );

  const closed = get("SELECT cr.*, u.name as user_name FROM cash_registers cr JOIN users u ON cr.opened_by = u.id WHERE cr.id = ?", [reg.id]);
  res.json(closed);
});

module.exports = router;
