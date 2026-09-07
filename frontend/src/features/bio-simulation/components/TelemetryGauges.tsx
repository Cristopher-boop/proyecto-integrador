import React from 'react';
import type { VitFrame } from '../hooks/useBioSimulator';

interface TelemetryGaugesProps {
  currentFrame: VitFrame;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({ currentFrame }) => {
  const bpm = currentFrame.bpm;
  const beatDuration = bpm > 0 ? (60 / bpm).toFixed(2) : '0';

  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col gap-4">
      {/* FRECUENCIA CARDÍACA */}
      <div className={`p-6 rounded-2xl border ${bpm === 0 ? 'bg-slate-800 border-slate-700' : 'bg-rose-950/30 border-rose-900/50'} relative overflow-hidden`}>
        <h3 className="text-rose-500 font-bold text-sm tracking-widest mb-1">FRECUENCIA (BPM)</h3>
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-black font-mono leading-none ${bpm === 0 ? 'text-slate-500' : 'text-white'}`}>
            {bpm > 0 ? bpm : '---'}
          </span>
          <span className="text-slate-400 font-bold mb-1">lat/min</span>
        </div>
        <div className="mt-4 text-xs font-mono text-rose-400/80">
          Velocidad anim: {bpm > 0 ? beatDuration : '0'}s/ciclo
        </div>
      </div>

      {/* SPO2 */}
      <div className="p-6 rounded-2xl bg-cyan-950/30 border border-cyan-900/50 relative overflow-hidden">
        <h3 className="text-cyan-500 font-bold text-sm tracking-widest mb-1">SPO2 (OXÍGENO)</h3>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black font-mono leading-none text-white">
            {currentFrame.spo2 !== null ? currentFrame.spo2 : '--'}
          </span>
          <span className="text-slate-400 font-bold mb-1">%</span>
        </div>
      </div>

      {/* TEMPERATURA */}
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
  );
};
