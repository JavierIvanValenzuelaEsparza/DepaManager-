import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Páginas públicas
import LandingPage from '../pages/public/LandingPage';
import AdminAuthPage from '../pages/public/AdminAuthPage';
import TenantLoginPage from '../pages/public/TenantLoginPage';

// Rutas protegidas
import AdminRoutes from './AdminRoutes';
import TenantRoutes from './TenantRoutes';

export default function AppRouter() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/auth" element={<AdminAuthPage />} />
      <Route path="/tenant/login" element={<TenantLoginPage />} />

      {/* Rutas protegidas para Admin */}
      <Route 
        path="/admin/*" 
        element={
          isAuthenticated && user?.role === 'admin' ? 
            <AdminRoutes /> : 
            <Navigate to="/admin/auth" replace />
        } 
      />

      {/* Rutas protegidas para Tenant */}
      <Route 
        path="/tenant/*" 
        element={
          isAuthenticated && user?.role === 'tenant' ? 
            <TenantRoutes /> : 
            <Navigate to="/tenant/login" replace />
        } 
      />

      {/* Redirigir rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}