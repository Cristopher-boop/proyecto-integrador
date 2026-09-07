import React from 'react';
import { LineChart as ChartIcon, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useLabTrends } from '../hooks/useLabTrends';
import { TrendsPlaybackBar } from '../components/TrendsPlaybackBar';
import { TrendsMasterChart } from '../components/TrendsMasterChart';
import { TrendsIndividualCards } from '../components/TrendsIndividualCards';

export const LabTrendsView: React.FC = () => {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans">
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
              <option key={a.id_admision} value={a.id_admision}>
                {a.numero_episodio} - {a.paciente_nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-900 p-4 rounded text-red-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
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
          <TrendsMasterChart
            data={masterData}
            visibleCharts={visibleCharts}
            simStatus={simStatus}
            currentTimeStr={currentTimeStr}
          />
          <TrendsIndividualCards charts={visibleCharts} />
        </>
      )}
    </div>
  );
};

export default LabTrendsView;
