import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Microscope, Loader2, AlertCircle, FileText, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Admision {
  id_admision: string;
  numero_episodio: string;
  paciente_nombre?: string;
}

interface Paciente {
  id_paciente: string;
  nombres: string;
  apellidos: string;
}

interface Observacion {
  id_observacion: string;
  parametro: string;
  valor_numerico: string;
  unidad_medida: string | null;
  rango_referencia_min: string | null;
  rango_referencia_max: string | null;
  fecha_hora_registro: string;
}

const Labs: React.FC = () => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmisiones = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        const [pacientesRes, admisionesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/patients/', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const admisionesConNombre = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: Paciente) => p.id_paciente === a.paciente);
          return {
            ...a,
            paciente_nombre: px ? `${px.nombres} ${px.apellidos}` : 'Paciente Desconocido'
          };
        });

        setAdmisiones(admisionesConNombre);
      } catch (err) {
        setError('No se pudo cargar la lista de episodios.');
      }
    };
    fetchAdmisiones();
  }, []);

  useEffect(() => {
    if (!selectedAdmision) {
      setObservaciones([]);
      return;
    }

    const fetchObservaciones = async () => {
      setIsLoadingLabs(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/admision/${selectedAdmision}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setObservaciones(response.data);
      } catch (err: any) {
        setError('Error al cargar los resultados de laboratorio.');
      } finally {
        setIsLoadingLabs(false);
      }
    };

    fetchObservaciones();
  }, [selectedAdmision]);

  // --- LÓGICA CORE: MAPA DE CALOR BIOMÉDICO ADAPTADO A LA BD ---
  const getHeatmapStyle = (valorStr: string, minStr: string | null, maxStr: string | null) => {
    if (!minStr || !maxStr) {
      return { 
        rowClass: 'bg-white hover:bg-slate-50', 
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
        statusText: 'Sin Rango'
      };
    }

    const value = parseFloat(valorStr);
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (value >= min && value <= max) {
      return { 
        rowClass: 'bg-white hover:bg-slate-50', 
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        statusText: 'Normal'
      };
    }
    
    const deviation = value < min ? (min - value) / min : (value - max) / max;
    
    if (deviation <= 0.1) {
      return { 
        rowClass: 'bg-yellow-50/50 hover:bg-yellow-50', 
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 font-bold',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        statusText: 'Límite'
      };
    }
    
    return { 
      rowClass: 'bg-red-50 hover:bg-red-100/80 transition-colors', 
      badgeClass: 'bg-red-200 text-red-900 border-red-400 font-extrabold animate-pulse',
      icon: <AlertCircle className="w-5 h-5 text-red-700" />,
      statusText: 'Crítico'
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Microscope className="text-slate-900 w-8 h-8" />
            Laboratorio Clínico y Biomarcadores
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Visualización de datos extraídos por el Motor OCR.</p>
        </div>
        
        <div className="w-full md:w-96">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seleccionar Episodio</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold p-3 pl-4 pr-10 rounded-lg focus:ring-0 focus:border-slate-900 outline-none transition-colors cursor-pointer"
              value={selectedAdmision}
              onChange={(e) => setSelectedAdmision(e.target.value)}
            >
              <option value="">-- Elige un episodio para ver sus datos --</option>
              {admisiones.map(a => (
                <option key={a.id_admision} value={a.id_admision}>
                  {a.numero_episodio} - {a.paciente_nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-900 p-4 rounded text-red-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {!selectedAdmision ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <FileText className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">Selecciona un episodio clínico en el menú superior.</p>
          </div>
        ) : isLoadingLabs ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-900 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold tracking-widest uppercase text-sm">Extrayendo datos de la base de datos...</p>
          </div>
        ) : observaciones.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No hay datos biomédicos para este episodio.</p>
            <p className="text-sm">Ve a "Ingesta de Datos" y sube un documento PDF para procesarlo con el OCR.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-slate-900 text-white shadow-md z-10">
                <tr className="text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold">Fecha de Registro</th>
                  <th className="p-4 font-bold">Parámetro</th>
                  <th className="p-4 font-bold text-right">Valor Detectado</th>
                  <th className="p-4 font-bold">Unidad</th>
                  <th className="p-4 font-bold">Rangos Ref.</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {observaciones.map((obs) => {
                  const style = getHeatmapStyle(obs.valor_numerico, obs.rango_referencia_min, obs.rango_referencia_max);
                  
                  return (
                    <tr key={obs.id_observacion} className={`border-b border-slate-100 transition-colors ${style.rowClass}`}>
                      <td className="p-4 flex justify-center items-center" title={style.statusText}>
                        {style.icon}
                      </td>
                      <td className="p-4 font-medium whitespace-nowrap">
                        {new Date(obs.fecha_hora_registro).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{obs.parametro}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-md border font-mono text-base ${style.badgeClass}`}>
                          {parseFloat(obs.valor_numerico).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {obs.unidad_medida || '-'}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-xs">
                        {obs.rango_referencia_min && obs.rango_referencia_max 
                          ? `[${obs.rango_referencia_min} - ${obs.rango_referencia_max}]` 
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Labs;