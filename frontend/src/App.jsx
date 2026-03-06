import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import CashRegister from './pages/CashRegister';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { ShoppingCart, Package, Coffee, BarChart3, Settings as SettingsIcon, LogOut, Wallet } from 'lucide-react';

function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/pos', icon: ShoppingCart, label: 'POS', show: true },
    { to: '/inventory', icon: Package, label: 'Inventario', show: true },
    { to: '/products', icon: Coffee, label: 'Productos', show: isAdmin },
    { to: '/cash', icon: Wallet, label: 'Caja', show: true },
    { to: '/reports', icon: BarChart3, label: 'Reportes', show: true },
    { to: '/settings', icon: SettingsIcon, label: 'Config', show: isAdmin },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <Coffee size={24} /> Coffee Bunker
          </h1>
          <p className="text-xs text-slate-400 mt-1">Sistema POS</p>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {links.filter(l => l.show).map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-slate-950">
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
