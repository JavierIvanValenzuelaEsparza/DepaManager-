import React from 'react';
import { Outlet } from 'react-router-dom';
import TenantSidebar from './TenantSidebar';

/**
 * Layout principal para el módulo de inquilino
 * Incluye sidebar y área de contenido
 */
export default function TenantLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar de Navegación */}
      <TenantSidebar />
      
      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        
        {/* Footer Global (opcional) */}
        <footer className="bg-white border-t border-slate-200 py-3 px-6">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>© 2024 DepaManager. Todos los derechos reservados.</span>
            <span>v1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}