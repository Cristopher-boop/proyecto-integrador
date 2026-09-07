import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrainCircuit, AlertTriangle, HeartPulse, Activity, Loader2, ChevronDown } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import type { ExpertoData } from '../../../types';
import { expertApi, type EpisodeOption } from '../api/expertApi';
import { SofaCard } from '../components/SofaCard';
import { Saps3Card } from '../components/Saps3Card';
import { EntityBadges } from '../components/EntityBadges';

export const ExpertSystemView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlEpisode = searchParams.get('episodio') || '';
  const [selectedEpisode, setSelectedEpisode] = useState<string>(urlEpisode);
  const [episodeOptions, setEpisodeOptions] = useState<EpisodeOption[]>([]);

  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [data, setData] = useState<ExpertoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar lista de episodios activos
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const options = await expertApi.getEpisodeOptions();
        setEpisodeOptions(options);
      } catch (err) {
        console.error('Error al cargar episodios en el sistema experto', err);
      }
    };
    fetchEpisodes();
  }, []);

  // Sincronizar parámetro URL
  useEffect(() => {
    if (urlEpisode) {
      setSelectedEpisode(urlEpisode);
    }
  }, [urlEpisode]);

  // 2. Traer los datos del sistema experto
  useEffect(() => {
    if (!selectedEpisode) {
      setData(null);
      return;
    }

    const fetchRealData = async () => {
      setLoading(true);
      setError(null);
      try {
        const expertData = await expertApi.getExpertData(selectedEpisode);
        setData(expertData);
      } catch (err) {
        console.error('Error al recuperar datos del sistema experto', err);
        setError('No se pudieron cargar los datos calculados de este episodio clínico.');
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [selectedEpisode]);

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
        
        {/* SELECTOR DE ADMISIÓN */}
        <div className="w-full lg:w-96">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: adobe.midTint }}>
            Seleccionar Admisión / Episodio
          </label>
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

      {/* ÁREA CENTRAL */}
      {!selectedEpisode ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200" style={{ color: adobe.base }}>
          <BrainCircuit className="mx-auto mb-3 opacity-30 animate-pulse" size={48} style={{ color: adobe.midTint }} />
          <h3 className="text-lg font-bold">Base de Hechos Vacía</h3>
          <p className="text-sm mt-1" style={{ color: adobe.darkTint }}>
            Por favor, utiliza el menú desplegable superior para elegir un episodio clínico e iniciar el motor de inferencia.
          </p>
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

          {/* GRID DE 3 COLUMNAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <EntityBadges
              diagnosticos={data?.diagnosticos || []}
              comorbilidades={data?.comorbilidades || []}
              soportes={data?.soportes || []}
            />

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
                <SofaCard sofa={data?.sofa || 0} />
                <Saps3Card saps3={data?.saps3 || 0} mortalidad={data?.mortalidad || 0} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpertSystemView;
