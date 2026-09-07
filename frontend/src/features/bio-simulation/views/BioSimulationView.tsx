import React from 'react';
import { HeartPulse, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useBioSimulator } from '../hooks/useBioSimulator';
import { VitalMonitorCard } from '../components/VitalMonitorCard';
import { TelemetryGauges } from '../components/TelemetryGauges';

export const BioSimulationView: React.FC = () => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
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
