import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart as ChartIcon, Loader2, AlertCircle, FileText, ChevronDown, Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';

// Paleta de colores clínicos para distinguir parámetros (Se mantiene para diferenciarlos visualmente)
const COLOR_PALETTE = ['#4f46e5', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

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

  // --- ESTADOS DEL REPRODUCTOR DE SIMULACIÓN ---
  const [simStep, setSimStep] = useState<number>(0);
  const [simStatus, setSimStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('finished');

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

  // 2. Cargar datos del episodio seleccionado y FILTRAR ESTRICTAMENTE A LAB
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

        // --- FILTRO DE HIERRO PARA LAB ---
        const isLab = (parametro: string, tipoDb?: string) => {
          const p = (parametro || '').toLowerCase();
          if (p.includes('glasgow') || p.includes('coma')) return false; // GLAS
          // BLOQUEAMOS TODO LO RELACIONADO A GASES / PULMONAR (Incluyendo Arterial/Venoso explícitamente)
          if (p.includes('ph') || p.includes('pco2') || p.includes('po2') || p.includes('lactato') || p.includes('exceso de base') || p.includes('arterial') || p.includes('venoso') || p.includes('gases')) return false; 
          if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión arterial') || p === 'saturación de oxígeno') return false; // VIT
          if (tipoDb === 'SIGNOS_VITALES' || tipoDb === 'NEUROLOGICO' || tipoDb === 'PULMONAR') return false;
          return true; // Solo sobrevive LAB
        };

        const labOnly = response.data.filter((obs: Observacion) => isLab(obs.parametro, obs.tipo_observacion));
        const sortedData = labOnly.sort((a: any, b: any) => 
          new Date(a.fecha_hora_registro).getTime() - new Date(b.fecha_hora_registro).getTime()
        );
        
        setObservaciones(sortedData);
        setSimStep(sortedData.length); // Mostrar todo por defecto al cargar
        setSimStatus('finished');

      } catch (err: any) {
        setError('Error al cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservaciones();
  }, [selectedAdmision]);

  // 3. Lógica del Motor de Simulación (Intervalo)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simStatus === 'playing') {
      interval = setInterval(() => {
        setSimStep(prev => {
          if (prev >= observaciones.length) {
            setSimStatus('finished');
            return prev;
          }
          return prev + 1;
        });
      }, 800); // 800ms por cada punto
    }
    return () => { if (interval) clearInterval(interval); };
  }, [simStatus, observaciones.length]);

  // --- CONTROLES DEL REPRODUCTOR ---
  const handlePlayPause = () => {
    if (simStatus === 'playing') {
      setSimStatus('paused');
    } else {
      if (simStep >= observaciones.length) setSimStep(1); // Si terminó y le da a play, reinicia desde 1
      setSimStatus('playing');
    }
  };

  const handleSkipToEnd = () => {
    setSimStep(observaciones.length);
    setSimStatus('finished');
  };

  const handleReset = () => {
    setSimStep(0);
    setSimStatus('idle');
  };

  // 4. Preparar datos para las Gráficas
  const getVisibleData = () => observaciones.slice(0, simStep);

  const prepareChartData = () => {
    const visible = getVisibleData();
    // Identificamos las cajas de parámetros usando el TOTAL de observaciones para que las gráficas existan desde el step 0
    const parameters = Array.from(new Set(observaciones.map(obs => obs.parametro)));

    return parameters.map((param, index) => {
      const records = visible
        .filter(obs => obs.parametro === param)
        .map(obs => ({
          timeStr: new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          valor: parseFloat(obs.valor_numerico),
        }));

      // Extraemos los mínimos y máximos del global para que la banda verde siempre esté dibujada
      const allRecordsForParam = observaciones.filter(obs => obs.parametro === param);
      const globalMin = allRecordsForParam[0]?.rango_referencia_min ? parseFloat(allRecordsForParam[0].rango_referencia_min) : null;
      const globalMax = allRecordsForParam[0]?.rango_referencia_max ? parseFloat(allRecordsForParam[0].rango_referencia_max) : null;

      return {
        parametro: param,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
        data: records,
        min: globalMin,
        max: globalMax,
        unidad: allRecordsForParam[0]?.unidad_medida || 'Unidades'
      };
    });
  };

  const visibleCharts = prepareChartData();

  const prepareMasterData = () => {
    const visible = getVisibleData();
    const timeBuckets: { [key: string]: any } = {};
    visible.forEach(obs => {
      const time = new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!timeBuckets[time]) timeBuckets[time] = { timeStr: time };
      timeBuckets[time][obs.parametro] = parseFloat(obs.valor_numerico);
    });
    return Object.values(timeBuckets);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* HEADER Y SELECTOR */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <ChartIcon className="text-indigo-600 w-8 h-8" />
            Simulación de Tendencias LAB
          </h2>
          <p className="text-slate-500 font-medium">Análisis dinámico exclusivo para laboratorios de sangre.</p>
        </div>
        
        <div className="w-full md:w-96">
          <select 
            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold p-3 rounded-xl focus:border-indigo-600 outline-none transition-all"
            value={selectedAdmision}
            onChange={(e) => setSelectedAdmision(e.target.value)}
          >
            <option value="">Seleccionar Episodio Clínico...</option>
            {admisiones.map(a => (
              <option key={a.id_admision} value={a.id_admision}>{a.numero_episodio} - {a.paciente_nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-900 p-4 rounded text-red-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* REPRODUCTOR DE SIMULACIÓN (CONTROLES) */}
      {selectedAdmision && observaciones.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white transition-all shadow-sm ${simStatus === 'playing' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {simStatus === 'playing' ? <Pause size={18} /> : <Play size={18} />}
              {simStatus === 'playing' ? 'Pausar' : 'Simular'}
            </button>
            <button 
              onClick={handleSkipToEnd}
              disabled={simStatus === 'finished'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50"
            >
              <FastForward size={18} /> Terminar Ya
            </button>
            <button 
              onClick={handleReset}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Reiniciar Simulación"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            Puntos procesados: <span className="text-indigo-600">{simStep}</span> / {observaciones.length}
          </div>
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
          <p className="font-bold tracking-widest uppercase text-sm">Cargando datos...</p>
        </div>
      ) : observaciones.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 space-y-2">
          <AlertCircle className="w-12 h-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-600">No hay estudios de sangre (LAB) registrados.</p>
        </div>
      ) : (
        <>
          {/* GRÁFICA MAESTRA (TODOS JUNTOS) */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${simStatus === 'playing' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                Vista Comparativa Consolidada
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareMasterData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="timeStr" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend />
                  {visibleCharts.map((c, i) => (
                    <Line 
                      key={i} type="monotone" dataKey={c.parametro} stroke={c.color} 
                      strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} animationDuration={300}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICAS INDIVIDUALES (RESTAURADAS A SU VERSIÓN BONITA) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleCharts.map((chart, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                
                <div className="mb-4 flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chart.color }} />
                    {chart.parametro}
                  </h3>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                    {chart.unidad}
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="timeStr" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      
                      {/* Banda Verde de Referencia (siempre visible) */}
                      {chart.min !== null && chart.max !== null && (
                        <ReferenceArea y1={chart.min} y2={chart.max} fill="#10b981" fillOpacity={0.1} />
                      )}

                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        name="Valor" 
                        stroke={chart.color} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: chart.color, strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }} 
                        animationDuration={300} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LabTrends;