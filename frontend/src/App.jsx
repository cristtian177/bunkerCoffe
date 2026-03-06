import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import CashRegister from './pages/CashRegister';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { ShoppingCart, Package, Coffee, BarChart3, Settings as SettingsIcon, LogOut, Wallet, ChevronRight } from 'lucide-react';

function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta', show: true },
    { to: '/inventory', icon: Package, label: 'Inventario', show: true },
    { to: '/products', icon: Coffee, label: 'Productos', show: isAdmin },
    { to: '/cash', icon: Wallet, label: 'Caja', show: true },
    { to: '/reports', icon: BarChart3, label: 'Reportes', show: true },
    { to: '/settings', icon: SettingsIcon, label: 'Configuracion', show: isAdmin },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* Sidebar */}
      <aside className="w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="2" x2="6" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="2" x2="10" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="14" y1="2" x2="14" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)] truncate">Coffee Bunker</h1>
              <p className="text-xs text-[var(--color-text-muted)]">Sistema POS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.filter(l => l.show).map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
              }
            >
              <link.icon size={20} />
              <span className="flex-1">{link.label}</span>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center">
              <span className="text-sm font-semibold text-[var(--color-primary)]">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-9 h-9 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 transition-all"
              title="Cerrar sesion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-[var(--color-bg-primary)]">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/cash" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/pos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
