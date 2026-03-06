import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/pos');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-bg-secondary)] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[var(--color-primary)] rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="2" x2="6" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="10" y1="2" x2="10" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="2" x2="14" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Coffee Bunker</h1>
                <p className="text-xs text-[var(--color-text-muted)]">Sistema POS</p>
              </div>
            </div>
          </div>
          
          {/* Center Content */}
          <div className="max-w-md">
            <h2 className="font-display text-5xl leading-tight text-[var(--color-text-primary)] mb-6">
              Best Served<br />
              <span className="text-[var(--color-primary)]">Often</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
              Sistema de punto de venta disenado para optimizar las operaciones de tu cafeteria fitness.
            </p>
          </div>
          
          {/* Footer */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="status-dot status-dot-success" />
              <span className="text-sm text-[var(--color-text-muted)]">Sistema Activo</span>
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">v2.0</span>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-bg-primary)]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 8h1a4 4 0 0 1 0 8h-1" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="2" x2="6" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="2" x2="10" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="14" y1="2" x2="14" y2="4" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Coffee Bunker</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Sistema POS - Cafeteria Fitness</p>
          </div>
          
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Bienvenido</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Ingresa tus credenciales para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[var(--color-danger-muted)] border border-red-500/30 text-[var(--color-danger)] px-4 py-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field"
                placeholder="Ingresa tu usuario"
                autoFocus
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Ingresa tu contrasena"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          {/* Help Text */}
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
            Contacta al administrador si olvidaste tus credenciales
          </p>
        </div>
      </div>
    </div>
  );
}
