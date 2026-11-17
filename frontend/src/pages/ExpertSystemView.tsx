import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Activity, BrainCircuit, AlertTriangle, Syringe, HeartPulse, FileText, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { INAAQC_THEME } from '../config/theme';

interface ExpertoData {
  sofa: number;
  saps3: number;
  mortalidad: number;
  datosInsuficientes: boolean;
  comorbilidades: { nombre: string; categoria: string }[];
  soportes: { nombre: string; categoria: string }[];
  diagnosticos: { nombre: string }[];
}

interface EpisodeOption {
  value: string;
  label: string;
}

const ExpertSystemView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // El episodio actual puede venir de la URL o del selector interno
  const urlEpisode = searchParams.get('episodio') || '';
  const [selectedEpisode, setSelectedEpisode] = useState<string>(urlEpisode);
  const [episodeOptions, setEpisodeOptions] = useState<EpisodeOption[]>([]);

  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [data, setData] = useState<ExpertoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. CARGAR LISTA DE EPISODIOS ACTIVOS (Igual que en Ingesta) ---
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [pacientesRes, admisionesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/patients/', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const options = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: any) => p.id_paciente === a.paciente);
          const nombre = px ? `${px.nombres} ${px.apellidos}` : 'Paciente Desconocido';
          return {
            value: a.numero_episodio,
            label: `${a.numero_episodio} - ${nombre}`
          };
        });
        setEpisodeOptions(options);
      } catch (err) {
        console.error("Error al cargar episodios en el sistema experto", err);
      }
    };
    fetchEpisodes();
  }, []);

  // Sincronizar si cambia el parámetro de la URL (ej. si venimos redirigidos desde Ingesta)
  useEffect(() => {
    if (urlEpisode) {
      setSelectedEpisode(urlEpisode);
    }
  }, [urlEpisode]);

  // --- 2. TRAER LOS DATOS EN TIEMPO REAL CUANDO SE SELECCIONA UN EPISODIO ---
  useEffect(() => {
    if (!selectedEpisode) {
      setData(null);
      return;
    }

    const fetchRealData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/expert-system/data/?numero_episodio=${selectedEpisode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err: any) {
        console.error("Error al recuperar datos del sistema experto", err);
        setError("No se pudieron cargar los datos calculados de este episodio clínico.");
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [selectedEpisode]);

  // Manejador del cambio en el selector de admisiones
  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedEpisode(val);
    if (val) {
      setSearchParams({ episodio: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up font-sans">
      
      {/* HEADER UNIFICADO CON SELECTOR INTEGRADO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: adobe.base }}>
            <BrainCircuit style={{ color: adobe.highlight }} className="w-8 h-8" /> 
            Sistema Experto: Control Predictivo
          </h2>
          <p className="mt-1 font-medium text-sm" style={{ color: adobe.darkTint }}>
            Perfil de disfunción orgánica basado en hechos reales extraídos.
          </p>
        </div>
        
        {/* SELECTOR DE ADMISIÓN DINÁMICO */}
        <div className="w-full lg:w-96">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: adobe.midTint }}>Seleccionar Admisión / Episodio</label>
          <div className="relative">
            <select 
              className="w-full appearance-none border-2 text-sm font-bold p-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer bg-white focus:border-blue-400 transition-colors"
              style={{ borderColor: adobe.midTint, color: adobe.base }}
              value={selectedEpisode}
              onChange={handleEpisodeChange}
            >
              <option value="">-- Selecciona un episodio activo --</option>
              {episodeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: adobe.base }} />
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL DE RENDERIZADO */}
      {!selectedEpisode ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200" style={{ color: adobe.base }}>
          <BrainCircuit className="mx-auto mb-3 opacity-30 animate-pulse" size={48} style={{ color: adobe.midTint }} />
          <h3 className="text-lg font-bold">Base de Hechos Vacía</h3>
          <p className="text-sm mt-1" style={{ color: adobe.darkTint }}>Por favor, utiliza el menú desplegable superior para elegir un episodio clínico e iniciar el motor de inferencia.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin mb-4" size={40} style={{ color: adobe.highlight }} />
          <p className="text-sm font-bold" style={{ color: adobe.darkTint }}>Consultando Base de Hechos e infiriendo scores médicos...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border flex items-center gap-2" style={{ backgroundColor: statusColors.warning.bg, borderColor: statusColors.warning.border, color: statusColors.warning.text }}>
          <AlertTriangle size={20} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      ) : (
        <>
          {/* ALERTA DINÁMICA DE DATOS INSUFICIENTES */}
          {data?.datosInsuficientes && (
            <div className="p-4 rounded-xl border flex items-start gap-3 shadow-sm animate-in fade-in" style={{ backgroundColor: statusColors.alert.bg, borderColor: statusColors.alert.border }}>
              <AlertTriangle className="shrink-0 mt-0.5" size={20} style={{ color: statusColors.alert.text }} />
              <div>
                <h4 className="font-bold text-sm" style={{ color: statusColors.alert.text }}>Alerta de Consistencia (Falta de Hechos Fisiológicos)</h4>
                <p className="text-xs mt-1" style={{ color: statusColors.alert.text }}>
                  Faltan laboratorios o registros vitales de las primeras 24 horas (ej. Glasgow o Plaquetas). Las calculadoras SOFA y SAPS 3 se ejecutaron con los datos disponibles pero podrían subestimar la gravedad real.
                </p>
              </div>
            </div>
          )}

          {/* GRID DE 3 COLUMNAS REALES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA 1: BASE DE HECHOS NLP */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2" style={{ backgroundColor: '#f8fafc' }}>
                <FileText size={18} style={{ color: adobe.darkTint }} />
                <h3 className="font-bold" style={{ color: adobe.base }}>Base de Hechos (NLP)</h3>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto space-y-6">
                {/* Diagnósticos */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: adobe.midTint }}>Diagnósticos Principales / Secundarios</h4>
                  {data?.diagnosticos.length === 0 ? (
                    <p className="text-xs italic text-slate-400">No se detectaron diagnósticos en el texto.</p>
                  ) : (
                    <ul className="space-y-2">
                      {data?.diagnosticos.map((dx, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm font-semibold p-2 rounded-lg" style={{ backgroundColor: adobe.lightTint + '20', color: adobe.darkTint }}>
                          <CheckCircle2 size={16} style={{ color: adobe.highlight }} />
                          {dx.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Comorbilidades */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: adobe.midTint }}>Antecedentes Personales (Comorbilidades)</h4>
                  {data?.comorbilidades.length === 0 ? (
                    <p className="text-xs italic text-slate-400">Ninguna comorbilidad registrada en este episodio.</p>
                  ) : (
                    <ul className="space-y-2">
                      {data?.comorbilidades.map((com, idx) => (
                        <li key={idx} className="flex flex-col p-3 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden bg-white">
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: adobe.highlight }}></div>
                          <span className="font-bold text-sm" style={{ color: adobe.base }}>{com.nombre}</span>
                          <span className="text-xs font-medium mt-0.5" style={{ color: adobe.midTint }}>{com.categoria}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA 2: SOPORTES UCI */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2" style={{ backgroundColor: '#f8fafc' }}>
                <Syringe size={18} style={{ color: adobe.darkTint }} />
                <h3 className="font-bold" style={{ color: adobe.base }}>Intervenciones Extraídas</h3>
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: adobe.midTint }}>Soportes Orgánicos Activos</h4>
                  {data?.soportes.length === 0 ? (
                    <p className="text-xs italic text-slate-400">No se detectó uso de soportes invasivos.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data?.soportes.map((sop, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-md text-xs font-bold border" 
                              style={{ backgroundColor: statusColors.success.bg, color: statusColors.success.text, borderColor: statusColors.success.border }}>
                          {sop.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center" style={{ borderColor: adobe.lightTint, backgroundColor: adobe.lightTint + '10' }}>
                   <Activity size={32} style={{ color: adobe.midTint }} className="mb-2 opacity-50" />
                   <p className="text-sm font-semibold" style={{ color: adobe.darkTint }}>Sincronización Fisiológica</p>
                   <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: adobe.midTint }}>
                     Los peores laboratorios de las primeras 24h cruzados automáticamente con los soportes para calcular los scores médicos.
                   </p>
                </div>
              </div>
            </div>

            {/* COLUMNA 3: RESOLUCIÓN MATEMÁTICA */}
            <div className="rounded-xl shadow-lg overflow-hidden flex flex-col relative" style={{ backgroundColor: adobe.base }}>
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <HeartPulse size={240} color="#fff" />
              </div>

              <div className="p-4 border-b border-white/10 flex items-center gap-2 relative z-10">
                <Activity size={18} style={{ color: adobe.highlight }} />
                <h3 className="font-bold text-white">Inferencia de Gravedad</h3>
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-6 relative z-10">
                
                {/* CARD SOFA REAL */}
                <div className="p-4 rounded-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.lightTint }}>SOFA Score Total</span>
                    <span className="text-3xl font-black text-white leading-none">{data?.sofa} <span className="text-sm font-normal text-white/40">/24</span></span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-500" 
                         style={{ 
                           width: `${((data?.sofa || 0) / 24) * 100}%`, 
                           backgroundColor: data && data.sofa > 9 ? statusColors.warning.text : statusColors.success.text 
                         }}>
                    </div>
                  </div>
                </div>

                {/* CARD SAPS 3 REAL */}
                <div className="p-4 rounded-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                   <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.lightTint }}>Puntaje de Severidad SAPS 3</span>
                    <span className="text-2xl font-black text-white">{data?.saps3} <span className="text-sm font-normal text-white/40">pts</span></span>
                  </div>
                </div>

                {/* PROBABILIDAD DE MORTALIDAD */}
                <div className="mt-auto pt-4 border-t border-white/10 text-center">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: adobe.highlight }}>Mortalidad Intrahospitalaria Estimada</h4>
                  <div className="flex items-start justify-center gap-0.5">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {data?.mortalidad}
                    </span>
                    <span className="text-2xl font-bold mt-2" style={{ color: adobe.lightTint }}>%</span>
                  </div>
                  <p className="text-[10px] mt-2 text-white/40 max-w-xs mx-auto leading-relaxed">
                    Predicción calculada mediante modelos estadísticos basados en la regresión logística estándar del SAPS 3.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default ExpertSystemView;