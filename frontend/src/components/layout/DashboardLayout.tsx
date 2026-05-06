import React, { useState } from 'react';
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

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  // Opciones lógicas del menú clínico
  const navItems = [
    { name: 'Panel Principal', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Admisiones', icon: ClipboardList, path: '/dashboard/admissions' },
    { name: 'Pacientes', icon: Users, path: '/dashboard/patients' },
    { name: 'Estudio LAB', icon: LineChart, path: '/dashboard/trends' }, // <--- NUEVA PESTAÑA AQUÍ
    { name: 'Laboratorios', icon: TestTube, path: '/dashboard/labs' },
    { name: 'Ingesta de Datos', icon: UploadCloud, path: '/dashboard/upload' },
    { name: 'Reportes Médicos', icon: FileText, path: '/dashboard/reports' },
    { name: 'Configuración', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* 1. SIDEBAR (Barra Lateral) */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-blue-950 text-white transition-all duration-300 ease-in-out flex flex-col relative z-20 shadow-2xl`}
      >
        {/* Botón para colapsar/abrir menú */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-blue-600 rounded-full p-1 shadow-lg hover:bg-blue-500 transition-colors"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Cabecera del Sidebar (Logo) */}
        <div className="p-6 flex items-center gap-4 border-b border-blue-900/50">
          
            {/* EL FIX DEL LOGO: Ahora SÍ usamos el código arreglado (bg-white y sin scale) */}
            <div className="shadow-xl rounded-full overflow-hidden border-2 border-slate-100 flex justify-center items-center h-12 w-12 bg-white flex-shrink-0">
                <img 
                src={logoInaaqc} 
                alt="Logo INAAQC" 
                className="w-full h-full object-cover" 
                />
            </div>

          {isSidebarOpen && (
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-wide">INAAQC</h2>
              <p className="text-xs text-blue-300">Hospital Erasme</p>
            </div>
          )}
        </div>

        {/* Navegación del Menú */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'} // 'end' hace que el highlight sea exacto para la ruta raíz
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer del Sidebar (Usuario y Logout) */}
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

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Cabecera Superior Topbar */}
        <header className="bg-white h-16 shadow-sm border-b border-slate-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Panel de Control</h1>
        </header>

        {/* El Contenedor Dinámico */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
           {/* El componente <Outlet /> es el "hueco" donde React Router inyecta la página que corresponda */}
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;