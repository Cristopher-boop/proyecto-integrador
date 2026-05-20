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
import type { Column } from '../../../components/common/DataTable';

const PatientPruebasView: React.FC = () => {
  const { pacientes, isLoading, error, toggleStatus, createPatient, updatePatient } = usePatients();
  const adobe = INAAQC_THEME.palette;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // Estado para el menú de 3 puntos

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key: key as string, direction });
  };

  // --- PIPELINE DE DATOS ---
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

  // --- DEFINICIÓN DE LAS COLUMNAS PARA LA TABLA UNIVERSAL ---
  const columns: Column<any>[] = [
    { 
      header: 'Paciente', 
      accessorKey: 'nombres', 
      sortable: true,
      width: 'w-[320px]',
      // El nombre principal se queda en semibold y un poco más oscuro
      render: (row) => <div className="text-sm font-semibold text-slate-800 truncate">{row.nombres} {row.apellidos}</div>
    },
    { 
      header: 'Dossier Erasme', 
      accessorKey: 'dossier_erasme', 
      sortable: true,
      // ESTANDARIZADO: text-sm font-medium text-slate-600
      render: (row) => <span className="text-sm font-medium text-slate-600">{row.dossier_erasme}</span>
    },
    { 
      header: 'Dossier MPI', 
      accessorKey: 'dossier_mpi', 
      sortable: true,
      // ESTANDARIZADO: text-sm font-medium text-slate-600
      render: (row) => <span className="text-sm font-medium text-slate-600">{row.dossier_mpi || '-'}</span>
    },
    { 
      header: 'Nacimiento', 
      accessorKey: 'fecha_nacimiento', 
      sortable: true,
      // ESTANDARIZADO: text-sm font-medium text-slate-600
      render: (row) => <span className="text-sm font-medium text-slate-600">{row.fecha_nacimiento}</span>
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
          <button onClick={() => setOpenDropdownId(openDropdownId === row.id_paciente ? null : row.id_paciente)} className="p-1.5 rounded transition-colors hover:bg-slate-200 text-slate-500">
            <MoreVertical className="w-5 h-5" />
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

  // Handlers del Formulario
  const handleCloseForm = () => { setShowForm(false); setEditingPatient(null); };
  const handleSavePatient = async (formData: any) => {
    if (editingPatient) await updatePatient(editingPatient.id_paciente, formData);
    else await createPatient(formData);
    handleCloseForm();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up font-sans">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: adobe.base }}><Users style={{ color: adobe.highlight }} className="w-7 h-7" /> Directorio de Pacientes</h2>
          <p className="mt-1" style={{ color: adobe.darkTint }}>Usando Ladrillo DataTable Genérico.</p>
        </div>
        <Button variant="primary" icon={<Plus />} onClick={() => { setEditingPatient(null); setShowForm(true); }}>Nuevo Paciente</Button>
      </div>

      {showForm && <PatientForm initialData={editingPatient} onSubmit={handleSavePatient} onCancel={handleCloseForm} />}

      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-white border-slate-100 flex justify-between items-center">
            <div className="w-80"><Input icon={<Search className="w-4 h-4" />} placeholder="Buscar paciente o dossier..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
          </div>

          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.base }} /></div>
          ) : error ? (
            <div className="p-6 text-red-500 text-center font-bold">{error}</div>
          ) : processedData.length === 0 ? (
            <div className="p-10 text-center" style={{ color: adobe.midTint }}>No hay resultados.</div>
          ) : (
            <>
              {/* ¡MAGIA! LA TABLA ENTERA SE RENDERIZA EN 1 SOLA LÍNEA */}
              <DataTable data={currentData} columns={columns} onSort={handleSort} sortConfig={sortConfig} />
              
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={processedData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientPruebasView;