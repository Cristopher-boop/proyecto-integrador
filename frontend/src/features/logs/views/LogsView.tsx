import React, { useState, useMemo } from 'react';
import { 
  ScrollText, 
  Database,
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Link2, 
  RefreshCw, 
  Filter, 
  Clock, 
  Download,
  ShieldCheck,
  FileArchive,
  Calendar,
  Copy,
  Check
} from 'lucide-react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useSystemBackups } from '../hooks/useSystemBackups';
import { INAAQC_THEME } from '../../../config/theme';
import { PageHeader } from '../../../components/common/PageHeader';
import { Input } from '../../../components/common/Input';
import { DataTable } from '../../../components/common/DataTable';
import { Pagination } from '../../../components/common/Pagination';
import { Button } from '../../../components/common/Button';
import type { Column } from '../../../components/common/DataTable';
import type { AuditLog, SystemBackup } from '../types/logs.types';
import { logsApi } from '../api/logsApi';

const MODULOS = [
  { value: '', label: 'Todos los Módulos' },
  { value: 'INGESTA', label: 'Ingesta Documental' },
  { value: 'PACIENTES', label: 'Pacientes' },
  { value: 'ADMISIONES', label: 'Admisiones UCI' },
  { value: 'LABORATORIOS', label: 'Laboratorios' },
  { value: 'REPORTES', label: 'Reportes y Analítica' },
  { value: 'AUTENTICACION', label: 'Autenticación' },
  { value: 'USUARIOS', label: 'Usuarios' },
  { value: 'BACKUPS', label: 'Respaldos del Sistema' },
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
  { value: 'ADVERTENCIA', label: 'Advertencia' },
  { value: 'DENEGADO', label: 'Denegado' },
  { value: 'ERROR', label: 'Error' },
];

