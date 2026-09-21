import React, { useMemo } from 'react';
import { HeartPulse, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useBioSimulator } from '../hooks/useBioSimulator';
import { VitalMonitorCard } from '../components/VitalMonitorCard';
import { TelemetryGauges } from '../components/TelemetryGauges';
import { ClinicalHeader } from '../../../components/common/ClinicalHeader';
import { useEpisodeDateFilter, formatDateBadge } from '../../../hooks/useEpisodeDateFilter';
import { INAAQC_THEME } from '../../../config/theme';

export const BioSimulationView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const {
    admisiones,
    selectedAdmision,
    setSelectedAdmision,
    frames,
    isLoading,
    error,
    simStep,
    simStatus,
    handlePlayPause,
    handleReset,
  } = useBioSimulator();

  const currentFrame = frames[simStep] || { bpm: 0, spo2: null, temp: null, timeStr: '--:--' };

  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    availableYears,
    filteredEpisodes,
  } = useEpisodeDateFilter(admisiones, selectedAdmision, (a) => a.id_admision);

  const episodeOptions = useMemo(
    () =>
      filteredEpisodes.map((a) => ({
        value: a.id_admision,
        label: a.numero_episodio,
        secondary: a.paciente_nombre,
        badge: formatDateBadge(a.fecha_ingreso),
      })),
    [filteredEpisodes]
  );

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <ClinicalHeader
        title="Simulación Biológica Reactiva"
        subtitle="Recreación hemodinámica del órgano vital basado en signos extraídos (VIT)."
        icon={<HeartPulse style={{ color: '#E11D48' }} className="w-6 h-6 sm:w-7 sm:h-7" />}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onChangeYear={setSelectedYear}
        onChangeMonth={setSelectedMonth}
        availableYears={availableYears}
        episodes={episodeOptions}
        selectedEpisode={selectedAdmision}
        onEpisodeChange={setSelectedAdmision}
        episodeIcon={<HeartPulse className="w-4 h-4 text-rose-500" />}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-700 font-semibold text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ÁREA DE SIMULACIÓN */}
      {!selectedAdmision ? (
        <div className="bg-white dark:bg-[#1E3040] p-12 rounded-2xl border border-slate-100 dark:border-[#334759] flex flex-col items-center justify-center text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Selecciona un episodio para iniciar la simulación biológica.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-400 max-w-md">
            Visualizarás el ciclo cardíaco, saturación SpO2 y respuesta térmica en tiempo real.
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white dark:bg-[#1E3040] p-12 rounded-2xl border border-slate-100 dark:border-[#334759] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.highlight }} />
          <p className="font-bold tracking-widest uppercase text-xs text-slate-500 dark:text-slate-400">
            Cargando signos vitales continuos...
          </p>
        </div>
      ) : frames.length === 0 ? (
        <div className="bg-white dark:bg-[#1E3040] p-12 rounded-2xl border border-slate-100 dark:border-[#334759] flex flex-col items-center justify-center text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            No hay Signos Vitales (VIT) registrados en este episodio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <VitalMonitorCard
            currentFrame={currentFrame}
            simStatus={simStatus}
            simStep={simStep}
            totalFrames={frames.length}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
          />
          <TelemetryGauges currentFrame={currentFrame} />
        </div>
      )}
    </div>
  );
};

export default BioSimulationView;

