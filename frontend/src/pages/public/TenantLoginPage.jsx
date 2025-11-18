import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import loginTenantIllustration from '../../assets/login-tenant-illustration.png';

export default function TenantLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📤 TenantLoginPage - Enviando credenciales...');
      console.log('📧 Email:', email);
      
      // ✅ CORREGIDO: Pasar parámetros por separado
      const result = await login(email, password);

      if (result.success) {
        console.log('✅ Login exitoso para inquilino');
        console.log('🎭 Rol:', result.user?.rol);
        
        // ✅ Verificar que sea inquilino
        if (result.user.rol === 'Inquilino') {
          console.log('🔀 Redirigiendo a /tenant/dashboard');
          console.log('💾 Datos en localStorage antes de redirigir:');
          console.log('   - Token:', localStorage.getItem('depamanager_token') ? 'EXISTE' : 'NO EXISTE');
          console.log('   - User:', localStorage.getItem('depamanager_user'));
          
          // ✅ Usar window.location.href para forzar recarga completa
          setTimeout(() => {
            console.log('🚀 Ejecutando redirección...');
            window.location.href = '/tenant/dashboard';
          }, 200);
        } else if (result.user.rol === 'Administrador') {
          setError('⚠️ Esta cuenta es de administrador. Por favor, usa el portal de administradores.');
          // Redirigir después de 3 segundos
          setTimeout(() => {
            window.location.href = '/admin/auth';
          }, 3000);
        } else {
          setError('Rol de usuario no válido');
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('❌ Error en TenantLoginPage:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('🔐 Iniciando login con Google desde Tenant...');
    // Guardar contexto de login para validación posterior
    sessionStorage.setItem('login_context', 'tenant');
    loginWithGoogle('tenant');
  };

  return (
    <div className="min-h-screen flex">
      {/* COLUMNA IZQUIERDA - FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              ¡Hola de nuevo!
            </h1>
            <p className="text-slate-600 text-sm">
              Accede a tu portal de inquilino
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

          {/* Ícono decorativo */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-4 rounded-full">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico*
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Recuérdame y Olvidaste contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-slate-600">Recuérdame</span>
              </label>
              <button
                type="button"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
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
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Nota informativa */}
          <div className="mt-6 bg-cyan-50 border-l-4 border-teal-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-teal-800">
                  <span className="font-semibold">Nota:</span> Tu cuenta ha sido creada por el administrador del edificio. Si no tienes acceso, contacta con la administración.
                </p>
              </div>
            </div>
          </div>

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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Contenedor de la imagen */}
        <div className="relative z-10 w-full max-w-lg">
          <img 
            src={loginTenantIllustration}
            alt="Ilustración de inquilino"
            className="w-full h-auto drop-shadow-2xl rounded-2xl"
          />
        </div>

        {/* Texto adicional */}
        <div className="absolute bottom-8 left-8 right-8 text-center text-white z-10">
          <p className="text-2xl font-bold mb-2">DepaManager</p>
          <p className="text-teal-50">Tu hogar, siempre conectado</p>
        </div>
      </div>
    </div>
  );
}