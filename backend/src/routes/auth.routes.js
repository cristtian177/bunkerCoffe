const express = require('express');
const bcrypt = require('bcryptjs');
const { get } = require('../db');
const { generateToken, authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  const user = get("SELECT * FROM users WHERE username = ? AND active = 1", [username]);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, username: user.username, role: user.role }
  });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
