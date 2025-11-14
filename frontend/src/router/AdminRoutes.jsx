// frontend/src/router/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import DepartmentsList from '../pages/admin/departments/DepartmentsList';
import TenantsList from '../pages/admin/tenants/TenantsList';
import TenantDetails from '../pages/admin/tenants/TenantDetails';
import IncidentsList from '../pages/admin/incidents/IncidentsList';
import IncidentDetails from '../pages/admin/incidents/IncidentDetails';
import ProvidersList from '../pages/admin/providers/ProvidersList';
import ContractsList from '../pages/admin/contracts/ContractsList';

export default function AdminRoutes() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.rol !== 'Administrador') {
    return <Navigate to="/admin/auth" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/departments" element={<DepartmentsList />} />
        <Route path="/tenants" element={<TenantsList />} />
        <Route path="/tenants/:id" element={<TenantDetails />} />
        <Route path="/contratos" element={<ContractsList />} />

        {/* Incidencias */}
        <Route path="/incidencias" element={<IncidentsList />} />
        <Route path="/incidencias/:id" element={<IncidentDetails />} />
        
        {/* Proveedores */}
        <Route path="/proveedores" element={<ProvidersList />} />
        
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}