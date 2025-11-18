// frontend/src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage'; // ✅ Login original
import OAuthSuccessPage from '../pages/public/OAuthSuccessPage';
import RegisterPage from '../pages/public/RegisterPage';
import TenantLoginPage from '../pages/public/TenantLoginPage';
import AdminRoutes from './AdminRoutes';
import TenantRoutes from './TenantRoutes';

export default function AppRouter() {
  const { user, loading } = useAuth();

  // ✅ Log del estado actual
  console.log('🔍 AppRouter - Estado actual:', {
    loading,
    user: user ? {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    } : null
  });

  // ✅ Mostrar spinner mientras se verifica autenticación
  if (loading) {
    console.log('⏳ AppRouter - Mostrando spinner (loading=true)');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <span className="ml-3">Cargando...</span>
      </div>
    );
  }

  console.log('✅ AppRouter - Loading completado, renderizando rutas');

  return (
    <Routes>
      {/* ========== RUTAS PÚBLICAS ========== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/auth" element={<LoginPage />} />
      <Route path="/admin/register" element={<RegisterPage />} />
      <Route path="/tenant/login" element={<TenantLoginPage />} />
      <Route path="/oauth-success" element={<OAuthSuccessPage />} />
      {/* ========== RUTAS PROTEGIDAS - ADMIN ========== */}
      <Route 
        path="/admin/*" 
        element={
          user && user.rol === 'Administrador' ? (
            <AdminRoutes />
          ) : (
            <Navigate to="/admin/auth" replace />
          )
        } 
      />

      {/* ========== RUTAS PROTEGIDAS - INQUILINO ========== */}
      <Route 
        path="/tenant/*" 
        element={
          (() => {
            const canAccess = user && user.rol === 'Inquilino';
            console.log('🔐 AppRouter - Verificando acceso a /tenant/*:', {
              user: user ? 'Existe' : 'NULL',
              rol: user?.rol,
              canAccess
            });
            
            if (canAccess) {
              console.log('✅ Acceso permitido a TenantRoutes');
              return <TenantRoutes />;
            } else {
              console.log('❌ Acceso denegado - Redirigiendo a /admin/auth');
              return <Navigate to="/admin/auth" replace />;
            }
          })()
        } 
      />

      {/* ========== REDIRECCIÓN POR DEFECTO ========== */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              user 
                ? (user.rol === 'Administrador' ? "/admin/dashboard" : "/tenant/dashboard")
                : "/"
            } 
            replace 
          />
        } 
      />
    </Routes>
  );
}