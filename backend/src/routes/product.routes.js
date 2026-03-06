const express = require('express');
const { all, get, run } = require('../db');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// ====== CATEGORIES ======
router.get('/categories', authMiddleware, (req, res) => {
  const cats = all("SELECT * FROM categories WHERE active = 1 ORDER BY name");
  res.json(cats);
});

router.post('/categories', authMiddleware, adminOnly, (req, res) => {
  const { name, type, color, icon } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Nombre y tipo requeridos' });
  const result = run("INSERT INTO categories (name, type, color, icon) VALUES (?,?,?,?)", [name, type, color, icon]);
  const cat = get("SELECT * FROM categories WHERE id = ?", [result.lastID]);
  res.status(201).json(cat);
});

router.put('/categories/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, type, color, icon } = req.body;
  run("UPDATE categories SET name=?, type=?, color=?, icon=? WHERE id=?", [name, type, color, icon, req.params.id]);
  const cat = get("SELECT * FROM categories WHERE id = ?", [req.params.id]);
  res.json(cat);
});

router.delete('/categories/:id', authMiddleware, adminOnly, (req, res) => {
  run("UPDATE categories SET active = 0 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// ====== PRODUCTS ======
router.get('/', authMiddleware, (req, res) => {
  const products = all(`
    SELECT p.*, c.name as category_name, c.color as category_color
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1
    ORDER BY c.name, p.name
  `);

  // Attach recipe items for composite products
  products.forEach(p => {
    if (p.type === 'COMPOSITE') {
      p.recipe = all(`
        SELECT ri.*, i.name as inventory_name, i.unit, i.stock
        FROM recipe_items ri
        JOIN inventory i ON ri.inventory_id = i.id
        WHERE ri.product_id = ?
      `, [p.id]);
    }
  });

  res.json(products);
});

router.get('/:id', authMiddleware, (req, res) => {
  const product = get(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [req.params.id]);
  if (!product) return res.status(404).json({ error: 'No encontrado' });

  if (product.type === 'COMPOSITE') {
    product.recipe = all(`
      SELECT ri.*, i.name as inventory_name, i.unit, i.stock
      FROM recipe_items ri
      JOIN inventory i ON ri.inventory_id = i.id
      WHERE ri.product_id = ?
    `, [product.id]);
  }

  res.json(product);
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, description, price, type, category_id, inventory_id, recipe } = req.body;
  if (!name || !price || !type) return res.status(400).json({ error: 'Nombre, precio y tipo requeridos' });

  const result = run(
    "INSERT INTO products (name, description, price, type, category_id, inventory_id) VALUES (?,?,?,?,?,?)",
    [name, description, price, type, category_id, type === 'DIRECT' ? inventory_id : null]
  );

  // Save recipe if composite
  if (type === 'COMPOSITE' && recipe && recipe.length > 0) {
    recipe.forEach(item => {
      run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?,?,?)",
        [result.lastID, item.inventory_id, item.quantity]);
    });
  }

  const product = get("SELECT * FROM products WHERE id = ?", [result.lastID]);
  res.status(201).json(product);
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, description, price, type, category_id, inventory_id, recipe } = req.body;

  run(
    "UPDATE products SET name=?, description=?, price=?, type=?, category_id=?, inventory_id=?, updated_at=datetime('now','localtime') WHERE id=?",
    [name, description, price, type, category_id, type === 'DIRECT' ? inventory_id : null, req.params.id]
  );

  // Update recipe
  if (type === 'COMPOSITE' && recipe) {
    run("DELETE FROM recipe_items WHERE product_id = ?", [req.params.id]);
    recipe.forEach(item => {
      run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?,?,?)",
        [req.params.id, item.inventory_id, item.quantity]);
    });
  }

  const product = get("SELECT * FROM products WHERE id = ?", [req.params.id]);
  res.json(product);
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  run("UPDATE products SET active = 0 WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
