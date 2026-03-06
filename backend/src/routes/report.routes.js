const express = require('express');
const { all, get } = require('../db');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Dashboard summary
router.get('/dashboard', authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const todaySales = get("SELECT COALESCE(SUM(total),0) as total, COUNT(*) as count FROM sales WHERE DATE(created_at) = ?", [today]);
  const lowStock = all("SELECT * FROM inventory WHERE active = 1 AND stock <= min_stock");
  const topProducts = all(`
    SELECT p.name, SUM(si.quantity) as total_qty, SUM(si.subtotal) as total_revenue
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE DATE(s.created_at) = ?
    GROUP BY p.id ORDER BY total_qty DESC LIMIT 5
  `, [today]);

  const paymentBreakdown = all(`
    SELECT pm.name, COALESCE(SUM(sp.amount),0) as total
    FROM sale_payments sp
    JOIN payment_methods pm ON sp.payment_method_id = pm.id
    JOIN sales s ON sp.sale_id = s.id
    WHERE DATE(s.created_at) = ?
    GROUP BY pm.id
  `, [today]);

  res.json({
    today: { total: todaySales.total, count: todaySales.count },
    low_stock: lowStock,
    top_products: topProducts,
    payment_breakdown: paymentBreakdown
  });
});

// Sales report by date range
router.get('/sales', authMiddleware, (req, res) => {
  const { from, to } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const dateFrom = from || today;
  const dateTo = to || today;

  const sales = all(`
    SELECT s.*, u.name as user_name
    FROM sales s JOIN users u ON s.user_id = u.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
    ORDER BY s.created_at DESC
  `, [dateFrom, dateTo]);

  const summary = get(`
    SELECT COALESCE(SUM(total),0) as total, COUNT(*) as count, COALESCE(AVG(total),0) as avg_sale
    FROM sales WHERE DATE(created_at) BETWEEN ? AND ?
  `, [dateFrom, dateTo]);

  res.json({ sales, summary });
});

// Inventory report
router.get('/inventory', authMiddleware, (req, res) => {
  const items = all(`
    SELECT i.*,
      (SELECT COALESCE(SUM(CASE WHEN type='IN' THEN quantity ELSE 0 END),0) FROM stock_movements WHERE inventory_id = i.id) as total_in,
      (SELECT COALESCE(SUM(CASE WHEN type='OUT' THEN quantity ELSE 0 END),0) FROM stock_movements WHERE inventory_id = i.id) as total_out
    FROM inventory i WHERE i.active = 1
    ORDER BY i.name
  `);
  res.json(items);
});

module.exports = router;
