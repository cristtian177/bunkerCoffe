import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Mock data for demo
const MOCK_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' },
  { id: 2, username: 'cajero', password: 'cajero123', name: 'Juan Cajero', role: 'cashier' },
]

const MOCK_CATEGORIES = [
  { id: 1, name: 'Bebidas Calientes' },
  { id: 2, name: 'Bebidas Frias' },
  { id: 3, name: 'Snacks Fitness' },
  { id: 4, name: 'Suplementos' },
  { id: 5, name: 'Postres' },
]

const MOCK_PRODUCTS = [
  { id: 1, name: 'Americano', price: 5500, category_id: 1, category_name: 'Bebidas Calientes', available: true },
  { id: 2, name: 'Cappuccino', price: 7500, category_id: 1, category_name: 'Bebidas Calientes', available: true },
  { id: 3, name: 'Latte', price: 8000, category_id: 1, category_name: 'Bebidas Calientes', available: true },
  { id: 4, name: 'Espresso', price: 4500, category_id: 1, category_name: 'Bebidas Calientes', available: true },
  { id: 5, name: 'Mocha', price: 9000, category_id: 1, category_name: 'Bebidas Calientes', available: true },
  { id: 6, name: 'Cold Brew', price: 8500, category_id: 2, category_name: 'Bebidas Frias', available: true },
  { id: 7, name: 'Frappe Proteico', price: 12000, category_id: 2, category_name: 'Bebidas Frias', available: true },
  { id: 8, name: 'Smoothie Verde', price: 11000, category_id: 2, category_name: 'Bebidas Frias', available: true },
  { id: 9, name: 'Limonada de Coco', price: 7000, category_id: 2, category_name: 'Bebidas Frias', available: true },
  { id: 10, name: 'Barra de Proteina', price: 8000, category_id: 3, category_name: 'Snacks Fitness', available: true },
  { id: 11, name: 'Bowl de Avena', price: 12000, category_id: 3, category_name: 'Snacks Fitness', available: true },
  { id: 12, name: 'Mix de Frutos Secos', price: 6000, category_id: 3, category_name: 'Snacks Fitness', available: true },
  { id: 13, name: 'Galletas de Proteina', price: 5500, category_id: 3, category_name: 'Snacks Fitness', available: true },
  { id: 14, name: 'Whey Protein Shake', price: 15000, category_id: 4, category_name: 'Suplementos', available: true },
  { id: 15, name: 'Pre-Workout', price: 8000, category_id: 4, category_name: 'Suplementos', available: true },
  { id: 16, name: 'Brownie Fit', price: 7000, category_id: 5, category_name: 'Postres', available: true },
  { id: 17, name: 'Cheesecake Proteico', price: 9500, category_id: 5, category_name: 'Postres', available: true },
]

const MOCK_PAYMENT_METHODS = [
  { id: 1, name: 'Efectivo', active: true },
  { id: 2, name: 'Tarjeta Debito', active: true },
  { id: 3, name: 'Tarjeta Credito', active: true },
  { id: 4, name: 'Nequi', active: true },
  { id: 5, name: 'Daviplata', active: true },
]

const MOCK_INVENTORY = [
  { id: 1, name: 'Cafe en grano', unit: 'kg', quantity: 15, min_stock: 5, cost: 45000 },
  { id: 2, name: 'Leche entera', unit: 'L', quantity: 20, min_stock: 10, cost: 4500 },
  { id: 3, name: 'Leche de almendras', unit: 'L', quantity: 8, min_stock: 5, cost: 12000 },
  { id: 4, name: 'Whey Protein', unit: 'kg', quantity: 3, min_stock: 2, cost: 120000 },
  { id: 5, name: 'Azucar', unit: 'kg', quantity: 10, min_stock: 3, cost: 8000 },
  { id: 6, name: 'Vasos 12oz', unit: 'unidad', quantity: 150, min_stock: 50, cost: 200 },
  { id: 7, name: 'Tapas', unit: 'unidad', quantity: 180, min_stock: 50, cost: 100 },
  { id: 8, name: 'Avena', unit: 'kg', quantity: 5, min_stock: 2, cost: 15000 },
]

export interface User {
  id: number
  username: string
  name: string
  role: string
}

export interface Product {
  id: number
  name: string
  price: number
  category_id: number
  category_name: string
  available: boolean
}

export interface CartItem extends Product {
  qty: number
}

