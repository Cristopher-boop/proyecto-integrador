import React, { useState, useEffect, useMemo } from 'react';
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
  ScrollText,
} from 'lucide-react';
import logoInaaqc from '../../assets/logo_inaaqc.svg';
import { INAAQC_THEME } from '../../config/theme';
import { useAuth } from '../../features/auth';
import type { UserRole } from '../../features/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  allowedRoles?: UserRole[];
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

const ALL_NAV_GROUPS: NavGroup[] = [
  {
    id: 'gestion',
    title: 'Gestión Hospitalaria',
    items: [
      { name: 'Pacientes', path: '/dashboard/patients', icon: Users, allowedRoles: ['TI', 'INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] },
      { name: 'Admisiones UCI', path: '/dashboard/admissions', icon: ClipboardList, allowedRoles: ['TI', 'INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] },
    ],
  },
  {
    id: 'ingesta',
    title: 'Ingesta y Laboratorio',
    items: [
      { name: 'Ingesta de Datos', path: '/dashboard/upload', icon: UploadCloud, allowedRoles: ['TI', 'INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] },
      { name: 'Laboratorios', path: '/dashboard/laboratory', icon: FlaskConical, allowedRoles: ['TI', 'INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] },
    ],
  },
  {
    id: 'simulacion',
    title: 'Simulaciones Biomédicas',
    items: [
      { name: 'Lab-Simulación', path: '/dashboard/trends', icon: LineChart, allowedRoles: ['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] },
      { name: 'Bio-Simulación', path: '/dashboard/biosim', icon: HeartPulse, allowedRoles: ['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] },
    ],
  },
  {
    id: 'ia',
    title: 'Inteligencia Clínica & BI',
    items: [
      { name: 'Sistema Experto', path: '/dashboard/expert-system', icon: BrainCircuit, allowedRoles: ['DOCTOR', 'SUPERADMIN'] },
      { name: 'Reportes (BI)', path: '/dashboard/reports', icon: PieChart, allowedRoles: ['DOCTOR', 'SUPERADMIN'] },
    ],
  },
  {
    id: 'auditoria',
    title: 'Auditoría & Seguridad',
    items: [
      { name: 'Logs del Sistema', path: '/dashboard/logs', icon: ScrollText, allowedRoles: ['SUPERADMIN'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const adobe = INAAQC_THEME.palette;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, logout } = useAuth();

  // Filtrar grupos e items según el rol del usuario autenticado
  const visibleGroups = useMemo(() => {
    return ALL_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.allowedRoles) return true;
        return hasRole(item.allowedRoles);
      }),
    })).filter((group) => group.items.length > 0);
  }, [hasRole]);

  // Estados de los acordeones desplegables
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gestion: true,
    ingesta: true,
    simulacion: true,
    ia: true,
    auditoria: true,
  });

  // Abrir automáticamente la sección que contenga la ruta activa
  useEffect(() => {
    const currentPath = location.pathname;
    visibleGroups.forEach((group) => {
      if (group.items.some((item) => currentPath.startsWith(item.path))) {
        setOpenSections((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname, visibleGroups]);

  const toggleSection = (groupId: string) => {
    setOpenSections((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'Usuario';

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : (user?.username?.slice(0, 2) || 'US').toUpperCase();

  const roleLabel = useMemo(() => {
    switch (user?.rol) {
      case 'TI': return 'Área de TI';
      case 'INVESTIGADOR': return 'Investigador Clínico';
      case 'DOCTOR': return 'Médico Especialista';
      case 'SUPERADMIN': return 'Superadministrador';
      default: return user?.rol || 'Usuario';
    }
  }, [user?.rol]);

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

        {/* GRUPOS DESPLEGABLES (ACORDEÓN FILTRADO POR ROL) */}
        {visibleGroups.map((group) => {
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
                      ? 'text-[#87C7FF]'
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
                            isItemActive ? 'text-[#87C7FF]' : 'text-slate-400 group-hover:text-white'
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

      {/* 3. PIE DE PÁGINA: USUARIO DINÁMICO Y LOGOUT */}
      <div
        className="p-3 border-t shrink-0 space-y-2"
        style={{ borderColor: `${adobe.darkTint}40` }}
      >
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ backgroundColor: adobe.highlight }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#87C7FF] inline" /> {roleLabel}
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
