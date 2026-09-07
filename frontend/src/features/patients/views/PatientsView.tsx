import React, { useState, useMemo } from 'react';
import { Users, Plus, Loader2, Search, MoreVertical, Edit2, Power, PowerOff } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { PatientForm } from '../components/PatientForm';
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Pagination } from '../../../components/common/Pagination';
import { Badge } from '../../../components/common/Badge';
import { DataTable } from '../../../components/common/DataTable';
import { PageHeader } from '../../../components/common/PageHeader';
import type { Column } from '../../../components/common/DataTable';

const PatientsView: React.FC = () => {
  const { pacientes, isLoading, error, toggleStatus, createPatient, updatePatient } = usePatients();
  const adobe = INAAQC_THEME.palette;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
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
    let filtered = pacientes.filter(p => 
      p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dossier_erasme.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  }, [pacientes, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<any>[] = [
    { 
      header: 'Paciente', 
      accessorKey: 'nombres', 
      sortable: true,
      width: 'w-[280px]',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 border border-slate-200">
            {row.nombres?.[0]}{row.apellidos?.[0]}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-800 block truncate">{row.nombres} {row.apellidos}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Dossier Erasme', 
      accessorKey: 'dossier_erasme', 
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/60">
          {row.dossier_erasme}
        </span>
      )
    },
    { 
      header: 'Dossier MPI', 
      accessorKey: 'dossier_mpi', 
      sortable: true,
      render: (row) => <span className="text-xs font-mono text-slate-500">{row.dossier_mpi || '-'}</span>
    },
    { 
      header: 'F. Nacimiento', 
      accessorKey: 'fecha_nacimiento', 
      sortable: true,
      render: (row) => <span className="text-xs font-medium text-slate-600">{row.fecha_nacimiento || '-'}</span>
    },
    { 
      header: 'Sexo', 
      accessorKey: 'sexo', 
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          {row.sexo === 'M' ? 'Masc' : row.sexo === 'F' ? 'Fem' : row.sexo || '-'}
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessorKey: 'esta_activo', 
      sortable: true,
      align: 'center',
      render: (row) => <Badge status={row.esta_activo ? 'success' : 'neutral'}>{row.esta_activo ? 'Activo' : 'Inactivo'}</Badge>
    },
    { 
      header: 'Acción', 
      align: 'right',
      render: (row) => (
        <div className="relative inline-block text-left">
          <button onClick={() => setOpenDropdownId(openDropdownId === row.id_paciente ? null : row.id_paciente)} className="p-1 rounded transition-colors hover:bg-slate-200 text-slate-500">
            <MoreVertical className="w-4 h-4" />
          </button>
          {openDropdownId === row.id_paciente && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
              <div className="absolute right-8 top-0 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95">
                <button onClick={() => { setEditingPatient(row); setShowForm(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Edit2 className="w-4 h-4 text-slate-400" /> Editar Perfil
                </button>
                <button onClick={() => { toggleStatus(row.id_paciente, row.esta_activo); setOpenDropdownId(null); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${row.esta_activo ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                  {row.esta_activo ? <PowerOff className="w-4 h-4 opacity-70" /> : <Power className="w-4 h-4 opacity-70" />}
                  {row.esta_activo ? 'Dar de Baja' : 'Reactivar'}
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  const handleCloseForm = () => { setShowForm(false); setEditingPatient(null); };
  const handleSavePatient = async (formData: any) => {
    if (editingPatient) await updatePatient(editingPatient.id_paciente, formData);
    else await createPatient(formData);
    handleCloseForm();
  };

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <PageHeader
        title="Directorio de Pacientes"
        subtitle={`Padrón clínico y demográfico institucional (${pacientes.length} registrados).`}
        icon={<Users className="w-6 h-6 sm:w-7 sm:h-7" />}
      >
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setEditingPatient(null); setShowForm(true); }}>
          Nuevo Paciente
        </Button>
      </PageHeader>

      {showForm && (
        <div className="overflow-y-auto custom-scrollbar">
          <PatientForm initialData={editingPatient} onSubmit={handleSavePatient} onCancel={handleCloseForm} />
        </div>
      )}

      {/* 2. Tarjeta de Tabla sin espacios blancos artificiales */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b bg-white border-slate-100 flex justify-between items-center">
            <div className="w-72 sm:w-80">
              <Input icon={<Search className="w-4 h-4" />} placeholder="Buscar paciente o dossier..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Página {currentPage} de {totalPages || 1}
            </span>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.base }} /></div>
            ) : error ? (
              <div className="p-6 text-red-500 text-center font-bold">{error}</div>
            ) : processedData.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium">No hay pacientes registrados.</div>
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

export default PatientsView;