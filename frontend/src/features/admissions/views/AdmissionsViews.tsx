import React, { useState, useMemo } from 'react';
import { ActivitySquare, Plus, Loader2, Search, MoreVertical, Edit2, Power, PowerOff } from 'lucide-react';
import { useAdmissions } from '../hooks/useAdmissions';
import { usePatients } from '../../patients/hooks/usePatients'; 
import { useAuth } from '../../auth';
import { AdmissionForm } from '../components/AdmissionForm';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Pagination } from '../../../components/common/Pagination';
import { Badge } from '../../../components/common/Badge';
import { DataTable } from '../../../components/common/DataTable';
import { PageHeader } from '../../../components/common/PageHeader';
import { YearMonthFilter } from '../../../components/common/YearMonthFilter';
import type { Column } from '../../../components/common/DataTable';

const AdmissionsView: React.FC = () => {
  const { 
    admisiones, 
    isLoading: loadingAdmissions, 
    error, 
    estadoFilter, 
    setEstadoFilter, 
    toggleStatus, 
    createAdmission, 
    updateAdmission 
  } = useAdmissions();
  const { pacientes, isLoading: loadingPatients } = usePatients(); 
  const { user } = useAuth();
  const canManage = user?.is_superuser || (user?.rol && user.rol !== 'TI');

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>(now.getMonth() + 1);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([now.getFullYear()]);
    admisiones.forEach((a) => {
      if (a.fecha_ingreso) {
        const d = new Date(a.fecha_ingreso);
        if (!isNaN(d.getTime())) yearsSet.add(d.getFullYear());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [admisiones]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key: key as string, direction });
  };

  const processedData = useMemo(() => {
    let filtered = admisiones.filter(a => {
      const pacienteInfo = pacientes.find(p => p.id_paciente === a.paciente);
      const nombreCompleto = pacienteInfo ? `${pacienteInfo.nombres} ${pacienteInfo.apellidos}`.toLowerCase() : '';
      
      const matchSearch = (a.numero_episodio || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            nombreCompleto.includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      // Filtro de Año y Mes
      if (a.fecha_ingreso) {
        const d = new Date(a.fecha_ingreso);
        if (!isNaN(d.getTime())) {
          if (selectedYear !== 'ALL' && d.getFullYear() !== selectedYear) return false;
          if (selectedMonth !== 'ALL' && (d.getMonth() + 1) !== selectedMonth) return false;
        }
      }
      return true;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';
        if (sortConfig.key === 'nombres') { valA = `${a.nombres} ${a.apellidos}`; valB = `${b.nombres} ${b.apellidos}`; }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [admisiones, pacientes, searchTerm, sortConfig, selectedYear, selectedMonth]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<any>[] = [
    { 
      header: 'Nº Episodio', 
      accessorKey: 'numero_episodio',
      sortable: true,
      width: 'w-[140px]',
      render: (row) => (
        <span className="text-xs font-mono font-bold text-[#1E3040] dark:text-[#87C7FF] bg-[#9EBDD9]/40 dark:bg-[#334759] px-2.5 py-1 rounded-md border border-[#9FB0BF] dark:border-[#4D6173]">
          {row.numero_episodio}
        </span>
      )
    },
    { 
      header: 'Paciente', 
      accessorKey: 'paciente', 
      sortable: true,
      width: 'w-[260px]',
      render: (row) => {
        const pInfo = pacientes.find(p => p.id_paciente === row.paciente);
        const displayName = pInfo ? `${pInfo.nombres} ${pInfo.apellidos}` : 'ID: ' + row.paciente;
        return <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate block">{displayName}</span>;
      }
    },
    { 
      header: 'Cama / Sala', 
      accessorKey: 'cama_sala',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#15232F] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#334759]">
          {row.cama_sala || 'UCI General'}
        </span>
      )
    },
    { 
      header: 'Fecha Ingreso', 
      accessorKey: 'fecha_ingreso', 
      sortable: true,
      render: (row) => {
        if (!row.fecha_ingreso) return <span className="text-xs text-slate-400 dark:text-slate-500">-</span>;
        try {
          const dateObj = new Date(row.fecha_ingreso);
          return (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {dateObj.toLocaleString('es-ES', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}
            </span>
          );
        } catch {
          return <span className="text-xs text-slate-600 dark:text-slate-300">{row.fecha_ingreso}</span>;
        }
      }
    },
    { 
      header: 'Fecha Egreso', 
      accessorKey: 'fecha_salida', 
      sortable: true,
      render: (row) => {
        if (!row.fecha_salida) return <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">En Internación</span>;
        const dateObj = new Date(row.fecha_salida);
        return (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {dateObj.toLocaleString('es-ES', { 
              day: '2-digit', month: '2-digit', year: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            })}
          </span>
        );
      }
    },
    { 
      header: 'Estado', 
      accessorKey: 'esta_activo', 
      sortable: true,
      align: 'center',
      render: (row) => <Badge status={row.esta_activo ? 'success' : 'neutral'}>{row.esta_activo ? 'Activo' : 'Cerrado'}</Badge>
    },
    ...(canManage ? [{ 
      header: 'Acción', 
      align: 'right' as const,
      render: (row: any) => (
        <div className="relative inline-block text-left">
          <button onClick={() => setOpenDropdownId(openDropdownId === row.id_admision ? null : row.id_admision)} className="p-1 rounded transition-colors hover:bg-slate-200 dark:hover:bg-[#334759] text-slate-500 dark:text-slate-400">
            <MoreVertical className="w-4 h-4" />
          </button>
          {openDropdownId === row.id_admision && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
              <div className="absolute right-8 top-0 w-40 bg-white dark:bg-[#1E3040] border border-slate-200 dark:border-[#334759] rounded-xl shadow-lg dark:shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                <button onClick={() => { setEditingAdmission(row); setShowForm(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#334759]/40 transition-colors">
                  <Edit2 className="w-4 h-4 text-slate-400" /> Editar Registro
                </button>
                <button onClick={() => { toggleStatus(row.id_admision, row.esta_activo); setOpenDropdownId(null); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${row.esta_activo ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-[#4D6173] dark:text-[#87C7FF] hover:bg-[#9EBDD9]/20 dark:hover:bg-[#334759]/40'}`}>
                  {row.esta_activo ? <PowerOff className="w-4 h-4 opacity-70" /> : <Power className="w-4 h-4 opacity-70" />}
                  {row.esta_activo ? 'Cerrar Episodio' : 'Reactivar'}
                </button>
              </div>
            </>
          )}
        </div>
      )
    }] : [])
  ];

  const handleCloseForm = () => { setShowForm(false); setEditingAdmission(null); };
  const handleSaveAdmission = async (formData: any) => {
    if (editingAdmission) await updateAdmission(editingAdmission.id_admision, formData);
    else await createAdmission(formData);
    handleCloseForm();
  };

  const isLoading = loadingAdmissions || loadingPatients;

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <PageHeader
        title="Control de Admisiones"
        subtitle={`Gestión de episodios clínicos e ingresos a UCI (${admisiones.length} registrados).`}
        icon={<ActivitySquare className="w-6 h-6 sm:w-7 sm:h-7" />}
      >
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <YearMonthFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeYear={(yr) => {
              setSelectedYear(yr);
              setCurrentPage(1);
            }}
            onChangeMonth={(m) => {
              setSelectedMonth(m);
              setCurrentPage(1);
            }}
            availableYears={availableYears}
          />
          {canManage && (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditingAdmission(null); setShowForm(true); }}>
              Nueva Admisión
            </Button>
          )}
        </div>
      </PageHeader>

      {showForm && canManage && (
        <div className="overflow-y-auto custom-scrollbar">
          <AdmissionForm pacientes={pacientes} initialData={editingAdmission} onSubmit={handleSaveAdmission} onCancel={handleCloseForm} />
        </div>
      )}

      {/* 2. Tarjeta de Tabla */}
      {!showForm && (
        <div className="bg-white dark:bg-[#1E3040] rounded-2xl shadow-xs border border-slate-100 dark:border-[#334759] overflow-hidden flex flex-col transition-colors duration-200">
          <div className="px-5 py-3 border-b bg-white dark:bg-[#1E3040] border-slate-100 dark:border-[#334759] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="w-72 sm:w-80">
                <Input icon={<Search className="w-4 h-4" />} placeholder="Buscar episodio o paciente..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>

              {/* Selector de Estado Activos / Cerrados / Todos */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#15232F] rounded-xl border border-slate-200/80 dark:border-[#334759]">
                {(['activos', 'inactivos', 'todos'] as const).map((est) => (
                  <button
                    key={est}
                    type="button"
                    onClick={() => {
                      setEstadoFilter(est);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-150 ${
                      estadoFilter === est
                        ? 'bg-white dark:bg-[#1E3040] text-[#1E3040] dark:text-[#87C7FF] shadow-xs border border-slate-200/60 dark:border-[#334759]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {est === 'activos' ? 'Activos' : est === 'inactivos' ? 'Cerrados' : 'Todos'}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Página {currentPage} de {totalPages || 1}
            </span>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-[#1E3040] dark:text-[#87C7FF]" /></div>
            ) : error ? (
              <div className="p-6 text-red-500 text-center font-bold">{error}</div>
            ) : processedData.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium">No hay admisiones registradas.</div>
            ) : (
              <DataTable data={currentData} columns={columns} onSort={handleSort} sortConfig={sortConfig} />
            )}
          </div>

          {!isLoading && !error && processedData.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={processedData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          )}
        </div>
      )}
    </div>
  );
};

export default AdmissionsView;