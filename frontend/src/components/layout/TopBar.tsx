import React from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeftOpen, ShieldCheck, Stethoscope } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';

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
  '/dashboard/settings': { title: 'Configuración', subtitle: 'Ajustes del sistema y parámetros' },
};

export const TopBar: React.FC<TopBarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const adobe = INAAQC_THEME.palette;
  const location = useLocation();

  const currentMeta = ROUTE_TITLES[location.pathname] || {
    title: 'Panel de Control',
    subtitle: 'Instituto Académico-Científico Quispe-Cornejo',
  };

  return (
    <header className="bg-white h-16 shadow-xs border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Botón de apertura / alternancia del sidebar */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Cerrar barra lateral' : 'Abrir barra lateral'}
          className={`
            p-2 rounded-xl border transition-all duration-200 flex items-center justify-center
            ${
              !isSidebarOpen
                ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-xs hover:bg-teal-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }
          `}
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* Título de la página actual y subtítulo */}
        <div className="min-w-0">
          <h1
            className="text-base sm:text-lg font-black tracking-tight leading-tight truncate"
            style={{ color: adobe.base }}
          >
            {currentMeta.title}
          </h1>
          <p className="text-[11px] font-medium text-slate-400 hidden sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Identidad del Usuario en TopBar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>UCI Adultos • Sala A</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-xs"
            style={{ backgroundColor: adobe.base }}
          >
            CA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold leading-tight" style={{ color: adobe.base }}>
              Dr. Cristopher Ayala
            </p>
            <p className="text-[10px] text-teal-600 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
