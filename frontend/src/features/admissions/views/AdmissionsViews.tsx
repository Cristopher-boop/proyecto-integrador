import React, { useState, useMemo } from 'react';
import { ActivitySquare, Plus, Loader2, Search, MoreVertical, Edit2, Power, PowerOff } from 'lucide-react';
import { useAdmissions } from '../hooks/useAdmissions';
import { usePatients } from '../../patients/hooks/usePatients'; 
import { AdmissionForm } from '../components/AdmissionForm';
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Pagination } from '../../../components/common/Pagination';
import { Badge } from '../../../components/common/Badge';
import { DataTable } from '../../../components/common/DataTable';
import type { Column } from '../../../components/common/DataTable';

const AdmissionsView: React.FC = () => {
  const { admisiones, isLoading: loadingAdmissions, error, toggleStatus, createAdmission, updateAdmission } = useAdmissions();
  const { pacientes, isLoading: loadingPatients } = usePatients(); 

  const adobe = INAAQC_THEME.palette;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
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
      
      return (a.numero_episodio || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            nombreCompleto.includes(searchTerm.toLowerCase());
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [admisiones, pacientes, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<any>[] = [
    { 
      header: 'Episodio', 
      accessorKey: 'numero_episodio', // ¡CORREGIDO!
      sortable: true,
      width: 'w-[150px]',
      render: (row) => <div className="text-sm font-bold text-slate-800">{row.numero_episodio}</div>
    },
    { 
      header: 'Paciente', 
      accessorKey: 'paciente', 
      sortable: true,
      width: 'w-[300px]',
      render: (row) => {
        const pInfo = pacientes.find(p => p.id_paciente === row.paciente);
        const displayName = pInfo ? `${pInfo.nombres} ${pInfo.apellidos}` : 'ID: ' + row.paciente;
        return <span className="text-sm font-semibold text-slate-700 truncate">{displayName}</span>
      }
    },
    { 
      header: 'Sala / Cama', 
      accessorKey: 'cama_sala', // ¡CORREGIDO!
      sortable: true,
      render: (row) => <span className="text-sm font-medium text-slate-600">{row.cama_sala}</span>
    },
    { 
      header: 'Ingreso', 
      accessorKey: 'fecha_ingreso', 
      sortable: true,
      render: (row) => {
        if (!row.fecha_ingreso) return <span className="text-sm font-medium text-slate-600">-</span>;
        try {
          const dateObj = new Date(row.fecha_ingreso);
          if (isNaN(dateObj.getTime())) return <span className="text-sm font-medium text-slate-600">{row.fecha_ingreso}</span>;
          
          // ¡CORREGIDO! Formato de fecha elegante (DD/MM/YYYY, HH:MM)
          const formatStr = dateObj.toLocaleString('es-ES', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          });
          return <span className="text-sm font-medium text-slate-600">{formatStr}</span>;
        } catch {
          return <span className="text-sm font-medium text-slate-600">{row.fecha_ingreso}</span>;
        }
      }
    },
    { 
      header: 'Estado', 
      accessorKey: 'esta_activo', 
      sortable: true,
      align: 'center',
      render: (row) => <Badge status={row.esta_activo ? 'success' : 'neutral'}>{row.esta_activo ? 'Activo' : 'Cerrado'}</Badge>
    },
    { 
      header: 'Acción', 
      align: 'right',
      render: (row) => (
        <div className="relative inline-block text-left">
          <button onClick={() => setOpenDropdownId(openDropdownId === row.id_admision ? null : row.id_admision)} className="p-1.5 rounded transition-colors hover:bg-slate-200 text-slate-500">
            <MoreVertical className="w-5 h-5" />
          </button>
          {openDropdownId === row.id_admision && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
              <div className="absolute right-8 top-0 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95">
                <button onClick={() => { setEditingAdmission(row); setShowForm(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Edit2 className="w-4 h-4 text-slate-400" /> Editar Registro
                </button>
                <button onClick={() => { toggleStatus(row.id_admision, row.esta_activo); setOpenDropdownId(null); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${row.esta_activo ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                  {row.esta_activo ? <PowerOff className="w-4 h-4 opacity-70" /> : <Power className="w-4 h-4 opacity-70" />}
                  {row.esta_activo ? 'Cerrar Episodio' : 'Reactivar'}
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  const handleCloseForm = () => { setShowForm(false); setEditingAdmission(null); };
  const handleSaveAdmission = async (formData: any) => {
    if (editingAdmission) await updateAdmission(editingAdmission.id_admision, formData);
    else await createAdmission(formData);
    handleCloseForm();
  };

  const isLoading = loadingAdmissions || loadingPatients;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up font-sans">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: adobe.base }}>
            <ActivitySquare style={{ color: adobe.highlight }} className="w-8 h-8" /> Control de Admisiones
          </h2>
          <p className="mt-1 font-medium text-sm" style={{ color: adobe.darkTint }}>Gestión de episodios clínicos e ingresos.</p>
        </div>
        <Button variant="primary" icon={<Plus />} onClick={() => { setEditingAdmission(null); setShowForm(true); }}>Nueva Admisión</Button>
      </div>

      {showForm && <AdmissionForm pacientes={pacientes} initialData={editingAdmission} onSubmit={handleSaveAdmission} onCancel={handleCloseForm} />}

      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-white border-slate-100 flex justify-between items-center">
            <div className="w-80"><Input icon={<Search className="w-4 h-4" />} placeholder="Buscar episodio o paciente..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
          </div>

          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.base }} /></div>
          ) : error ? (
            <div className="p-6 text-red-500 text-center font-bold">{error}</div>
          ) : processedData.length === 0 ? (
            <div className="p-10 text-center" style={{ color: adobe.midTint }}>No hay admisiones registradas.</div>
          ) : (
            <>
              <DataTable data={currentData} columns={columns} onSort={handleSort} sortConfig={sortConfig} />
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={processedData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdmissionsView;