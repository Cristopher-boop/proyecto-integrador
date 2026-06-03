import React, { useState } from 'react';
import { HeartPulse, BrainCircuit, Palette, FlaskConical } from 'lucide-react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ClipboardList, 
  TestTube,      
  FileText,
  LineChart 
} from 'lucide-react';

import logoInaaqc from '../../assets/logo_inaaqc.svg';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const navItems = [
    { name: 'Panel Principal', icon: LayoutDashboard, path: '/dashboard', section: 'Main' },
    { name: 'Pacientes', icon: Users, path: '/dashboard/patients', section: 'Gestion Hospitalaria' },
    { name: 'Admisiones', icon: ClipboardList, path: '/dashboard/admissions', section: 'Gestion Hospitalaria' },
    { name: 'Ingesta de Datos', icon: UploadCloud, path: '/dashboard/upload', section: 'Ingesta de Datos' },
    { name: 'Laboratorios', icon: FlaskConical, path: '/dashboard/laboratory', section: 'Ingesta de Datos' },
    { name: 'Lab-Simulación', icon: LineChart, path: '/dashboard/trends', section: 'Simulaciones' },
    { name: 'Bio-Simulación', icon: HeartPulse, path: '/dashboard/biosim', section: 'Simulaciones' },
    { name: 'Prototipo IA', icon: BrainCircuit, path: '/dashboard/expert-system', section: 'Prototipo IA' },
    { name: 'UI / UX', icon: Palette, path: '/dashboard/sandbox', section: 'UI / UX' },
  ];

  const renderSectionHeader = (section: string, index: number) => {
    if (section === 'Main') return null;
    const isFirst = index === 0 || navItems[index - 1].section !== section;
    return isFirst ? (
      <div className="pt-6 pb-2 px-3 text-[10px] font-black text-blue-400/60 uppercase tracking-widest">
        {section}
      </div>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-blue-950 text-white transition-all duration-300 ease-in-out flex flex-col relative z-20 shadow-2xl`}>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-blue-600 rounded-full p-1 shadow-lg hover:bg-blue-500 transition-colors"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <div className="p-6 flex items-center gap-4 border-b border-blue-900/50">
            <div className="shadow-xl rounded-full overflow-hidden border-2 border-slate-100 flex justify-center items-center h-12 w-12 bg-white flex-shrink-0">
                <img src={logoInaaqc} alt="Logo INAAQC" className="w-full h-full object-cover" />
            </div>
          {isSidebarOpen && (
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-wide">INAAQC</h2>
              <p className="text-xs text-blue-300">Hospital Erasme</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-2 px-3 overflow-y-auto">
          {navItems.map((item, index) => (
            <React.Fragment key={item.name}>
              {isSidebarOpen && renderSectionHeader(item.section, index)}
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 mt-1
                  ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-blue-200 hover:bg-blue-900 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>

        {/* Footer con el botón de logout mantenido */}
        <div className="p-4 border-t border-blue-900/50">
          {isSidebarOpen && (
            <div className="mb-4 px-2">
              <p className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-1">Usuario Actual</p>
              <p className="text-sm font-medium truncate">Dr. Cristopher R. Ayala (Admin)</p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 w-full rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 shadow-sm border-b border-slate-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;