import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TenantLayout from '../components/layout/TenantLayout';
import TenantDashboard from '../pages/tenant/Dashboard';
import PaymentsList from '../pages/tenant/payments/PaymentsList';
import PaymentUpload from '../pages/tenant/payments/PaymentUpload';
import IncidentsList from '../pages/tenant/incidents/IncidentsList';
import IncidentReport from '../pages/tenant/incidents/IncidentReport';
import ContractDetails from '../pages/tenant/contracts/ContractDetails';
import NotificationsList from '../pages/tenant/notifications/NotificationsList';

/**
 * Rutas específicas para el módulo de inquilino
 * Todas las rutas están protegidas y requieren autenticación
 */
export default function TenantRoutes() {
  return (
    <TenantLayout>
      <Routes>
        {/* Dashboard Principal */}
        <Route path="dashboard" element={<TenantDashboard />} />
        
        {/* Gestión de Pagos */}
        <Route path="pagos" element={<PaymentsList />} />
        <Route path="pagos/subir/:idPago" element={<PaymentUpload />} />
        
        {/* Gestión de Incidencias */}
        <Route path="incidencias" element={<IncidentsList />} />
        <Route path="incidencias/reportar" element={<IncidentReport />} />
        
        {/* Contratos */}
        <Route path="contratos" element={<ContractDetails />} />
        
        {/* Notificaciones */}
        <Route path="notificaciones" element={<NotificationsList />} />
        
        {/* Ruta por defecto - Redirige al dashboard */}
        <Route path="*" element={<Navigate to="/tenant/dashboard" replace />} />
      </Routes>
    </TenantLayout>
  );
}