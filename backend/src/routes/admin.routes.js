const express = require('express');
const bcrypt = require('bcryptjs');
const { all, get, run } = require('../db');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// ====== PAYMENT METHODS ======
router.get('/payment-methods', authMiddleware, (req, res) => {
  const methods = all("SELECT * FROM payment_methods WHERE active = 1 ORDER BY name");
  res.json(methods);
});

router.post('/payment-methods', authMiddleware, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const result = run("INSERT INTO payment_methods (name) VALUES (?)", [name]);
  const method = get("SELECT * FROM payment_methods WHERE id = ?", [result.lastID]);
  res.status(201).json(method);
});

router.put('/payment-methods/:id', authMiddleware, adminOnly, (req, res) => {
  const { name } = req.body;
  run("UPDATE payment_methods SET name = ? WHERE id = ?", [name, req.params.id]);
  const method = get("SELECT * FROM payment_methods WHERE id = ?", [req.params.id]);
  res.json(method);
});

router.delete('/payment-methods/:id', authMiddleware, adminOnly, (req, res) => {
  run("UPDATE payment_methods SET active = 0 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// ====== USERS ======
router.get('/users', authMiddleware, adminOnly, (req, res) => {
  const users = all("SELECT id, name, username, role, active, created_at FROM users ORDER BY name");
  res.json(users);
});

router.post('/users', authMiddleware, adminOnly, (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const existing = get("SELECT id FROM users WHERE username = ?", [username]);
  if (existing) return res.status(400).json({ error: 'Username ya existe' });

  const hash = bcrypt.hashSync(password, 10);
  const result = run("INSERT INTO users (name, username, password, role) VALUES (?,?,?,?)", [name, username, hash, role || 'OPERATOR']);
  const user = get("SELECT id, name, username, role, active, created_at FROM users WHERE id = ?", [result.lastID]);
  res.status(201).json(user);
});

router.put('/users/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, username, password, role, active } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    run("UPDATE users SET name=?, username=?, password=?, role=?, active=?, updated_at=datetime('now','localtime') WHERE id=?",
      [name, username, hash, role, active ? 1 : 0, req.params.id]);
  } else {
    run("UPDATE users SET name=?, username=?, role=?, active=?, updated_at=datetime('now','localtime') WHERE id=?",
      [name, username, role, active ? 1 : 0, req.params.id]);
  }
  const user = get("SELECT id, name, username, role, active FROM users WHERE id = ?", [req.params.id]);
  res.json(user);
});

module.exports = router;
