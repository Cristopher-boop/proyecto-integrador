import React from 'react';
import type { VitFrame } from '../hooks/useBioSimulator';
import { INAAQC_THEME } from '../../../config/theme';

interface TelemetryGaugesProps {
  currentFrame: VitFrame;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({ currentFrame }) => {
  const adobe = INAAQC_THEME.palette;
  const bpm = currentFrame.bpm;
  const beatDuration = bpm > 0 ? (60 / bpm).toFixed(2) : '0';

  return (
    <div
      className="p-5 rounded-2xl shadow-xl border flex flex-col gap-3.5 text-white"
      style={{
        backgroundColor: adobe.base,
        borderColor: `${adobe.darkTint}60`,
      }}
    >
      {/* 1. FRECUENCIA CARDÍACA */}
      <div
        className="p-4 rounded-xl border relative overflow-hidden transition-all"
        style={{
          backgroundColor: `${adobe.darkTint}60`,
          borderColor: bpm > 0 ? '#E11D4840' : '#47556940',
        }}
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Frecuencia Cardíaca
          </h3>
          <span className="text-[10px] font-mono text-slate-400">BPM</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-mono leading-none tracking-tight text-white">
            {bpm > 0 ? bpm : '---'}
          </span>
          <span className="text-xs font-medium text-slate-400">lat/min</span>
        </div>

        <div className="mt-2 text-[11px] font-mono text-slate-400">
          Ciclo cardíaco: <strong className="text-slate-200">{bpm > 0 ? beatDuration : '0'}s</strong>
        </div>
      </div>

      {/* 2. SATURACIÓN SPO2 */}
      <div
        className="p-4 rounded-xl border relative overflow-hidden transition-all"
        style={{
          backgroundColor: `${adobe.darkTint}60`,
          borderColor: `${adobe.highlight}40`,
        }}
      >
        <div className="flex justify-between items-center mb-1">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: adobe.highlight }}
          >
            Saturación Oxígeno
          </h3>
          <span className="text-[10px] font-mono text-slate-400">SpO2</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-mono leading-none tracking-tight text-white">
            {currentFrame.spo2 !== null ? currentFrame.spo2 : '--'}
          </span>
          <span className="text-xs font-medium text-slate-400">%</span>
        </div>
      </div>

      {/* 3. TEMPERATURA CORPORAL */}
      <div
        className="p-4 rounded-xl border relative overflow-hidden transition-all flex-1"
        style={{
          backgroundColor: `${adobe.darkTint}60`,
          borderColor: '#F59E0B40',
        }}
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Temperatura Central
          </h3>
          <span className="text-[10px] font-mono text-slate-400">TEMP</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-mono leading-none tracking-tight text-white">
            {currentFrame.temp !== null ? currentFrame.temp : '--.-'}
          </span>
          <span className="text-xs font-medium text-slate-400">°C</span>
        </div>
      </div>
    </div>
  );
};
