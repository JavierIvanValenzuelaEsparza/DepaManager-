import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();

  // Verificar si hay errores de OAuth en la URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam === 'wrong_portal') {
      setError('⚠️ ' + (messageParam || 'Por favor, usa el portal correcto para tu tipo de cuenta'));
    } else if (errorParam === 'auth_failed') {
      setError('❌ Error de autenticación con Google');
    } else if (errorParam === 'user_not_found') {
      setError('❌ Usuario no encontrado');
    }
  }, [searchParams]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol === 'Administrador') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.rol === 'Inquilino') {
        // Si es inquilino pero está en login de admin, mostrar error
        setError('⚠️ Esta es la zona de administradores. Por favor, usa el portal de inquilinos.');
        // Limpiar después de 3 segundos y redirigir
        setTimeout(() => {
          window.location.href = '/tenant/login';
        }, 3000);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      // Validar que sea administrador
      if (result.success && result.user) {
        if (result.user.rol === 'Administrador') {
          // ✅ Es administrador, redirigir al dashboard
          console.log('✅ Login exitoso como Administrador');
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 200);
        } else {
          // ❌ No es administrador
          setError('⚠️ Esta cuenta no tiene permisos de administrador. Por favor, usa el portal de inquilinos.');
          setLoading(false);
          // Redirigir después de 3 segundos
          setTimeout(() => {
            window.location.href = '/tenant/login';
          }, 3000);
          return;
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('🔐 Iniciando login con Google desde Admin...');
    // Guardar contexto de login para validación posterior
    sessionStorage.setItem('login_context', 'admin');
    loginWithGoogle('admin');
  };

  return (
    <div className="min-h-screen flex">
      {/* COLUMNA IZQUIERDA - FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Bienvenid@ de nuevo!
            </h1>
            <p className="text-slate-600 text-sm">
              Acceso exclusivo para administradores
            </p>
          </div>

          {/* ✅ BOTÓN GOOGLE */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-medium py-3 px-6 rounded-full hover:bg-slate-50 transition-all shadow-sm mb-4"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5"
            />
            Continuar con Google
          </button>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">o</span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Correo*
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña*
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Botón de Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-full hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Botón volver */}
          <button
            onClick={() => navigate('/')}
            className="mt-6 text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA - ILUSTRACIÓN */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Texto adicional */}
        <div className="text-center text-white z-10">
          <p className="text-4xl font-bold mb-4">DepaManager</p>
          <p className="text-emerald-100 text-lg">Gestión Inteligente de Propiedades</p>
        </div>
      </div>
    </div>
  );
}