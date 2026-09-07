import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UploadCloud,
  FlaskConical,
  LineChart,
  HeartPulse,
  BrainCircuit,
  PieChart,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  ShieldCheck,
} from 'lucide-react';
import logoInaaqc from '../../assets/logo_inaaqc.svg';
import { INAAQC_THEME } from '../../config/theme';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavGroup {
  id: string;
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'gestion',
    title: 'Gestión Hospitalaria',
    items: [
      { name: 'Pacientes', path: '/dashboard/patients', icon: Users },
      { name: 'Admisiones UCI', path: '/dashboard/admissions', icon: ClipboardList },
    ],
  },
  {
    id: 'ingesta',
    title: 'Ingesta y Laboratorio',
    items: [
      { name: 'Ingesta de Datos', path: '/dashboard/upload', icon: UploadCloud },
      { name: 'Laboratorios', path: '/dashboard/laboratory', icon: FlaskConical },
    ],
  },
  {
    id: 'simulacion',
    title: 'Simulaciones Biomédicas',
    items: [
      { name: 'Lab-Simulación', path: '/dashboard/trends', icon: LineChart },
      { name: 'Bio-Simulación', path: '/dashboard/biosim', icon: HeartPulse },
    ],
  },
  {
    id: 'ia',
    title: 'Inteligencia Clínica & BI',
    items: [
      { name: 'Sistema Experto', path: '/dashboard/expert-system', icon: BrainCircuit },
      { name: 'Reportes (BI)', path: '/dashboard/reports', icon: PieChart },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const adobe = INAAQC_THEME.palette;
  const location = useLocation();
  const navigate = useNavigate();

  // Estados de los acordeones desplegables
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gestion: true,
    ingesta: true,
    simulacion: true,
    ia: true,
  });

  // Abrir automáticamente la sección que contenga la ruta activa
  useEffect(() => {
    const currentPath = location.pathname;
    NAV_GROUPS.forEach((group) => {
      if (group.items.some((item) => currentPath.startsWith(item.path))) {
        setOpenSections((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSection = (groupId: string) => {
    setOpenSections((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = () => {
    tokenStorage.clearTokens();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 md:static
        transition-all duration-300 ease-in-out flex flex-col shrink-0
        ${isOpen ? 'w-72 translate-x-0 opacity-100 shadow-2xl md:shadow-lg' : 'w-0 -translate-x-full md:translate-x-0 opacity-0 overflow-hidden pointer-events-none border-none'}
      `}
      style={{
        backgroundColor: adobe.base,
        borderRight: isOpen ? `1px solid ${adobe.darkTint}30` : 'none',
      }}
    >
      {/* 1. CABECERA CON IDENTIDAD Y BOTÓN DE CIERRE */}
      <div
        className="h-16 px-5 flex items-center justify-between shrink-0 border-b"
        style={{ borderColor: `${adobe.darkTint}40` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 border"
            style={{ borderColor: adobe.highlight }}
          >
            <img src={logoInaaqc} alt="Logo INAAQC" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black tracking-tight text-white truncate flex items-center gap-1.5">
              <span>INAAQC</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${adobe.highlight}30`, color: adobe.highlight }}
              >
                UCI
              </span>
            </h2>
            <p className="text-[11px] font-medium text-slate-400 truncate">Hospital Erasme</p>
          </div>
        </div>

        {/* Botón integrado de cierre/colapso sin cortar el borde */}
        <button
          onClick={onClose}
          title="Ocultar menú lateral"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* 2. LISTA DE NAVEGACIÓN Y DESPLEGABLES */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar space-y-1.5">
        {/* Panel Principal (Enlace directo siempre visible) */}
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150
            ${
              isActive
                ? 'text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }
          `}
          style={({ isActive }) =>
            isActive
              ? { backgroundColor: adobe.highlight }
              : undefined
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Panel Principal</span>
        </NavLink>

        {/* Separador sutil */}
        <div className="pt-2 pb-1 px-3">
          <div className="h-px bg-white/10" />
        </div>

        {/* GRUPOS DESPLEGABLES (ACORDEÓN) */}
        {NAV_GROUPS.map((group) => {
          const isGroupOpen = !!openSections[group.id];
          const hasActiveChild = group.items.some((item) =>
            location.pathname.startsWith(item.path)
          );

          return (
            <div key={group.id} className="pt-1">
              {/* Encabezado del Grupo Desplegable */}
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-colors
                  ${
                    hasActiveChild
                      ? 'text-teal-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }
                `}
              >
                <span className="truncate">{group.title}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    isGroupOpen ? 'rotate-0' : '-rotate-90 text-slate-500'
                  }`}
                />
              </button>

              {/* Submenú con transición */}
              {isGroupOpen && (
                <div className="mt-1 pl-2 space-y-1">
                  {group.items.map((item) => {
                    const isItemActive = location.pathname.startsWith(item.path);

                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative group
                          ${
                            isItemActive
                              ? 'text-white font-bold shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }
                        `}
                        style={
                          isItemActive
                            ? {
                                backgroundColor: `${adobe.highlight}25`,
                                color: '#FFFFFF',
                                borderLeft: `3px solid ${adobe.highlight}`,
                              }
                            : undefined
                        }
                      >
                        <item.icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isItemActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. PIE DE PÁGINA: USUARIO Y LOGOUT */}
      <div
        className="p-3 border-t shrink-0 space-y-2"
        style={{ borderColor: `${adobe.darkTint}40` }}
      >
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ backgroundColor: adobe.highlight }}
          >
            CA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">Dr. Cristopher Ayala</p>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400 inline" /> Admin Médico
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
