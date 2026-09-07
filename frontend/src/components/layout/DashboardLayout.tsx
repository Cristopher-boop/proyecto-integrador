import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Backdrop para móviles cuando el sidebar esté abierto */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-opacity duration-200"
        />
      )}

      {/* 1. SIDEBAR MODULAR CON DESPLEGABLES Y COLAPSO TOTAL */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* 2. ÁREA PRINCIPAL: TOPBAR + CONTENIDO DE LAS VISTAS */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopBar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-slate-50 custom-scrollbar flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;