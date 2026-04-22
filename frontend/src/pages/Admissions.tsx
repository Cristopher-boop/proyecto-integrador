import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Plus, Loader2, Search, ClipboardList, CheckCircle2, XCircle, Edit2, PowerOff } from 'lucide-react';

interface Paciente {
  id_paciente: string;
  nombres: string;
  apellidos: string;
  dossier_erasme: string;
  esta_activo: boolean;
}

interface Admision {
  id_admision: string;
  numero_episodio: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  cama_sala: string;
  peso_ingreso_kg: string;
  talla_ingreso_cm: string;
  esta_activo: boolean;
  paciente: string;
}

const Admissions: React.FC = () => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    paciente: '', 
    numero_episodio: '',
    fecha_ingreso: new Date().toISOString().slice(0, 16),
    cama_sala: '',
    peso_ingreso_kg: '',
    talla_ingreso_cm: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const pacientesRes = await axios.get('http://127.0.0.1:8000/api/v1/patients/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const admisionesRes = await axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPacientes(pacientesRes.data);
      setAdmisiones(admisionesRes.data);
    } catch (err: any) {
      setError('Error al cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (editingId) {
        // ACTUALIZAR (PUT)
        await axios.put(`http://127.0.0.1:8000/api/v1/patients/admisiones/${editingId}/`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // CREAR (POST)
        await axios.post('http://127.0.0.1:8000/api/v1/patients/admisiones/', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      cerrarFormulario();
      fetchData();
    } catch (err: any) {
      alert('Error en la operación: ' + (err.response?.data?.error || 'Revisa los datos'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("¿Confirmar Alta Médica? El episodio dejará de estar activo para monitoreo.")) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://127.0.0.1:8000/api/v1/patients/admisiones/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err: any) {
      alert('Error al dar de alta el episodio.');
    }
  };

  const abrirParaEditar = (a: Admision) => {
    setEditingId(a.id_admision);
    setFormData({
      paciente: a.paciente,
      numero_episodio: a.numero_episodio,
      fecha_ingreso: new Date(a.fecha_ingreso).toISOString().slice(0, 16),
      cama_sala: a.cama_sala,
      peso_ingreso_kg: a.peso_ingreso_kg,
      talla_ingreso_cm: a.talla_ingreso_cm
    });
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ 
      paciente: '', numero_episodio: '', fecha_ingreso: new Date().toISOString().slice(0, 16),
      cama_sala: '', peso_ingreso_kg: '', talla_ingreso_cm: '' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600 w-7 h-7" />
            Gestión de Episodios Clínicos
          </h2>
          <p className="text-slate-500 mt-1">Control de ingresos y altas hospitalarias.</p>
        </div>
        <button 
          onClick={showForm ? cerrarFormulario : () => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow font-medium flex items-center gap-2"
        >
          {showForm ? <Search className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
          {showForm ? 'Ver Directorio' : 'Nueva Admisión'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-500" /> 
            {editingId ? 'Editar Detalles del Episodio' : 'Aperturar Nuevo Episodio'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-600 mb-1">Paciente</label>
              <select required className="w-full border p-2 rounded focus:ring-2 outline-none bg-slate-50 disabled:opacity-60"
                disabled={!!editingId}
                value={formData.paciente} onChange={e => setFormData({...formData, paciente: e.target.value})}>
                <option value="">-- Selecciona un Paciente --</option>
                {pacientes.filter(p => p.esta_activo || p.id_paciente === formData.paciente).map(p => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.nombres} {p.apellidos} ({p.dossier_erasme})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nº de Episodio</label>
              <input required type="text" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.numero_episodio} onChange={e => setFormData({...formData, numero_episodio: e.target.value})} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha y Hora de Ingreso</label>
              <input required type="datetime-local" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.fecha_ingreso} onChange={e => setFormData({...formData, fecha_ingreso: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cama / Sala</label>
              <input required type="text" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.cama_sala} onChange={e => setFormData({...formData, cama_sala: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Peso (Kg)</label>
              <input type="number" step="0.01" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.peso_ingreso_kg} onChange={e => setFormData({...formData, peso_ingreso_kg: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Talla (cm)</label>
              <input type="number" step="0.01" className="w-full border p-2 rounded focus:ring-2 outline-none" 
                value={formData.talla_ingreso_cm} onChange={e => setFormData({...formData, talla_ingreso_cm: e.target.value})} />
            </div>

            <div className="md:col-span-3 mt-4 flex gap-3">
              <button disabled={isSubmitting} type="submit" className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Guardar Cambios' : 'Registrar Episodio')}
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b">
                    <th className="p-4 font-medium">Episodio</th>
                    <th className="p-4 font-medium">Paciente</th>
                    <th className="p-4 font-medium">Sala/Cama</th>
                    <th className="p-4 font-medium">Ingreso</th>
                    <th className="p-4 font-medium text-center">Estado</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admisiones.map((a) => {
                    const px = pacientes.find(p => p.id_paciente === a.paciente);
                    const nombre = px ? `${px.nombres} ${px.apellidos}` : 'N/D';

                    return (
                      <tr key={a.id_admision} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${!a.esta_activo ? 'opacity-60 bg-slate-50' : ''}`}>
                        <td className="p-4 font-bold text-blue-600">{a.numero_episodio}</td>
                        <td className="p-4 font-medium text-slate-800">{nombre}</td>
                        <td className="p-4 text-slate-600 font-mono text-sm">{a.cama_sala}</td>
                        <td className="p-4 text-slate-600 text-xs">{new Date(a.fecha_ingreso).toLocaleString()}</td>
                        <td className="p-4 text-center">
                          {a.esta_activo ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                              <XCircle className="w-3 h-3" /> ALTA
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => abrirParaEditar(a)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {a.esta_activo && (
                            <button 
                              onClick={() => handleDeactivate(a.id_admision)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Dar de Alta"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admissions;