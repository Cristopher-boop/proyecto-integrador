import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart as ChartIcon, Loader2, AlertCircle, FileText, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';

interface Admision {
  id_admision: string;
  numero_episodio: string;
  paciente_nombre?: string;
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

const LabTrends: React.FC = () => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Cargar episodios
  useEffect(() => {
    const fetchAdmisiones = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [pacientesRes, admisionesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/patients/', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const admisionesConNombre = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: any) => p.id_paciente === a.paciente);
          return { ...a, paciente_nombre: px ? `${px.nombres} ${px.apellidos}` : 'Desconocido' };
        });
        setAdmisiones(admisionesConNombre);
      } catch (err) {
        setError('No se pudo cargar la lista de episodios.');
      }
    };
    fetchAdmisiones();
  }, []);

  // 2. Cargar datos del episodio seleccionado
  useEffect(() => {
    if (!selectedAdmision) {
      setObservaciones([]);
      return;
    }
    const fetchObservaciones = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/admision/${selectedAdmision}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setObservaciones(response.data);
      } catch (err: any) {
        setError('Error al cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservaciones();
  }, [selectedAdmision]);

  // 3. Filtrar SÓLO LAB y agrupar datos para Recharts
  const prepareChartData = () => {
    // --- FIX: INFERENCIA FUERTE ---
    // Como el backend no manda el tipo, lo deducimos por el nombre (igual que en Labs.tsx)
    const isLab = (parametro: string, tipoDb?: string) => {
      const p = (parametro || '').toLowerCase();
      if (p.includes('glasgow') || p.includes('coma')) return false; // Es GLAS
      if (p.includes('ph') || p.includes('pco2') || p.includes('po2') || p.includes('lactato') || p.includes('exceso de base') || p.includes('(arterial)') || p.includes('(venoso)') || p.includes('gases')) return false; // Es PUL
      if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión arterial') || p === 'saturación de oxígeno') return false; // Es VIT
      if (tipoDb === 'SIGNOS_VITALES' || tipoDb === 'NEUROLOGICO' || tipoDb === 'PULMONAR') return false;
      return true; // Si no es nada de lo anterior, ¡entonces es un dato de LAB!
    };

    // Filtramos usando nuestra función inteligente
    const labData = observaciones.filter(obs => isLab(obs.parametro, obs.tipo_observacion));
    
    // Obtenemos los nombres de los parámetros únicos (ej. Hematocrito, Glucosa)
    const parameters = Array.from(new Set(labData.map(obs => obs.parametro)));

    // Creamos un arreglo de gráficas, una por parámetro
    return parameters.map(param => {
      const records = labData
        .filter(obs => obs.parametro === param)
        .map(obs => ({
          timeStr: new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(obs.fecha_hora_registro).getTime(),
          valor: parseFloat(obs.valor_numerico),
          min: obs.rango_referencia_min ? parseFloat(obs.rango_referencia_min) : null,
          max: obs.rango_referencia_max ? parseFloat(obs.rango_referencia_max) : null,
          unidad: obs.unidad_medida || ''
        }))
        .sort((a, b) => a.timestamp - b.timestamp); // Ordenamos cronológicamente

      return {
        parametro: param,
        unidad: records[0]?.unidad,
        minGlobal: records[0]?.min,
        maxGlobal: records[0]?.max,
        data: records
      };
    });
  };

  const chartsData = prepareChartData();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <ChartIcon className="text-indigo-600 w-8 h-8" />
            Estudio Longitudinal LAB
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Análisis de tendencias temporales en laboratorios sanguíneos.</p>
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

      {/* ÁREA DE GRÁFICAS */}
      {!selectedAdmision ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <FileText className="w-16 h-16 opacity-20" />
          <p className="text-lg font-medium">Selecciona un episodio para visualizar las curvas de laboratorio.</p>
        </div>
      ) : isLoading ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-900 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="font-bold tracking-widest uppercase text-sm">Generando gráficas...</p>
        </div>
      ) : chartsData.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 space-y-2">
          <AlertCircle className="w-12 h-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-600">No hay estudios de sangre (LAB) registrados.</p>
          <p className="text-sm">Si los datos existen, verifica que pertenezcan a la categoría LAB.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartsData.map((chart, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              
              <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-lg text-slate-800">{chart.parametro}</h3>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                  {chart.unidad || 'Unidades'}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="timeStr" 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      tickMargin={10} 
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    
                    {/* BANDA VERDE: Rango Normal (Si existe min y max) */}
                    {chart.minGlobal !== null && chart.maxGlobal !== null && (
                      <ReferenceArea 
                        y1={chart.minGlobal} 
                        y2={chart.maxGlobal} 
                        fill="#10b981" 
                        fillOpacity={0.1} 
                      />
                    )}

                    <Line 
                      type="monotone" 
                      dataKey="valor" 
                      name="Valor Detectado"
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default LabTrends;