import React, { useMemo } from 'react';
import { LineChart as ChartIcon, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useLabTrends } from '../hooks/useLabTrends';
import { TrendsPlaybackBar } from '../components/TrendsPlaybackBar';
import { TrendsMasterChart } from '../components/TrendsMasterChart';
import { TrendsIndividualCards } from '../components/TrendsIndividualCards';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { PageHeader } from '../../../components/common/PageHeader';
import { INAAQC_THEME } from '../../../config/theme';

export const LabTrendsView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const {
    admisiones,
    selectedAdmision,
    setSelectedAdmision,
    observaciones,
    isLoading,
    error,
    uniqueTimes,
    simStep,
    simStatus,
    handlePlayPause,
    handleSkipToEnd,
    handleReset,
    visibleCharts,
    masterData,
  } = useLabTrends();

  const currentTimeStr = simStep > 0 && uniqueTimes[simStep - 1]
    ? new Date(uniqueTimes[simStep - 1]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const episodeOptions = useMemo(
    () =>
      admisiones.map((a) => ({
        value: a.id_admision,
        label: a.numero_episodio,
        secondary: a.paciente_nombre,
      })),
    [admisiones]
  );

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <PageHeader
        title="Simulación de Tendencias LAB"
        subtitle="Análisis dinámico temporal exclusivo para bioquímica y analítica sanguínea."
        icon={<ChartIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
      >
        <div className="w-full sm:w-80">
          <SearchableSelect
            options={episodeOptions}
            value={selectedAdmision}
            onChange={setSelectedAdmision}
            placeholder="-- Seleccionar episodio clínico --"
            searchPlaceholder="Buscar por episodio o paciente..."
            icon={<ChartIcon className="w-4 h-4" />}
          />
        </div>
      </PageHeader>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-700 font-semibold text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* REPRODUCTOR */}
      {selectedAdmision && uniqueTimes.length > 0 && (
        <TrendsPlaybackBar
          simStatus={simStatus}
          simStep={simStep}
          totalSteps={uniqueTimes.length}
          currentTimestamp={uniqueTimes[simStep - 1]}
          onPlayPause={handlePlayPause}
          onSkipToEnd={handleSkipToEnd}
          onReset={handleReset}
        />
      )}

      {/* ÁREA DE GRÁFICAS */}
      {!selectedAdmision ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">
            Selecciona un episodio para visualizar las curvas de laboratorio.
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            El motor sincronizará los paneles analíticos en tiempo cronológico sin alterar los registros.
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.highlight }} />
          <p className="font-bold tracking-widest uppercase text-xs text-slate-500">
            Sincronizando series temporales...
          </p>
        </div>
      ) : observaciones.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-600">
            No hay estudios de laboratorio (LAB) registrados en este episodio.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <TrendsMasterChart
            data={masterData}
            visibleCharts={visibleCharts}
            simStatus={simStatus}
            currentTimeStr={currentTimeStr}
          />
          <TrendsIndividualCards charts={visibleCharts} />
        </div>
      )}
    </div>
  );
};

export default LabTrendsView;

