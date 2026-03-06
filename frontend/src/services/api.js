const API = '/api';

function getToken() {
  return localStorage.getItem('cb_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_user');
    window.location.href = '/login';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),

  // Products
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/products/categories'),
  createCategory: (data) => request('/products/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/products/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/products/categories/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/inventory'),
  getAlerts: () => request('/inventory/alerts'),
  createInventoryItem: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryItem: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addMovement: (id, data) => request(`/inventory/${id}/movement`, { method: 'POST', body: JSON.stringify(data) }),
  getMovements: (id) => request(`/inventory/${id}/movements`),
  deleteInventoryItem: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: (params) => request(`/sales?${new URLSearchParams(params)}`),
  getSale: (id) => request(`/sales/${id}`),
  createSale: (data) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),

  // Cash Register
  getCashCurrent: () => request('/cash/current'),
  getCashHistory: () => request('/cash/history'),
  openCash: (amount) => request('/cash/open', { method: 'POST', body: JSON.stringify({ initial_amount: amount }) }),
  closeCash: (final_amount, notes) => request('/cash/close', { method: 'POST', body: JSON.stringify({ final_amount, notes }) }),

  // Payment Methods
  getPaymentMethods: () => request('/admin/payment-methods'),
  createPaymentMethod: (name) => request('/admin/payment-methods', { method: 'POST', body: JSON.stringify({ name }) }),
  updatePaymentMethod: (id, name) => request(`/admin/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deletePaymentMethod: (id) => request(`/admin/payment-methods/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/admin/users'),
  createUser: (data) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Reports
  getDashboard: () => request('/reports/dashboard'),
  getSalesReport: (from, to) => request(`/reports/sales?from=${from}&to=${to}`),
  getInventoryReport: () => request('/reports/inventory'),
};
