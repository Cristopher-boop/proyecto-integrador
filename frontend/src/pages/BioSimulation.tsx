import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { HeartPulse, Loader2, AlertCircle, FileText, ChevronDown, Play, Pause, RotateCcw, Activity } from 'lucide-react';

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
  fecha_hora_registro: string;
  tipo_observacion?: string; 
}

// Interfaz para el "Frame" de tiempo
interface VitFrame {
  timeStr: string;
  timestamp: number;
  bpm: number; // Beats per minute (Frecuencia Cardíaca)
  spo2: number | null; // Saturación
  temp: number | null; // Temperatura
}

const BioSimulation: React.FC = () => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [frames, setFrames] = useState<VitFrame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- REPRODUCTOR ---
  const [simStep, setSimStep] = useState<number>(0);
  const [simStatus, setSimStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');

  // Cargar admisiones
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

  // Cargar y procesar datos VIT
  useEffect(() => {
    if (!selectedAdmision) {
      setFrames([]);
      setSimStep(0);
      setSimStatus('idle');
      return;
    }
    
    const fetchVitData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/admision/${selectedAdmision}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // 1. Filtrar solo Vitales
        const isVit = (parametro: string, tipoDb?: string) => {
          const p = (parametro || '').toLowerCase();
          if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión') || p.includes('saturación')) return true;
          if (tipoDb === 'SIGNOS_VITALES') return true;
          return false;
        };
        const vitData = response.data.filter((obs: Observacion) => isVit(obs.parametro, obs.tipo_observacion));
        
        // 2. Agrupar por hora exacta
        const timeMap = new Map<string, VitFrame>();
        vitData.forEach((obs: Observacion) => {
          const p = obs.parametro.toLowerCase();
          const time = new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const timestamp = new Date(obs.fecha_hora_registro).getTime();

          if (!timeMap.has(time)) {
            timeMap.set(time, { timeStr: time, timestamp, bpm: 0, spo2: null, temp: null });
          }
          
          const frame = timeMap.get(time)!;
          const val = parseFloat(obs.valor_numerico);
          
          if (p.includes('frecuencia')) frame.bpm = val;
          else if (p.includes('saturación') || p.includes('spo2')) frame.spo2 = val;
          else if (p.includes('temperatura')) frame.temp = val;
        });

        // 3. Ordenar cronológicamente y propagar el BPM (si un frame no tiene BPM, hereda el anterior)
        const sortedFrames = Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp);
        for (let i = 1; i < sortedFrames.length; i++) {
          if (sortedFrames[i].bpm === 0 && sortedFrames[i-1].bpm > 0) {
            sortedFrames[i].bpm = sortedFrames[i-1].bpm; // Memoria biológica
          }
        }

        setFrames(sortedFrames);
        setSimStep(0);
        setSimStatus('idle');

      } catch (err: any) {
        setError('Error al cargar datos vitales.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVitData();
  }, [selectedAdmision]);

  // Motor del Reproductor
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simStatus === 'playing') {
      interval = setInterval(() => {
        setSimStep(prev => {
          if (prev >= frames.length - 1) {
            setSimStatus('finished');
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 segundos por bloque vital para apreciar el latido
    }
    return () => { if (interval) clearInterval(interval); };
  }, [simStatus, frames.length]);

  // Controles
  const handlePlayPause = () => {
    if (simStatus === 'playing') setSimStatus('paused');
    else {
      if (simStep >= frames.length - 1) setSimStep(0); 
      setSimStatus('playing');
    }
  };

  const handleReset = () => {
    setSimStep(0);
    setSimStatus('idle');
  };

  // --- LÓGICA BIOLÓGICA ---
  const currentFrame = frames[simStep] || { bpm: 0, spo2: null, temp: null, timeStr: '--:--' };
  const bpm = currentFrame.bpm;
  
  // Calcular velocidad de la animación en CSS (60 latidos / bpm = duración en segundos)
  const beatDuration = bpm > 0 ? (60 / bpm).toFixed(2) : '0';

  // Determinar Estado Clínico
  let heartState = 'NORMAL';
  let heartColor = '#ef4444'; // rose-500
  let glowColor = 'rgba(244, 63, 94, 0.4)';
  let statusText = 'ESTABLE';
  let statusColor = 'text-emerald-500';

  if (bpm === 0 && frames.length > 0 && simStatus !== 'idle') {
    heartState = 'OBITO';
    heartColor = '#475569'; // slate-600
    glowColor = 'transparent';
    statusText = 'ASISTOLIA / ÓBITO';
    statusColor = 'text-slate-500';
  } else if (bpm > 0 && bpm < 50) {
    heartState = 'BRADICARDIA';
    heartColor = '#8b5cf6'; // violet-500
    glowColor = 'rgba(139, 92, 246, 0.5)';
    statusText = 'BRADICARDIA CRÍTICA';
    statusColor = 'text-violet-500';
  } else if (bpm > 100) {
    heartState = 'TAQUICARDIA';
    heartColor = '#f59e0b'; // amber-500
    glowColor = 'rgba(245, 158, 11, 0.6)';
    statusText = 'TAQUICARDIA ALERTA';
    statusColor = 'text-amber-500';
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Estilos inyectados para el latido realista */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .anim-heart {
          animation: ${bpm > 0 ? `heartbeat ${beatDuration}s infinite` : 'none'};
          transition: fill 0.5s ease, filter 0.5s ease;
        }
      `}</style>

      {/* HEADER Y SELECTOR */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <HeartPulse className="text-rose-500 w-8 h-8" />
            Simulación Biológica Reactiva
          </h2>
          <p className="text-slate-500 font-medium">Recreación del órgano vital basado en signos extraídos (VIT).</p>
        </div>
        
        <div className="w-full md:w-96">
          <select 
            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold p-3 rounded-xl focus:border-rose-500 outline-none transition-all"
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

      {/* ÁREA DE SIMULACIÓN */}
      {!selectedAdmision ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <FileText className="w-16 h-16 opacity-20" />
          <p className="text-lg font-medium">Selecciona un episodio para iniciar la simulación biológica.</p>
        </div>
      ) : isLoading ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-900 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          <p className="font-bold tracking-widest uppercase text-sm">Cargando signos vitales...</p>
        </div>
      ) : frames.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 space-y-2">
          <AlertCircle className="w-12 h-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-600">No hay Signos Vitales (VIT) registrados en este episodio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PANEL IZQUIERDO: EL CORAZÓN */}
          <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
            
            {/* Texto de Estado de Emergencia de fondo (Marca de agua) */}
            <div className={`absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none font-black text-[120px] leading-none text-center ${statusColor}`}>
              {heartState}
            </div>

            {/* Cabecera del Monitor */}
            <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <Activity className={`w-6 h-6 ${statusColor}`} />
                <span className={`font-bold tracking-widest ${statusColor}`}>{statusText}</span>
              </div>
              <div className="text-right">
                <span className="text-white text-xl font-mono font-black">{currentFrame.timeStr}</span>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hora Simulada</p>
              </div>
            </div>

            {/* SVG DEL CORAZÓN (CANVAS REACTIVO) */}
            <div className="z-10 mt-8">
              <svg 
                viewBox="0 0 32 32" 
                className="w-64 h-64 anim-heart drop-shadow-2xl"
                style={{ 
                  fill: heartColor, 
                  filter: `drop-shadow(0 0 40px ${glowColor}) drop-shadow(0 0 80px ${glowColor})` 
                }}
              >
                <path d="M16 28.72a2 2 0 0 1-1.33-.51c-3.15-2.78-10.67-9.66-10.67-15.71A7.5 7.5 0 0 1 11.5 5a7.1 7.1 0 0 1 4.5 1.64A7.1 7.1 0 0 1 20.5 5a7.5 7.5 0 0 1 7.5 7.5c0 6.05-7.52 12.93-10.67 15.71a2 2 0 0 1-1.33.51Z" />
              </svg>
            </div>
            
            {/* Controles del Reproductor abajo del corazón */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-4 border border-slate-700">
                <button onClick={handleReset} className="p-2 text-slate-400 hover:text-white transition-colors"><RotateCcw size={20} /></button>
                <button onClick={handlePlayPause} className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                  {simStatus === 'playing' ? <Pause size={24} className="fill-slate-900" /> : <Play size={24} className="fill-slate-900 ml-1" />}
                </button>
                <span className="text-slate-400 font-mono text-sm w-16 text-center">
                  {simStep + 1} / {frames.length}
                </span>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO: MONITOR DE NÚMEROS */}
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col gap-4">
            
            <div className={`p-6 rounded-2xl border ${bpm === 0 ? 'bg-slate-800 border-slate-700' : 'bg-rose-950/30 border-rose-900/50'} relative overflow-hidden`}>
              <h3 className="text-rose-500 font-bold text-sm tracking-widest mb-1">FRECUENCIA (BPM)</h3>
              <div className="flex items-end gap-2">
                <span className={`text-6xl font-black font-mono leading-none ${bpm === 0 ? 'text-slate-500' : 'text-white'}`}>
                  {bpm > 0 ? bpm : '---'}
                </span>
                <span className="text-slate-400 font-bold mb-1">lat/min</span>
              </div>
              {/* Ritmo renderizado dinámicamente para el doctor */}
              <div className="mt-4 text-xs font-mono text-rose-400/80">
                Velocidad anim: {bpm > 0 ? beatDuration : '0'}s/ciclo
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-cyan-950/30 border border-cyan-900/50 relative overflow-hidden">
              <h3 className="text-cyan-500 font-bold text-sm tracking-widest mb-1">SPO2 (OXÍGENO)</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black font-mono leading-none text-white">
                  {currentFrame.spo2 !== null ? currentFrame.spo2 : '--'}
                </span>
                <span className="text-slate-400 font-bold mb-1">%</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-900/50 relative overflow-hidden flex-1">
              <h3 className="text-amber-500 font-bold text-sm tracking-widest mb-1">TEMPERATURA</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black font-mono leading-none text-white">
                  {currentFrame.temp !== null ? currentFrame.temp : '--.-'}
                </span>
                <span className="text-slate-400 font-bold mb-1">°C</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default BioSimulation;