import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import AdminRoutes from './AdminRoutes';
import TenantRoutes from './TenantRoutes';

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/auth" element={<LoginPage />} />

      {/* Rutas protegidas - Admin */}
      {user?.rol === 'Administrador' && (
        <Route path="/admin/*" element={<AdminRoutes />} />
      )}

      {/* Rutas protegidas - Inquilino */}
      {user?.rol === 'Inquilino' && (
        <Route path="/tenant/*" element={<TenantRoutes />} />
      )}

      {/* Redirección por defecto */}
      <Route 
        path="*" 
        element={
          user ? (
            user.rol === 'Administrador' ? 
              <Navigate to="/admin/dashboard" replace /> : 
              <Navigate to="/tenant/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}