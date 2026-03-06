const bcrypt = require('bcryptjs');
const { initDB, run, get } = require('./db');

async function seed() {
  await initDB();
  console.log('🗄️  Base de datos inicializada');

  // Check if already seeded
  const existing = get("SELECT COUNT(*) as count FROM users");
  if (existing && existing.count > 0) {
    console.log('⚡ Ya tiene datos, saltando seed');
    return;
  }

  // Users
  const adminPass = bcrypt.hashSync('admin123', 10);
  const chefPass = bcrypt.hashSync('chef123', 10);
  run("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)", ['Administrador', 'admin', adminPass, 'ADMIN']);
  run("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)", ['Chef', 'chef', chefPass, 'OPERATOR']);
  console.log('👤 Usuarios creados (admin/admin123, chef/chef123)');

  // Payment methods
  run("INSERT INTO payment_methods (name) VALUES (?)", ['Efectivo']);
  run("INSERT INTO payment_methods (name) VALUES (?)", ['Nequi']);
  run("INSERT INTO payment_methods (name) VALUES (?)", ['Transferencia']);
  console.log('💳 Métodos de pago creados');

  // Categories
  run("INSERT INTO categories (name, type, color) VALUES (?, ?, ?)", ['Batidos', 'COMPOSITE', '#8B5CF6']);
  run("INSERT INTO categories (name, type, color) VALUES (?, ?, ?)", ['Desayunos', 'COMPOSITE', '#F59E0B']);
  run("INSERT INTO categories (name, type, color) VALUES (?, ?, ?)", ['Bebidas', 'DIRECT', '#3B82F6']);
  run("INSERT INTO categories (name, type, color) VALUES (?, ?, ?)", ['Snacks', 'DIRECT', '#10B981']);
  run("INSERT INTO categories (name, type, color) VALUES (?, ?, ?)", ['Suplementos', 'DIRECT', '#EF4444']);
  console.log('📂 Categorías creadas');

  // Inventory (insumos)
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Whey Protein Vainilla 2kg', 2000, 'g', 300, 35]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Whey Protein Chocolate 2kg', 2000, 'g', 300, 35]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Leche entera 1L', 20, 'units', 5, 4500]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Banano', 30, 'units', 10, 500]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Avena en hojuelas 1kg', 1000, 'g', 200, 8]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Huevos', 60, 'units', 12, 600]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Pan integral', 20, 'units', 5, 800]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Agua 600ml', 24, 'units', 6, 1000]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Barra proteína', 12, 'units', 3, 4000]);
  run("INSERT INTO inventory (name, stock, unit, min_stock, cost_per_unit) VALUES (?, ?, ?, ?, ?)",
    ['Creatina 500g', 500, 'g', 100, 60]);
  console.log('📦 Inventario creado');

  // Products - DIRECT
  run("INSERT INTO products (name, price, type, category_id, inventory_id) VALUES (?, ?, ?, ?, ?)",
    ['Agua 600ml', 2500, 'DIRECT', 3, 8]);
  run("INSERT INTO products (name, price, type, category_id, inventory_id) VALUES (?, ?, ?, ?, ?)",
    ['Barra de Proteína', 8000, 'DIRECT', 4, 9]);

  // Products - COMPOSITE
  run("INSERT INTO products (name, price, type, category_id) VALUES (?, ?, ?, ?)",
    ['Batido Proteína Vainilla', 8000, 'COMPOSITE', 1]);
  run("INSERT INTO products (name, price, type, category_id) VALUES (?, ?, ?, ?)",
    ['Batido Proteína Chocolate', 8000, 'COMPOSITE', 1]);
  run("INSERT INTO products (name, price, type, category_id) VALUES (?, ?, ?, ?)",
    ['Desayuno Fitness', 12000, 'COMPOSITE', 2]);
  console.log('🛍️  Productos creados');

  // Recipes
  // Batido Vainilla: 30g proteína + 1 leche + 1 banano
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [3, 1, 30]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [3, 3, 1]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [3, 4, 1]);

  // Batido Chocolate: 30g proteína choco + 1 leche + 1 banano
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [4, 2, 30]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [4, 3, 1]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [4, 4, 1]);

  // Desayuno Fitness: 2 huevos + 2 pan + 50g avena + 1 banano
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [5, 6, 2]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [5, 7, 2]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [5, 5, 50]);
  run("INSERT INTO recipe_items (product_id, inventory_id, quantity) VALUES (?, ?, ?)", [5, 4, 1]);
  console.log('📋 Recetas creadas');

  console.log('\n✅ Seed completado!');
  console.log('   Admin: admin / admin123');
  console.log('   Chef:  chef  / chef123');
}

seed().catch(console.error);
