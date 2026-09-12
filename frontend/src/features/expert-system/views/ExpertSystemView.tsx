import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BrainCircuit, AlertTriangle, HeartPulse, Activity, Loader2 } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import type { ExpertoData } from '../../../types';
import { expertApi, type EpisodeOption } from '../api/expertApi';
import { SofaCard } from '../components/SofaCard';
import { Saps3Card } from '../components/Saps3Card';
import { EntityBadges } from '../components/EntityBadges';
import { ClinicalHeader } from '../../../components/common/ClinicalHeader';
import { useEpisodeDateFilter, formatDateBadge } from '../../../hooks/useEpisodeDateFilter';

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

  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    availableYears,
    filteredEpisodes,
  } = useEpisodeDateFilter(episodeOptions, selectedEpisode, (opt) => opt.value);

  const displayEpisodeOptions = useMemo(
    () =>
      filteredEpisodes.map((opt) => ({
        ...opt,
        badge: formatDateBadge(opt.fecha_ingreso),
      })),
    [filteredEpisodes]
  );

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
        const result = await expertApi.getExpertData(selectedEpisode);
        setData(result);
      } catch (err) {
        console.error('Error al cargar datos del sistema experto:', err);
        setError('No se pudieron cargar los datos calculados de este episodio clínico.');
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [selectedEpisode]);

  const handleEpisodeChange = (val: string) => {
    setSelectedEpisode(val);
    if (val) {
      setSearchParams({ episodio: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <ClinicalHeader
        title="Sistema Experto: Control Predictivo"
        subtitle="Perfil de disfunción orgánica basado en hechos reales extraídos."
        icon={<BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7" />}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onChangeYear={setSelectedYear}
        onChangeMonth={setSelectedMonth}
        availableYears={availableYears}
        episodes={displayEpisodeOptions}
        selectedEpisode={selectedEpisode}
        onEpisodeChange={handleEpisodeChange}
        episodePlaceholder="-- Selecciona un episodio activo --"
        episodeIcon={<BrainCircuit className="w-4 h-4" />}
      />

      {/* ÁREA CENTRAL */}
      {!selectedEpisode ? (
        <div className="p-10 text-center bg-white rounded-2xl shadow-xs border border-slate-100" style={{ color: adobe.base }}>
          <BrainCircuit className="mx-auto mb-3 opacity-30 animate-pulse" size={44} style={{ color: adobe.midTint }} />
          <h3 className="text-base font-bold">Base de Hechos Vacía</h3>
          <p className="text-xs mt-1 max-w-md mx-auto" style={{ color: adobe.darkTint }}>
            Por favor, utiliza el menú desplegable superior para elegir un episodio clínico e iniciar el motor de inferencia.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-xs border border-slate-100">
          <Loader2 className="animate-spin mb-3" size={36} style={{ color: adobe.highlight }} />
          <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Consultando Base de Hechos e infiriendo scores médicos...</p>
        </div>
      ) : error ? (
        <div className="p-3.5 rounded-xl border flex items-center gap-2" style={{ backgroundColor: statusColors.warning.bg, borderColor: statusColors.warning.border, color: statusColors.warning.text }}>
          <AlertTriangle size={18} />
          <span className="text-xs font-bold">{error}</span>
        </div>
      ) : (
        <>
          {/* ALERTA DINÁMICA DE DATOS INSUFICIENTES */}
          {data?.datosInsuficientes && (
            <div className="p-3 rounded-xl border flex items-start gap-2.5 shadow-xs animate-in fade-in" style={{ backgroundColor: statusColors.alert.bg, borderColor: statusColors.alert.border }}>
              <AlertTriangle className="shrink-0 mt-0.5" size={18} style={{ color: statusColors.alert.text }} />
              <div>
                <h4 className="font-bold text-xs" style={{ color: statusColors.alert.text }}>Alerta de Consistencia (Falta de Hechos Fisiológicos)</h4>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: statusColors.alert.text }}>
                  Faltan laboratorios o registros vitales de las primeras 24 horas (ej. Glasgow o Plaquetas). Las calculadoras SOFA y SAPS 3 se ejecutaron con los datos disponibles pero podrían subestimar la gravedad real.
                </p>
              </div>
            </div>
          )}

          {/* GRID DE 3 COLUMNAS: TAMAÑO AJUSTADO AL VIEWPORT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[calc(100vh-12.5rem)] lg:min-h-[480px]">
            <EntityBadges
              diagnosticos={data?.diagnosticos || []}
              comorbilidades={data?.comorbilidades || []}
              soportes={data?.soportes || []}
            />

            {/* COLUMNA 3: RESOLUCIÓN MATEMÁTICA */}
            <div className="rounded-2xl shadow-xs border border-slate-800/40 overflow-hidden flex flex-col h-full min-h-0 relative" style={{ backgroundColor: adobe.base }}>
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <HeartPulse size={240} color="#fff" />
              </div>

              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 relative z-10 shrink-0">
                <Activity size={16} style={{ color: adobe.highlight }} />
                <h3 className="font-bold text-sm text-white">Inferencia de Gravedad</h3>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-4 relative z-10 justify-between overflow-y-auto custom-scrollbar min-h-0">
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
