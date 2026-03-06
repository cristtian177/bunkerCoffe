const express = require('express');
const { all, get, run } = require('../db');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// GET all inventory items
router.get('/', authMiddleware, (req, res) => {
  const items = all("SELECT * FROM inventory WHERE active = 1 ORDER BY name");
  res.json(items);
});

// GET low stock alerts
router.get('/alerts', authMiddleware, (req, res) => {
  const items = all("SELECT * FROM inventory WHERE active = 1 AND stock <= min_stock ORDER BY stock ASC");
  res.json(items);
});

// GET single item
router.get('/:id', authMiddleware, (req, res) => {
  const item = get("SELECT * FROM inventory WHERE id = ?", [req.params.id]);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  res.json(item);
});

// POST create item (admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, description, stock, unit, min_stock, cost_per_unit } = req.body;
  if (!name || !unit) return res.status(400).json({ error: 'Nombre y unidad requeridos' });

  const result = run(
    "INSERT INTO inventory (name, description, stock, unit, min_stock, cost_per_unit) VALUES (?,?,?,?,?,?)",
    [name, description || null, stock || 0, unit, min_stock || 0, cost_per_unit || 0]
  );

  if (stock > 0) {
    run("INSERT INTO stock_movements (inventory_id, type, quantity, reason) VALUES (?,?,?,?)",
      [result.lastID, 'IN', stock, 'Stock inicial']);
  }

  const item = get("SELECT * FROM inventory WHERE id = ?", [result.lastID]);
  res.status(201).json(item);
});

// PUT update item (admin)
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, description, unit, min_stock, cost_per_unit } = req.body;
  run(
    "UPDATE inventory SET name=?, description=?, unit=?, min_stock=?, cost_per_unit=?, updated_at=datetime('now','localtime') WHERE id=?",
    [name, description, unit, min_stock, cost_per_unit, req.params.id]
  );
  const item = get("SELECT * FROM inventory WHERE id = ?", [req.params.id]);
  res.json(item);
});

// POST restock / adjust (admin)
router.post('/:id/movement', authMiddleware, adminOnly, (req, res) => {
  const { type, quantity, reason } = req.body;
  if (!type || quantity === undefined) return res.status(400).json({ error: 'Tipo y cantidad requeridos' });

  const item = get("SELECT * FROM inventory WHERE id = ?", [req.params.id]);
  if (!item) return res.status(404).json({ error: 'No encontrado' });

  let newStock = item.stock;
  if (type === 'IN') newStock += Math.abs(quantity);
  else if (type === 'OUT') newStock -= Math.abs(quantity);
  else if (type === 'ADJUSTMENT') newStock = quantity;

  if (newStock < 0) return res.status(400).json({ error: 'Stock insuficiente' });

  run("UPDATE inventory SET stock = ?, updated_at = datetime('now','localtime') WHERE id = ?", [newStock, req.params.id]);
  run("INSERT INTO stock_movements (inventory_id, type, quantity, reason) VALUES (?,?,?,?)",
    [req.params.id, type, type === 'ADJUSTMENT' ? quantity - item.stock : quantity, reason || '']);

  const updated = get("SELECT * FROM inventory WHERE id = ?", [req.params.id]);
  res.json(updated);
});

// GET movements for an item
router.get('/:id/movements', authMiddleware, (req, res) => {
  const movements = all(
    "SELECT * FROM stock_movements WHERE inventory_id = ? ORDER BY created_at DESC LIMIT 50",
    [req.params.id]
  );
  res.json(movements);
});

// DELETE (soft) item (admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  run("UPDATE inventory SET active = 0 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
