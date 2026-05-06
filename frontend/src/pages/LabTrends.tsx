import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart as ChartIcon, Loader2, AlertCircle, FileText, ChevronDown, Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';

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

  // --- ESTADOS DEL REPRODUCTOR POR TIEMPO ---
  const [uniqueTimes, setUniqueTimes] = useState<string[]>([]); // Lista ordenada de tiempos únicos (ej: ['07:00', '14:03'])
  const [simStep, setSimStep] = useState<number>(0); // Ahora el step es el índice de uniqueTimes
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

  // 2. Cargar datos y agrupar por tiempos
  useEffect(() => {
    if (!selectedAdmision) {
      setObservaciones([]);
      setUniqueTimes([]);
      return;
    }
    const fetchObservaciones = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/admision/${selectedAdmision}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Filtro estricto de LAB
        const isLab = (parametro: string, tipoDb?: string) => {
          const p = (parametro || '').toLowerCase();
          if (p.includes('glasgow') || p.includes('coma')) return false; 
          if (p.includes('ph') || p.includes('pco2') || p.includes('po2') || p.includes('lactato') || p.includes('exceso de base') || p.includes('arterial') || p.includes('venoso') || p.includes('gases')) return false; 
          if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión arterial') || p === 'saturación de oxígeno') return false; 
          if (tipoDb === 'SIGNOS_VITALES' || tipoDb === 'NEUROLOGICO' || tipoDb === 'PULMONAR') return false;
          return true; 
        };

        const labOnly = response.data.filter((obs: Observacion) => isLab(obs.parametro, obs.tipo_observacion));
        const sortedData = labOnly.sort((a: any, b: any) => 
          new Date(a.fecha_hora_registro).getTime() - new Date(b.fecha_hora_registro).getTime()
        );
        
        // Extraer tiempos únicos (ej. '14/02/2026 07:00')
        const times = Array.from(new Set(sortedData.map((obs: Observacion) => obs.fecha_hora_registro)));
        
        setObservaciones(sortedData);
        setUniqueTimes(times);
        setSimStep(times.length); // Empezar mostrando todo
        setSimStatus('finished');

      } catch (err: any) {
        setError('Error al cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservaciones();
  }, [selectedAdmision]);

  // 3. Lógica del Motor de Simulación (Avanza por Tiempos Únicos)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simStatus === 'playing') {
      interval = setInterval(() => {
        setSimStep(prev => {
          if (prev >= uniqueTimes.length) {
            setSimStatus('finished');
            return prev;
          }
          return prev + 1; // Avanza un "latido" de tiempo
        });
      }, 1000); // 1 segundo por cada bloque de tiempo
    }
    return () => { if (interval) clearInterval(interval); };
  }, [simStatus, uniqueTimes.length]);

  // Controles
  const handlePlayPause = () => {
    if (simStatus === 'playing') setSimStatus('paused');
    else {
      if (simStep >= uniqueTimes.length) setSimStep(1); 
      setSimStatus('playing');
    }
  };

  const handleSkipToEnd = () => {
    setSimStep(uniqueTimes.length);
    setSimStatus('finished');
  };

  const handleReset = () => {
    setSimStep(0);
    setSimStatus('idle');
  };

  // 4. Preparar datos filtrados hasta el tiempo actual simulado
  const getVisibleData = () => {
    if (uniqueTimes.length === 0) return [];
    // Obtenemos el tiempo "límite" actual
    const cutoffTime = uniqueTimes[simStep - 1]; 
    if (!cutoffTime) return [];
    
    // Filtramos las observaciones que ocurrieron en o antes del tiempo límite
    return observaciones.filter(obs => new Date(obs.fecha_hora_registro).getTime() <= new Date(cutoffTime).getTime());
  };

  const prepareChartData = () => {
    const visible = getVisibleData();
    const parameters = Array.from(new Set(observaciones.map(obs => obs.parametro)));

    return parameters.map((param, index) => {
      const records = visible
        .filter(obs => obs.parametro === param)
        .map(obs => ({
          timeStr: new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          valor: parseFloat(obs.valor_numerico),
        }));

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

  // 5. Gráfica Maestra (Todos Juntos) Mejorada
  const prepareMasterData = () => {
    const visible = getVisibleData();
    const timeBuckets: { [key: string]: any } = {};
    
    // Agrupamos por hora para que los puntos coincidan en el mismo eje X
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
      {selectedAdmision && uniqueTimes.length > 0 && (
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
            Bloques de tiempo: <span className="text-indigo-600">{simStep}</span> / {uniqueTimes.length}
            {simStep > 0 && <span className="ml-2 text-slate-500 font-mono">({new Date(uniqueTimes[simStep - 1]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>}
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
          {/* GRÁFICA MAESTRA (TODOS JUNTOS) - MEJORADA PARA EXPANSIÓN */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h3 className="text-white font-bold text-xl flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${simStatus === 'playing' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                  Monitor Longitudinal Consolidado
                </h3>
                <p className="text-slate-400 text-xs font-medium">Correlación temporal de parámetros de laboratorio</p>
              </div>
              <div className="text-right">
                <span className="text-indigo-400 text-lg font-mono font-black">
                  {simStep > 0 ? new Date(uniqueTimes[simStep - 1]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </span>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hora Simulada</p>
              </div>
            </div>

            <div className="h-[450px] w-full"> {/* Aumentamos el alto para que se vea imponente */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  /* IMPORTANTE: Pasamos TODO el mapa de tiempo, pero los valores futuros serán null */
                  data={prepareMasterData()} 
                  margin={{ top: 10, right: 30, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  
                  <XAxis 
                    dataKey="timeStr" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickMargin={15}
                    axisLine={{ stroke: '#475569' }}
                    /* Esto mantiene el ancho de la gráfica constante */
                    interval="preserveStartEnd" 
                  />
                  
                  <YAxis hide domain={['auto', 'auto']} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 'bold', padding: '2px 0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', borderBottom: '1px solid #334155', pb: '4px' }}
                    cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ paddingTop: '0px', paddingBottom: '40px' }}
                  />

                  {/* Dibujamos las líneas con el estilo "bonito" de las individuales */}
                  {visibleCharts.map((c, i) => (
                    <Line 
                      key={i} 
                      type="monotone" 
                      dataKey={c.parametro} 
                      stroke={c.color} 
                      strokeWidth={4} 
                      /* El punto con borde blanco que pediste */
                      dot={{ r: 5, strokeWidth: 2, fill: '#1e293b', stroke: c.color }} 
                      activeDot={{ r: 8, strokeWidth: 0, fill: c.color }} 
                      animationDuration={400} 
                      /* Evita que la línea se corte si faltan datos en una hora */
                      connectNulls 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICAS INDIVIDUALES */}
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
                        animationDuration={500} 
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