export const LogsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'backups'>('logs');
  const adobe = INAAQC_THEME.palette;

  // Logs Hook
  const { logs, isLoading: isLoadingLogs, error: errorLogs, filters, updateFilter, refetch: refetchLogs, stats } = useAuditLogs();

  // Backups Hook
  const { 
    backups, 
    scheduleStatus, 
    isLoading: isLoadingBackups, 
    isGenerating, 
    downloadingId, 
    error: errorBackups, 
    successMessage, 
    setSuccessMessage,
    refetch: refetchBackups, 
    generateBackup, 
    downloadBackup 
  } = useSystemBackups();

  const [backupNotas, setBackupNotas] = useState('');
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);
  const [isExportingLogs, setIsExportingLogs] = useState(false);

  // Sorting and Pagination for Logs
  const [logsSortConfig, setLogsSortConfig] = useState<{ key: keyof AuditLog; direction: 'asc' | 'desc' } | null>({
    key: 'fecha_hora',
    direction: 'desc',
  });
  const [logsPage, setLogsPage] = useState<number>(1);
  const itemsPerPageLogs = 12;

  // Sorting and Pagination for Backups
  const [backupsSortConfig, setBackupsSortConfig] = useState<{ key: keyof SystemBackup; direction: 'asc' | 'desc' } | null>({
    key: 'creado_en',
    direction: 'desc',
  });
  const [backupsPage, setBackupsPage] = useState<number>(1);
  const itemsPerPageBackups = 10;

  const handleLogsSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (logsSortConfig && logsSortConfig.key === key && logsSortConfig.direction === 'asc') direction = 'desc';
    setLogsSortConfig({ key: key as keyof AuditLog, direction });
  };

  const handleBackupsSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (backupsSortConfig && backupsSortConfig.key === key && backupsSortConfig.direction === 'asc') direction = 'desc';
    setBackupsSortConfig({ key: key as keyof SystemBackup, direction });
  };

  const sortedLogs = useMemo(() => {
    const list = [...logs];
    if (logsSortConfig) {
      list.sort((a: any, b: any) => {
        const valA = a[logsSortConfig.key] || '';
        const valB = b[logsSortConfig.key] || '';
        if (valA < valB) return logsSortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return logsSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [logs, logsSortConfig]);

  const totalLogsPages = Math.ceil(sortedLogs.length / itemsPerPageLogs);
  const currentLogs = sortedLogs.slice((logsPage - 1) * itemsPerPageLogs, logsPage * itemsPerPageLogs);

  const sortedBackups = useMemo(() => {
    const list = [...backups];
    if (backupsSortConfig) {
      list.sort((a: any, b: any) => {
        const valA = a[backupsSortConfig.key] || '';
        const valB = b[backupsSortConfig.key] || '';
        if (valA < valB) return backupsSortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return backupsSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [backups, backupsSortConfig]);

  const totalBackupsPages = Math.ceil(sortedBackups.length / itemsPerPageBackups);
  const currentBackups = sortedBackups.slice((backupsPage - 1) * itemsPerPageBackups, backupsPage * itemsPerPageBackups);

  const handleExportLogsCsv = async () => {
    try {
      setIsExportingLogs(true);
      await logsApi.exportLogs(filters, 'csv');
    } catch (err) {
      console.error('Error al exportar logs', err);
    } finally {
      setIsExportingLogs(false);
    }
  };

  const handleCopyChecksum = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedChecksum(hash);
    setTimeout(() => setCopiedChecksum(null), 2500);
  };

  const handleTriggerBackup = async () => {
    try {
      await generateBackup(backupNotas);
      setBackupNotas('');
    } catch {
      // Handled in hook
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'SUPERADMIN': return 'bg-[#1E3040] text-white border-[#1E3040]';
      case 'DOCTOR': return 'bg-[#9EBDD9]/40 text-[#1E3040] border-[#9FB0BF]';
      case 'INVESTIGADOR': return 'bg-[#99C8F2]/30 text-[#334759] border-[#9FB0BF]';
      case 'TI': return 'bg-amber-50 text-amber-900 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAccionBadge = (accion: string) => {
    if (accion.includes('BACKUP')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#334759]/10 text-[#1E3040] border border-[#9FB0BF]">
          <Database className="w-3 h-3 text-[#1E3040]" /> {accion}
        </span>
      );
    }
    if (accion === 'VINCULAR_DOCUMENTO_EPISODIO') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#9EBDD9]/30 text-[#1E3040] border border-[#9FB0BF]">
          <Link2 className="w-3 h-3 text-[#4D6173]" /> VINCULAR DOC
        </span>
      );
    }
    if (accion === 'PROCESAR_OCR') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#9EBDD9]/20 text-[#334759] border border-[#909CA6]">
          OCR
        </span>
      );
    }
    if (accion.includes('CREAR') || accion === 'CREACION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#9EBDD9]/40 text-[#1E3040] border border-[#9FB0BF]">
          {accion}
        </span>
      );
    }
    if (accion.includes('EDITAR') || accion === 'EDICION') {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#99C8F2]/30 text-[#334759] border border-[#9FB0BF]">
          {accion}
        </span>
      );
    }
    if (accion.includes('BAJA') || accion.includes('ELIMINAR')) {
      return (
        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
          {accion}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        {accion}
      </span>
    );
  };

  const logsColumns: Column<AuditLog>[] = [
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
      width: 'w-[170px]',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
            {row.usuario_nombre}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block w-max ${getRoleBadgeColor(row.rol)}`}>
            {row.rol}
          </span>
        </div>
      ),
    },
    {
      header: 'Módulo / Acción',
      accessorKey: 'modulo',
      sortable: true,
      width: 'w-[200px]',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {row.modulo}
          </span>
          {getAccionBadge(row.accion)}
        </div>
      ),
    },
    {
      header: 'Descripción del Evento',
      accessorKey: 'descripcion',
      render: (row) => (
        <div className="text-xs font-medium text-slate-600 leading-relaxed py-1 max-w-xl">
          {row.descripcion}
        </div>
      ),
    },
    {
      header: 'IP Origen',
      accessorKey: 'ip_address',
      width: 'w-[120px]',
      render: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {row.ip_address || 'Local / Interno'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      align: 'center',
      width: 'w-[100px]',
      render: (row) => {
        const isExito = row.estado === 'EXITOSO' || row.estado === 'EXITO';
        const isAdvertencia = row.estado === 'ADVERTENCIA';
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
            isExito
              ? 'bg-[#9EBDD9]/40 text-[#1E3040] border border-[#9FB0BF]'
              : isAdvertencia
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            {isExito ? <CheckCircle2 className="w-3 h-3 text-[#1E3040]" /> : <AlertTriangle className="w-3 h-3" />}
            {row.estado}
          </span>
        );
      },
    },
  ];

  const backupsColumns: Column<SystemBackup>[] = [
    {
      header: 'Tipo de Respaldo',
      accessorKey: 'tipo',
      sortable: true,
      width: 'w-[220px]',
      render: (row) => {
        const isQuincenal = row.tipo === 'PROGRAMADO_QUINCENAL';
        return (
          <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border w-max ${
              isQuincenal 
                ? 'bg-[#9EBDD9]/30 text-[#1E3040] border-[#9FB0BF]' 
                : 'bg-[#1E3040] text-white border-[#1E3040]'
            }`}>
              {isQuincenal ? <Calendar className="w-3.5 h-3.5 text-[#4D6173]" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#87C7FF]" />}
              {row.tipo_display}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Por: {row.creado_por_nombre}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Archivo / Fecha',
      accessorKey: 'nombre_archivo',
      sortable: true,
      width: 'w-[280px]',
      render: (row) => {
        const dateObj = new Date(row.creado_en);
        const fecha = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hora = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return (
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 truncate">
              <FileArchive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {row.nombre_archivo}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Generado: {fecha} a las {hora}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Registros Respaldados',
      accessorKey: 'total_registros',
      render: (row) => {
        const reg = row.total_registros || {};
        const total = Object.values(reg).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);
        return (
          <div className="flex flex-col gap-1 py-1">
            <span className="text-xs font-bold text-slate-700">
              {total.toLocaleString()} registros
            </span>
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
              {reg.pacientes !== undefined && <span>Px: {reg.pacientes} •</span>}
              {reg.admisiones !== undefined && <span>Adm: {reg.admisiones} •</span>}
              {reg.observaciones_biomedicas !== undefined && <span>Obs: {reg.observaciones_biomedicas} •</span>}
              {reg.logs_auditoria !== undefined && <span>Logs: {reg.logs_auditoria}</span>}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Tamaño',
      accessorKey: 'tamanio_bytes',
      sortable: true,
      align: 'center',
      width: 'w-[100px]',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.tamanio_legible}
        </span>
      ),
    },
    {
      header: 'Integridad (SHA-256)',
      accessorKey: 'checksum_sha256',
      width: 'w-[160px]',
      render: (row) => {
        const isCopied = copiedChecksum === row.checksum_sha256;
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 truncate" title={row.checksum_sha256}>
              {row.checksum_sha256.substring(0, 10)}...
            </span>
            <button
              onClick={() => handleCopyChecksum(row.checksum_sha256)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Copiar hash SHA-256 completo"
            >
              {isCopied ? <Check className="w-3 h-3 text-[#1E3040]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        );
      },
    },
    {
      header: 'Acción',
      accessorKey: 'id_backup',
      align: 'right',
      width: 'w-[140px]',
      render: (row) => {
        const isDownloading = downloadingId === row.id_backup;
        return (
          <Button
            variant="outline"
            icon={isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            disabled={isDownloading}
            onClick={() => downloadBackup(row.id_backup, row.nombre_archivo)}
            className="text-xs px-2.5 py-1"
          >
            {isDownloading ? 'Descargando...' : 'Descargar'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Principal Estandarizado */}
      <PageHeader
        title="Auditoría y Respaldos del Sistema"
        subtitle="Trazabilidad inmutable de eventos, cortes quincenales (15 y 30) y backups completos."
        icon={<ScrollText className="w-6 h-6 sm:w-7 sm:h-7" />}
      >
        <div className="flex items-center gap-2">
          {activeTab === 'logs' ? (
            <>
              <Button
                variant="outline"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportLogsCsv}
                disabled={isExportingLogs}
                className="text-xs px-3 py-1.5"
              >
                {isExportingLogs ? 'Exportando...' : 'Exportar CSV'}
              </Button>
              <Button
                variant="outline"
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />}
                onClick={() => refetchLogs()}
                className="text-xs px-3 py-1.5"
              >
                Actualizar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />}
              onClick={() => refetchBackups()}
              className="text-xs px-3 py-1.5"
            >
              Actualizar
            </Button>
          )}
        </div>
      </PageHeader>

      {/* 2. Pestañas de Navegación del Módulo */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          Logs de Auditoría en Vivo
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            activeTab === 'logs' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'backups'
              ? 'bg-[#1E3040] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-[#87C7FF]" />
          Respaldos & Cortes Quincenales
          {scheduleStatus && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#9EBDD9]/40 text-[#1E3040] border border-[#9FB0BF]">
              Corte en {scheduleStatus.dias_restantes}d
            </span>
          )}
        </button>
      </div>

      {/* CONTENIDO DE LA PESTAÑA 1: LOGS DE AUDITORÍA */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Tarjetas de Resumen Rápido */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Eventos</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9EBDD9]/20 flex items-center justify-center text-[#1E3040]">
                <ScrollText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#4D6173]">Ingesta & Docs</p>
                <p className="text-2xl font-black text-[#1E3040] mt-0.5">{stats.vinculaciones}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9EBDD9]/30 border border-[#9FB0BF] flex items-center justify-center text-[#1E3040]">
                <Link2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#4D6173]">Exitosos</p>
                <p className="text-2xl font-black text-[#1E3040] mt-0.5">{stats.exitosos}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9EBDD9]/40 border border-[#9FB0BF] flex items-center justify-center text-[#1E3040]">
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

          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full md:w-80">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Buscar por usuario, descripción o IP..."
                value={filters.search || ''}
                onChange={(e) => {
                  updateFilter('search', e.target.value);
                  setLogsPage(1);
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
                  setLogsPage(1);
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
                  setLogsPage(1);
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
                  setLogsPage(1);
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
                    setLogsPage(1);
                  }}
                  className="text-xs font-bold text-[#1E3040] hover:text-[#334759] px-2 py-1 underline transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Logs */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b bg-white border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">
                Mostrando {sortedLogs.length} transacciones registradas
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Página {logsPage} de {totalLogsPages || 1}
              </span>
            </div>

            <div className="overflow-x-auto">
              {isLoadingLogs ? (
                <div className="p-12 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.base }} />
                </div>
              ) : errorLogs ? (
                <div className="p-8 text-rose-600 text-center font-bold">{errorLogs}</div>
              ) : sortedLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium">
                  No se encontraron registros de auditoría para los filtros seleccionados.
                </div>
              ) : (
                <DataTable
                  data={currentLogs}
                  columns={logsColumns}
                  onSort={handleLogsSort}
                  sortConfig={logsSortConfig}
                />
              )}
            </div>

            {!isLoadingLogs && !errorLogs && sortedLogs.length > 0 && (
              <Pagination
                currentPage={logsPage}
                totalPages={totalLogsPages}
                totalItems={sortedLogs.length}
                itemsPerPage={itemsPerPageLogs}
                onPageChange={setLogsPage}
              />
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA 2: RESPALDOS & CORTES QUINCENALES */}
      {activeTab === 'backups' && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Alertas de Éxito / Error */}
          {successMessage && (
            <div className="p-3.5 bg-[#9EBDD9]/30 border border-[#9FB0BF] rounded-xl text-xs font-bold text-[#1E3040] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E3040]" />
                {successMessage}
              </span>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-[#1E3040] hover:text-[#334759] font-bold underline cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}

          {errorBackups && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorBackups}</span>
            </div>
          )}

          {/* Tarjeta 1: Cronograma de Cortes Quincenales */}
          <div className="bg-gradient-to-br from-[#1E3040] to-[#334759] text-white p-5 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#87C7FF]/20 text-[#87C7FF] border border-[#87C7FF]/30 rounded text-[11px] font-bold uppercase tracking-wider">
                    Programación Automática
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Ejecutable cada 15 y 30 de mes
                  </span>
                </div>
                <h3 className="text-lg font-black mt-1">Cortes Quincenales de Auditoría y Base de Datos</h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  El sistema consolida y empaqueta periódicamente los registros clínicos y logs para garantizar cumplimiento normativo y retención segura.
                </p>
              </div>

              {scheduleStatus && (
                <div className="bg-[#1E3040]/80 border border-[#4D6173]/80 p-3 rounded-xl flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9EBDD9] block">
                      Próximo Corte Programado
                    </span>
                    <span className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-[#87C7FF]" />
                      {scheduleStatus.proximo_corte_legible}
                    </span>
                  </div>
                  <div className="text-right border-l border-[#4D6173] pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9EBDD9] block">
                      Cuenta Regresiva
                    </span>
                    <span className="text-lg font-black text-[#87C7FF]">
                      {scheduleStatus.dias_restantes === 0 ? '¡Hoy!' : `${scheduleStatus.dias_restantes} días`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {scheduleStatus?.ultimo_corte && (
              <div className="mt-4 pt-3 border-t border-[#4D6173] text-xs text-slate-300 flex flex-wrap items-center gap-4">
                <span>
                  Último corte quincenal: <strong className="text-white">{scheduleStatus.ultimo_corte.nombre_archivo}</strong>
                </span>
                <span>
                  Tamaño: <strong className="text-white">{scheduleStatus.ultimo_corte.tamanio_legible}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Tarjeta 2: Generar Respaldo Bajo Demanda */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1E3040]" />
                <h4 className="text-base font-black text-slate-800">Generar Respaldo Completo Bajo Demanda</h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Como <strong>Superadministrador</strong>, puedes solicitar un volcado integral e inmediato de toda la base de datos (Pacientes, Admisiones UCI, Bio-parámetros, Archivos y Logs) empaquetado en archivo ZIP cifrado con SHA-256.
              </p>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Nota o motivo del respaldo (opcional, ej. Mantenimiento / Auditoría)..."
                  value={backupNotas}
                  onChange={(e) => setBackupNotas(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#87C7FF]"
                />
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Button
                variant="primary"
                icon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                disabled={isGenerating}
                onClick={handleTriggerBackup}
                className="w-full md:w-auto bg-[#1E3040] hover:bg-[#334759] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                {isGenerating ? 'Generando Respaldo Completo...' : 'Generar Backup de Todo Ahora'}
              </Button>
            </div>
          </div>

          {/* Tarjeta 3: Tabla de Historial de Respaldos */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b bg-white border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">
                Historial de Respaldos Almacenados ({backups.length})
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Página {backupsPage} de {totalBackupsPages || 1}
              </span>
            </div>

            <div className="overflow-x-auto">
              {isLoadingBackups ? (
                <div className="p-12 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.base }} />
                </div>
              ) : backups.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium">
                  No hay respaldos generados todavía. Haz clic en "Generar Backup de Todo Ahora" para crear el primero.
                </div>
              ) : (
                <DataTable
                  data={currentBackups}
                  columns={backupsColumns}
                  onSort={handleBackupsSort}
                  sortConfig={backupsSortConfig}
                />
              )}
            </div>

            {!isLoadingBackups && backups.length > 0 && (
              <Pagination
                currentPage={backupsPage}
                totalPages={totalBackupsPages}
                totalItems={backups.length}
                itemsPerPage={itemsPerPageBackups}
                onPageChange={setBackupsPage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsView;
