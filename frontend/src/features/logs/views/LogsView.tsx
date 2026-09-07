import React, { useState, useMemo } from 'react';
import { 
  ScrollText, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Link2, 
  RefreshCw, 
  Filter, 
  Clock, 
  User, 
  Layers
} from 'lucide-react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { INAAQC_THEME } from '../../../config/theme';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/common/Input';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import type { Column } from '../../../components/common/DataTable';
import type { AuditLog } from '../types/logs.types';

const MODULOS = [
  { value: '', label: 'Todos los Módulos' },
  { value: 'INGESTA', label: 'Ingesta Documental' },
  { value: 'PACIENTES', label: 'Pacientes' },
  { value: 'ADMISIONES', label: 'Admisiones UCI' },
  { value: 'LABORATORIOS', label: 'Laboratorios' },
  { value: 'REPORTES', label: 'Reportes y Analítica' },
  { value: 'AUTENTICACION', label: 'Autenticación' },
  { value: 'USUARIOS', label: 'Usuarios' },
];

const ROLES = [
  { value: '', label: 'Todos los Roles' },
  { value: 'TI', label: 'Área de TI' },
  { value: 'INVESTIGADOR', label: 'Investigador' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'SUPERADMIN', label: 'Superadministrador' },
];

const ESTADOS = [
  { value: '', label: 'Todos los Estados' },
  { value: 'EXITOSO', label: 'Exitoso' },
  { value: 'DENEGADO', label: 'Denegado' },
  { value: 'ERROR', label: 'Error' },
];

export const LogsView: React.FC = () => {
  const { logs, isLoading, error, filters, updateFilter, refetch, stats } = useAuditLogs();
  const adobe = INAAQC_THEME.palette;

  const [sortConfig, setSortConfig] = useState<{ key: keyof AuditLog; direction: 'asc' | 'desc' } | null>({
    key: 'fecha_hora',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key: key as keyof AuditLog, direction });
  };

  const sortedData = useMemo(() => {
    const list = [...logs];
    if (sortConfig) {
      list.sort((a: any, b: any) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [logs, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DOCTOR': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'INVESTIGADOR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TI': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAccionBadge = (accion: string) => {
    if (accion === 'VINCULAR_DOCUMENTO_EPISODIO') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
          <Link2 className="w-3 h-3 text-teal-600" /> VINCULAR DOC
        </span>
      );
    }
    if (accion === 'PROCESAR_OCR') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
          OCR
        </span>
      );
    }
    if (accion === 'CREACION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          CREACIÓN
        </span>
      );
    }
    if (accion === 'EDICION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          EDICIÓN
        </span>
      );
    }
    if (accion === 'BAJA_LOGICA' || accion === 'ELIMINACION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
          {accion}
        </span>
      );
    }
    if (accion === 'REACTIVACION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          REACTIVADO
        </span>
      );
    }
    if (accion === 'EXPORTACION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          EXPORTAR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        {accion}
      </span>
    );
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Fecha / Hora',
      accessorKey: 'fecha_hora',
      sortable: true,
      width: 'w-[160px]',
      render: (row) => {
        const dateObj = new Date(row.fecha_hora);
        const fecha = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hora = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">{fecha}</span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {hora}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Usuario',
      accessorKey: 'usuario_nombre',
      sortable: true,
      width: 'w-[180px]',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {row.usuario_nombre}
          </span>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(row.rol)}`}>
              {row.rol}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Módulo',
      accessorKey: 'modulo',
      sortable: true,
      width: 'w-[140px]',
      render: (row) => (
        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 inline-flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-500" />
          {row.modulo}
        </span>
      ),
    },
    {
      header: 'Acción',
      accessorKey: 'accion',
      sortable: true,
      width: 'w-[150px]',
      render: (row) => getAccionBadge(row.accion),
    },
    {
      header: 'Descripción Detallada',
      accessorKey: 'descripcion',
      render: (row) => (
        <p className="text-xs font-medium text-slate-700 leading-relaxed max-w-xl">
          {row.descripcion}
        </p>
      ),
    },
    {
      header: 'IP',
      accessorKey: 'ip_address',
      width: 'w-[110px]',
      render: (row) => (
        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
          {row.ip_address || '-'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      sortable: true,
      align: 'center',
      width: 'w-[100px]',
      render: (row) => (
        <Badge status={row.estado === 'EXITOSO' ? 'success' : 'alert'}>
          {row.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Estandarizado */}
      <PageHeader
        title="Auditoría y Trazabilidad del Sistema"
        subtitle="Registro inmutable de transacciones, vinculación documental y seguridad institucional."
        icon={<ScrollText className="w-6 h-6 sm:w-7 sm:h-7" />}
      >
        <Button
          variant="outline"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={() => refetch()}
        >
          Actualizar
        </Button>
      </PageHeader>

      {/* 2. Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Eventos</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <ScrollText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Ingesta & Docs</p>
            <p className="text-2xl font-black text-teal-700 mt-0.5">{stats.vinculaciones}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Link2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Exitosos</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{stats.exitosos}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Denegados / Error</p>
            <p className="text-2xl font-black text-rose-700 mt-0.5">{stats.fallidos}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Filtros Multifactor */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Buscar por usuario, descripción o IP..."
            value={filters.search || ''}
            onChange={(e) => {
              updateFilter('search', e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={filters.modulo || ''}
            onChange={(e) => {
              updateFilter('modulo', e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {MODULOS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={filters.rol || ''}
            onChange={(e) => {
              updateFilter('rol', e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <select
            value={filters.estado || ''}
            onChange={(e) => {
              updateFilter('estado', e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {ESTADOS.map((es) => (
              <option key={es.value} value={es.value}>{es.label}</option>
            ))}
          </select>

          {(filters.modulo || filters.rol || filters.estado || filters.search) && (
            <button
              onClick={() => {
                updateFilter('modulo', '');
                updateFilter('rol', '');
                updateFilter('estado', '');
                updateFilter('search', '');
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 px-2 py-1 underline transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 4. Tabla de Auditoría Inmutable */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b bg-white border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600">
            Mostrando {sortedData.length} transacciones registradas
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Página {currentPage} de {totalPages || 1}
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.base }} />
            </div>
          ) : error ? (
            <div className="p-8 text-rose-600 text-center font-bold">{error}</div>
          ) : sortedData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No se encontraron registros de auditoría para los filtros seleccionados.
            </div>
          ) : (
            <DataTable
              data={currentData}
              columns={columns}
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          )}
        </div>

        {!isLoading && !error && sortedData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default LogsView;
