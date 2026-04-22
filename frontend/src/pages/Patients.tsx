import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Loader2, Search, UserPlus, CheckCircle2, XCircle, Edit2, Power, PowerOff } from 'lucide-react';

interface Paciente {
  id_paciente: string;
  dossier_erasme: string;
  dossier_mpi: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: string;
  creado_en?: string;
  esta_activo?: boolean;
}

const Patients: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NUEVO: Estado para saber si estamos editando y qué ID
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dossier_erasme: '',
    dossier_mpi: '',
    fecha_nacimiento: '',
    sexo: 'M'
  });

  const fetchPacientes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // Ruta estrictamente corregida
      const response = await axios.get('http://127.0.0.1:8000/api/v1/patients/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPacientes(response.data);
    } catch (err: any) {
      setError('Error al cargar los pacientes. Verifica tu conexión o sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  // Función para manejar Crear y Actualizar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (editingId) {
        // ACTUALIZAR (PUT)
        await axios.put(`http://127.0.0.1:8000/api/v1/patients/${editingId}/`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // CREAR (POST)
        await axios.post('http://127.0.0.1:8000/api/v1/patients/', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      cerrarFormulario();
      fetchPacientes();
    } catch (err: any) {
      alert(`Error al ${editingId ? 'actualizar' : 'crear'} paciente: ` + (err.response?.data?.error || JSON.stringify(err.response?.data)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // NUEVO: Función para dar de Baja/Alta Lógica ajustada a tus endpoints de Django
  const handleToggleStatus = async (id: string, estadoActual: boolean | undefined) => {
    if (!window.confirm(`¿Estás seguro de que deseas ${estadoActual ? 'desactivar' : 'activar'} a este paciente?`)) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (estadoActual) {
        // DESACTIVAR: Llamamos a la ruta de detalle con el método DELETE
        await axios.delete(`http://127.0.0.1:8000/api/v1/patients/${id}/`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
      } else {
        // REACTIVAR: Llamamos a tu ruta específica
        // (Nota: uso POST porque suele ser el estándar para acciones personalizadas, 
        // si tu backend exige PATCH, solo cambia axios.post por axios.patch)
        await axios.post(`http://127.0.0.1:8000/api/v1/patients/${id}/reactivar/`, {}, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
      }
      
      fetchPacientes();
    } catch (err: any) {
      alert('Error al cambiar el estado del paciente. Verifica la consola para más detalles.');
      console.error(err.response?.data);
    }
  };

  // Prepara el formulario para editar
  const abrirParaEditar = (paciente: Paciente) => {
    setEditingId(paciente.id_paciente);
    setFormData({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      dossier_erasme: paciente.dossier_erasme,
      dossier_mpi: paciente.dossier_mpi || '',
      fecha_nacimiento: paciente.fecha_nacimiento,
      sexo: paciente.sexo
    });
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombres: '', apellidos: '', dossier_erasme: '', dossier_mpi: '', fecha_nacimiento: '', sexo: 'M' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600 w-7 h-7" />
            Directorio de Pacientes
          </h2>
          <p className="text-slate-500 mt-1">Gestiona los perfiles clínicos de la institución.</p>
        </div>
        <button 
          onClick={showForm ? cerrarFormulario : () => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2 transition-colors"
        >
          {showForm ? <Search className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
          {showForm ? 'Ver Directorio' : 'Nuevo Paciente'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-500" /> 
            {editingId ? 'Editar Perfil del Paciente' : 'Registrar Nuevo Paciente'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nombres</label>
              <input required type="text" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Apellidos</label>
              <input required type="text" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Dossier Erasme</label>
              <input required type="text" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.dossier_erasme} onChange={e => setFormData({...formData, dossier_erasme: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Dossier MPI</label>
              <input type="text" className="w-full border p-2 rounded focus:ring-2 outline-none" placeholder="Opcional"
                value={formData.dossier_mpi} onChange={e => setFormData({...formData, dossier_mpi: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha de Nacimiento</label>
              <input required type="date" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.fecha_nacimiento} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
              <select className="w-full border p-2 rounded focus:ring-2 outline-none"
                value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-4 flex gap-3">
              <button disabled={isSubmitting} type="submit" className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Guardar Cambios' : 'Registrar Paciente')}
              </button>
              {editingId && (
                <button type="button" onClick={cerrarFormulario} className="px-6 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : error ? (
            <div className="p-6 text-red-500 text-center">{error}</div>
          ) : pacientes.length === 0 ? (
            <div className="p-10 text-slate-500 text-center">No hay pacientes registrados en el sistema.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b">
                    <th className="p-4 font-medium">Paciente</th>
                    <th className="p-4 font-medium">Dossier Erasme</th>
                    <th className="p-4 font-medium">Dossier MPI</th>
                    <th className="p-4 font-medium">Nacimiento</th>
                    <th className="p-4 font-medium text-center">Estado</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((p) => (
                    <tr key={p.id_paciente} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!p.esta_activo ? 'opacity-60 bg-slate-50' : ''}`}>
                      <td className="p-4 font-medium text-slate-800">{p.nombres} {p.apellidos}</td>
                      <td className="p-4 text-slate-600 font-mono text-sm">{p.dossier_erasme}</td>
                      <td className="p-4 text-slate-600 font-mono text-sm">{p.dossier_mpi || '-'}</td>
                      <td className="p-4 text-slate-600">{p.fecha_nacimiento}</td>
                      <td className="p-4 text-center">
                        {p.esta_activo ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            <XCircle className="w-3 h-3" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => abrirParaEditar(p)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(p.id_paciente, p.esta_activo)}
                          className={`p-2 rounded transition-colors ${p.esta_activo ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={p.esta_activo ? "Desactivar" : "Reactivar"}
                        >
                          {p.esta_activo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;