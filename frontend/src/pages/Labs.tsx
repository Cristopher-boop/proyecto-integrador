import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Microscope, Loader2, AlertCircle, FileText, ChevronDown, CheckCircle2, AlertTriangle, Activity, Brain, Droplet, Wind, Filter } from 'lucide-react';

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
  tipo_observacion?: string; 
}

type FilterType = 'ALL' | 'VIT' | 'GLAS' | 'LAB' | 'PUL';

const Labs: React.FC = () => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL'); 
  
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
        setActiveFilter('ALL'); 
      } catch (err: any) {
        setError('Error al cargar los resultados de laboratorio.');
      } finally {
        setIsLoadingLabs(false);
      }
    };

    fetchObservaciones();
  }, [selectedAdmision]);

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

  // --- NUEVO: INFERENCIA FUERTE POR NOMBRE DE PARÁMETRO ---
  // Esta función decide a qué módulo pertenece un dato sin depender del backend
  const getTipoCategoria = (parametro: string, tipoDb?: string): FilterType => {
    const p = (parametro || '').toLowerCase();
    
    // 1. Neurológico
    if (p.includes('glasgow') || p.includes('coma')) return 'GLAS';
    
    // 2. Gasometría (PUL)
    if (
      p.includes('ph') || 
      p.includes('pco2') || 
      p.includes('po2') || 
      p.includes('lactato') || 
      p.includes('exceso de base') || 
      p.includes('(arterial)') || 
      p.includes('(venoso)') ||
      p.includes('gases')
    ) return 'PUL';
    
    // 3. Signos Vitales (VIT)
    if (
      p.includes('frecuencia') || 
      p.includes('temperatura') || 
      p.includes('presión arterial') || 
      p === 'saturación de oxígeno' // <-- match exacto sin "gases"
    ) return 'VIT';
    
    // 4. Fallback al backend por si acaso
    if (tipoDb === 'SIGNOS_VITALES') return 'VIT';
    if (tipoDb === 'NEUROLOGICO') return 'GLAS';
    
    // 5. Todo lo demás es Laboratorio de Sangre
    return 'LAB';
  };

  // Lógica de Filtrado actualizada
  const filteredObservaciones = observaciones.filter(obs => {
    if (activeFilter === 'ALL') return true;
    const categoriaReal = getTipoCategoria(obs.parametro, obs.tipo_observacion);
    return categoriaReal === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Microscope className="text-indigo-600 w-8 h-8" />
            Resultados Clínicos Integrados
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Visualización de todos los datos extraídos por la IA.</p>
        </div>
        
        <div className="w-full md:w-96">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seleccionar Episodio</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold p-3 pl-4 pr-10 rounded-lg focus:ring-0 focus:border-indigo-600 outline-none transition-colors cursor-pointer"
              value={selectedAdmision}
              onChange={(e) => setSelectedAdmision(e.target.value)}
            >
              <option value="">-- Elige un episodio --</option>
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
        
        {selectedAdmision && !isLoadingLabs && observaciones.length > 0 && (
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap gap-2">
            <button onClick={() => setActiveFilter('ALL')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Filter className="w-4 h-4" /> Todo el Historial
            </button>
            <button onClick={() => setActiveFilter('VIT')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeFilter === 'VIT' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Activity className="w-4 h-4" /> Signos Vitales (VIT)
            </button>
            <button onClick={() => setActiveFilter('GLAS')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeFilter === 'GLAS' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Brain className="w-4 h-4" /> Neurológico (GLAS)
            </button>
            <button onClick={() => setActiveFilter('PUL')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeFilter === 'PUL' ? 'bg-cyan-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Wind className="w-4 h-4" /> Gasometría (PUL)
            </button>
            <button onClick={() => setActiveFilter('LAB')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeFilter === 'LAB' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Droplet className="w-4 h-4" /> Lab. Sangre (LAB)
            </button>
          </div>
        )}

        {!selectedAdmision ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <FileText className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">Selecciona un episodio clínico en el menú superior.</p>
          </div>
        ) : isLoadingLabs ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-900 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="font-bold tracking-widest uppercase text-sm">Extrayendo datos...</p>
          </div>
        ) : observaciones.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No hay datos biomédicos para este episodio.</p>
            <p className="text-sm">Ve a "Ingesta Inteligente" y sube documentos para procesarlos.</p>
          </div>
        ) : filteredObservaciones.length === 0 ? (
           <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-2">
           <Filter className="w-12 h-12 text-slate-300" />
           <p className="text-lg font-medium text-slate-600">No hay datos para esta categoría.</p>
           <p className="text-sm">Intenta seleccionar otra pestaña en el menú superior.</p>
         </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-slate-900 text-white shadow-md z-10">
                <tr className="text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold">Fecha / Hora</th>
                  <th className="p-4 font-bold">Categoría</th>
                  <th className="p-4 font-bold">Parámetro</th>
                  <th className="p-4 font-bold text-right">Valor Detectado</th>
                  <th className="p-4 font-bold">Unidad</th>
                  <th className="p-4 font-bold">Rangos Ref.</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {filteredObservaciones.map((obs) => {
                  const style = getHeatmapStyle(obs.valor_numerico, obs.rango_referencia_min, obs.rango_referencia_max);
                  
                  // Aplicamos la misma función fuerte aquí para la etiqueta visual
                  const tipoTag = getTipoCategoria(obs.parametro, obs.tipo_observacion);

                  return (
                    <tr key={obs.id_observacion} className={`border-b border-slate-100 transition-colors ${style.rowClass}`}>
                      <td className="p-4 flex justify-center items-center" title={style.statusText}>
                        {style.icon}
                      </td>
                      <td className="p-4 font-medium whitespace-nowrap">
                        {new Date(obs.fecha_hora_registro).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                          tipoTag === 'VIT' ? 'bg-rose-100 text-rose-700' :
                          tipoTag === 'GLAS' ? 'bg-amber-100 text-amber-700' :
                          tipoTag === 'PUL' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {tipoTag}
                        </span>
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