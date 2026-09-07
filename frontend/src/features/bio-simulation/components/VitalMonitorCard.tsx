import React from 'react';
import { Activity, RotateCcw, Play, Pause } from 'lucide-react';
import type { VitFrame } from '../hooks/useBioSimulator';
import { INAAQC_THEME } from '../../../config/theme';

interface VitalMonitorCardProps {
  currentFrame: VitFrame;
  simStatus: 'idle' | 'playing' | 'paused' | 'finished';
  simStep: number;
  totalFrames: number;
  onPlayPause: () => void;
  onReset: () => void;
}

export const VitalMonitorCard: React.FC<VitalMonitorCardProps> = ({
  currentFrame,
  simStatus,
  simStep,
  totalFrames,
  onPlayPause,
  onReset,
}) => {
  const adobe = INAAQC_THEME.palette;
  const bpm = currentFrame.bpm;
  const beatDuration = bpm > 0 ? (60 / bpm).toFixed(2) : '0';

  let heartState = 'RITMO SINUSAL NORMAL';
  let heartColor = '#E11D48'; // Rose clinical
  let glowColor = 'rgba(225, 29, 72, 0.2)';
  let statusText = 'HEMODINAMIA ESTABLE';
  let statusColor = '#10B981'; // Emerald

  if (bpm === 0 && totalFrames > 0 && simStatus !== 'idle') {
    heartState = 'ASISTOLIA / PARO';
    heartColor = '#64748B'; // Slate muted
    glowColor = 'transparent';
    statusText = 'PARO CARDÍACO';
    statusColor = '#94A3B8';
  } else if (bpm > 0 && bpm < 50) {
    heartState = 'BRADICARDIA';
    heartColor = '#0284C7'; // Cyan/Blue clínico en vez de morado saturado
    glowColor = 'rgba(2, 132, 199, 0.2)';
    statusText = 'BRADICARDIA MODERADA';
    statusColor = '#38BDF8';
  } else if (bpm > 100) {
    heartState = 'TAQUICARDIA';
    heartColor = '#F59E0B'; // Amber alerta
    glowColor = 'rgba(245, 158, 11, 0.25)';
    statusText = 'TAQUICARDIA SINUSAL';
    statusColor = '#FBBF24';
  }

  return (
    <div
      className="lg:col-span-2 p-6 rounded-2xl shadow-xl border flex flex-col items-center justify-center relative overflow-hidden min-h-[400px] text-white transition-all"
      style={{
        backgroundColor: adobe.base,
        borderColor: `${adobe.darkTint}60`,
      }}
    >
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.12); }
          30% { transform: scale(1); }
          45% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .anim-heart {
          animation: ${bpm > 0 ? `heartbeat ${beatDuration}s infinite` : 'none'};
          transition: fill 0.4s ease, filter 0.4s ease;
        }
      `}</style>

      {/* Marca de agua de telemetría */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none font-black text-6xl sm:text-8xl tracking-widest text-center uppercase select-none"
        style={{ color: statusColor }}
      >
        {heartState}
      </div>

      {/* Header del Monitor UCI */}
      <div className="absolute top-5 left-6 right-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: statusColor }} />
          <span
            className="font-bold text-xs tracking-wider uppercase"
            style={{ color: statusColor }}
          >
            {statusText}
          </span>
        </div>
        <div className="text-right">
          <span
            className="text-lg font-mono font-black tracking-tight"
            style={{ color: adobe.highlight }}
          >
            {currentFrame.timeStr}
          </span>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            Tiempo UCI
          </p>
        </div>
      </div>

      {/* Silueta Cardíaca Natural */}
      <div className="z-10 my-4">
        <svg
          viewBox="0 0 32 32"
          className="w-48 h-48 sm:w-56 sm:h-56 anim-heart"
          style={{
            fill: heartColor,
            filter: `drop-shadow(0 0 20px ${glowColor})`,
          }}
        >
          <path d="M16 28.72a2 2 0 0 1-1.33-.51c-3.15-2.78-10.67-9.66-10.67-15.71A7.5 7.5 0 0 1 11.5 5a7.1 7.1 0 0 1 4.5 1.64A7.1 7.1 0 0 1 20.5 5a7.5 7.5 0 0 1 7.5 7.5c0 6.05-7.52 12.93-10.67 15.71a2 2 0 0 1-1.33.51Z" />
        </svg>
      </div>

      {/* Controles de Simulación */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
        <div
          className="backdrop-blur-md px-5 py-2 rounded-full flex items-center gap-3.5 border shadow-lg"
          style={{
            backgroundColor: `${adobe.darkTint}95`,
            borderColor: `${adobe.lightTint}30`,
          }}
        >
          <button
            onClick={onReset}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
            title="Reiniciar Simulación"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={onPlayPause}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
            style={{
              backgroundColor: adobe.highlight,
              color: '#FFFFFF',
            }}
            title={simStatus === 'playing' ? 'Pausar' : 'Iniciar Simulación'}
          >
            {simStatus === 'playing' ? (
              <Pause size={18} className="fill-white" />
            ) : (
              <Play size={18} className="fill-white ml-0.5" />
            )}
          </button>

          <span className="text-slate-300 font-mono text-xs font-semibold w-16 text-center">
            {simStep + 1} / {totalFrames || 1}
          </span>
        </div>
      </div>
    </div>
  );
};
