import React from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeftOpen, ShieldCheck, Stethoscope, Sun, Moon } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';
import { useAuth } from '../../features/auth';
import { useTheme } from '../../context';

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Panel Principal', subtitle: 'Métricas e indicadores globales' },
  '/dashboard/patients': { title: 'Gestión de Pacientes', subtitle: 'Padrón clínico y demográfico' },
  '/dashboard/admissions': { title: 'Admisiones UCI', subtitle: 'Episodios médicos e internaciones' },
  '/dashboard/upload': { title: 'Ingesta Documental', subtitle: 'Procesamiento OCR e ingesta de notas' },
  '/dashboard/laboratory': { title: 'Laboratorio Clínico', subtitle: 'Resultados bioquímicos y analíticas' },
  '/dashboard/trends': { title: 'Tendencias Longitudinales', subtitle: 'Simulación temporal de analíticas' },
  '/dashboard/biosim': { title: 'Bio-Simulación de Parámetros', subtitle: 'Monitoreo dinámico hemodinámico' },
  '/dashboard/expert-system': { title: 'Sistema Experto Clínico', subtitle: 'Inferencia diagnóstica, SOFA y SAPS 3' },
  '/dashboard/reports': { title: 'Reportes y Analítica (BI)', subtitle: 'Exportación institucional y estadísticas' },
  '/dashboard/logs': { title: 'Auditoría del Sistema', subtitle: 'Trazabilidad y registro de eventos críticos' },
  '/dashboard/settings': { title: 'Configuración', subtitle: 'Ajustes del sistema y parámetros' },
};

export const TopBar: React.FC<TopBarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const adobe = INAAQC_THEME.palette;
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const currentMeta = ROUTE_TITLES[location.pathname] || {
    title: 'Panel de Control',
    subtitle: 'Instituto Académico-Científico Quispe-Cornejo',
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'Usuario';

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : (user?.username?.slice(0, 2) || 'US').toUpperCase();

  const roleLabel = (() => {
    switch (user?.rol) {
      case 'TI': return 'Área de TI';
      case 'INVESTIGADOR': return 'Investigador Clínico';
      case 'DOCTOR': return 'Médico Especialista';
      case 'SUPERADMIN': return 'Superadministrador';
      default: return user?.rol || 'Usuario';
    }
  })();

  return (
    <header className="bg-white dark:bg-[#1E3040] h-16 shadow-xs border-b border-slate-200/80 dark:border-[#334759] flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Botón de apertura / alternancia del sidebar */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Cerrar barra lateral' : 'Abrir barra lateral'}
          className={`
            p-2 rounded-xl border transition-all duration-200 flex items-center justify-center
            ${
              !isSidebarOpen
                ? 'bg-[#9EBDD9]/30 border-[#9FB0BF] dark:border-[#4D6173] text-[#1E3040] dark:text-[#87C7FF] shadow-xs hover:bg-[#9EBDD9]/50'
                : 'bg-slate-50 dark:bg-[#15232F] border-slate-200 dark:border-[#334759] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#334759]/50'
            }
          `}
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* Título de la página actual y subtítulo */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight truncate text-[#1E3040] dark:text-[#F1F5F9]">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 hidden sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Acciones y usuario en TopBar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Selector de Modo Oscuro / Claro */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-2 rounded-xl border border-slate-200 dark:border-[#334759] bg-slate-50 dark:bg-[#15232F] text-slate-600 dark:text-[#87C7FF] hover:bg-slate-100 dark:hover:bg-[#334759]/50 transition-all duration-200 flex items-center justify-center shadow-xs"
        >
          {isDark ? (
            <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45 text-[#87C7FF]" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0 text-slate-600" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-[#15232F] border border-slate-200/80 dark:border-[#334759] text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Stethoscope className="w-3.5 h-3.5 text-[#4D6173] dark:text-[#87C7FF]" />
          <span>UCI Adultos • Sala A</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#334759]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xs"
            style={{ backgroundColor: adobe.base }}
          >
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold leading-tight text-[#1E3040] dark:text-[#F1F5F9]">
              {displayName}
            </p>
            <p className="text-[10px] text-[#4D6173] dark:text-[#9EBDD9] font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
