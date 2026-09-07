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
  LineChart,
  PieChart
} from 'lucide-react';

import logoInaaqc from '../../assets/logo_inaaqc.svg';
import { INAAQC_THEME } from '../../config/theme';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  
  // Extraemos la paleta para usarla fácilmente
  const adobe = INAAQC_THEME.palette;

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
    { name: 'Sistema Experto', icon: BrainCircuit, path: '/dashboard/expert-system', section: 'Prototipo IA' },
    { name: 'Reportes (BI)', icon: PieChart, path: '/dashboard/reports', section: 'Analítica' },
  ];

  const renderSectionHeader = (section: string, index: number) => {
    if (section === 'Main') return null;
    const isFirst = index === 0 || navItems[index - 1].section !== section;
    return isFirst ? (
      <div 
        className="pt-6 pb-2 px-3 text-[10px] font-black uppercase tracking-widest opacity-80"
        style={{ color: adobe.highlight }}
      >
        {section}
      </div>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* 1. SIDEBAR */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex flex-col relative z-20 shadow-2xl`}
        style={{ backgroundColor: adobe.base }}
      >
        
        {/* BOTÓN DE COLAPSO */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 rounded-full p-1 shadow-lg transition-all hover:brightness-125 text-white"
          style={{ backgroundColor: adobe.darkTint }}
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* ÁREA DEL LOGO */}
        <div className="p-6 flex items-center gap-4 border-b" style={{ borderColor: `${adobe.darkTint}80` }}>
            <div className="shadow-xl rounded-full overflow-hidden border-2 flex justify-center items-center h-12 w-12 bg-white flex-shrink-0" style={{ borderColor: adobe.midTint }}>
                <img src={logoInaaqc} alt="Logo INAAQC" className="w-full h-full object-cover" />
            </div>
          {isSidebarOpen && (
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-wide text-white">INAAQC</h2>
              <p className="text-xs font-medium" style={{ color: adobe.lightTint }}>Hospital Erasme</p>
            </div>
          )}
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 py-2 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => (
            <React.Fragment key={item.name}>
              {isSidebarOpen && renderSectionHeader(item.section, index)}
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? adobe.highlight : 'transparent',
                  color: isActive ? adobe.base : adobe.lightTint,
                })}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 mt-1
                  ${isActive ? 'shadow-md font-bold' : 'hover:bg-white/10 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>

        {/* FOOTER - USUARIO Y LOGOUT */}
        <div className="p-4 border-t" style={{ borderColor: `${adobe.darkTint}80` }}>
          {isSidebarOpen && (
            <div className="mb-4 px-2">
              <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: adobe.midTint }}>Usuario Actual</p>
              <p className="text-sm font-medium truncate" style={{ color: adobe.lightTint }}>Dr. Cristopher R. Ayala (Admin)</p>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-bold text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 shadow-sm border-b border-slate-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-black tracking-tight" style={{ color: adobe.base }}>Panel de Control</h1>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;