export interface Sale {
  id: number
  sale_number: string
  total: number
  discount: number
  change: number
  items: { product_name: string; quantity: number; subtotal: number }[]
  payments: { method_name: string; amount: number }[]
  user_name: string
  created_at: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

interface CashState {
  isOpen: boolean
  initialAmount: number
  currentAmount: number
  openedAt: string | null
  openCash: (amount: number) => void
  closeCash: () => { sales: number; total: number }
  addSale: (amount: number) => void
}

interface DataState {
  products: Product[]
  categories: typeof MOCK_CATEGORIES
  paymentMethods: typeof MOCK_PAYMENT_METHODS
  inventory: typeof MOCK_INVENTORY
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id' | 'sale_number' | 'created_at' | 'user_name'> & { items: CartItem[] }, user: User, payments: { payment_method_id: number; amount: number }[]) => Sale
  getProducts: () => Product[]
  getCategories: () => typeof MOCK_CATEGORIES
  getPaymentMethods: () => typeof MOCK_PAYMENT_METHODS
  getInventory: () => typeof MOCK_INVENTORY
  updateInventoryItem: (id: number, data: Partial<typeof MOCK_INVENTORY[0]>) => void
  addInventoryItem: (item: Omit<typeof MOCK_INVENTORY[0], 'id'>) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: number, data: Partial<Product>) => void
  deleteProduct: (id: number) => void
  addCategory: (name: string) => void
  deleteCategory: (id: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const user = MOCK_USERS.find(u => u.username === username && u.password === password)
        if (!user) {
          throw new Error('Credenciales invalidas')
        }
        const { password: _, ...safeUser } = user
        set({ user: safeUser, isAuthenticated: true })
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'cb-auth' }
  )
)

export const useCashStore = create<CashState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      initialAmount: 0,
      currentAmount: 0,
      openedAt: null,
      openCash: (amount: number) => set({ 
        isOpen: true, 
        initialAmount: amount, 
        currentAmount: amount,
        openedAt: new Date().toISOString()
      }),
      closeCash: () => {
        const state = get()
        const result = { 
          sales: state.currentAmount - state.initialAmount,
          total: state.currentAmount
        }
        set({ isOpen: false, initialAmount: 0, currentAmount: 0, openedAt: null })
        return result
      },
      addSale: (amount: number) => set(state => ({ currentAmount: state.currentAmount + amount })),
    }),
    { name: 'cb-cash' }
  )
)

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      paymentMethods: MOCK_PAYMENT_METHODS,
      inventory: MOCK_INVENTORY,
      sales: [],
      getProducts: () => get().products,
      getCategories: () => get().categories,
      getPaymentMethods: () => get().paymentMethods,
      getInventory: () => get().inventory,
      addSale: (saleData, user, payments) => {
        const state = get()
        const saleNumber = `VTA-${Date.now().toString(36).toUpperCase()}`
        const sale: Sale = {
          id: state.sales.length + 1,
          sale_number: saleNumber,
          total: saleData.total,
          discount: saleData.discount,
          change: saleData.change,
          items: saleData.items.map(i => ({
            product_name: i.name,
            quantity: i.qty,
            subtotal: i.price * i.qty
          })),
          payments: payments.map(p => ({
            method_name: state.paymentMethods.find(m => m.id === p.payment_method_id)?.name || 'Desconocido',
            amount: p.amount
          })),
          user_name: user.name,
          created_at: new Date().toISOString()
        }
        set(state => ({ sales: [...state.sales, sale] }))
        return sale
      },
      updateInventoryItem: (id, data) => set(state => ({
        inventory: state.inventory.map(i => i.id === id ? { ...i, ...data } : i)
      })),
      addInventoryItem: (item) => set(state => ({
        inventory: [...state.inventory, { ...item, id: Math.max(...state.inventory.map(i => i.id)) + 1 }]
      })),
      addProduct: (product) => set(state => ({
        products: [...state.products, { ...product, id: Math.max(...state.products.map(p => p.id)) + 1 }]
      })),
      updateProduct: (id, data) => set(state => ({
        products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProduct: (id) => set(state => ({
        products: state.products.filter(p => p.id !== id)
      })),
      addCategory: (name) => set(state => ({
        categories: [...state.categories, { id: Math.max(...state.categories.map(c => c.id)) + 1, name }]
      })),
      deleteCategory: (id) => set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
    }),
    { name: 'cb-data' }
  )
)
