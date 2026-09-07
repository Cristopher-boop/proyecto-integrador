import React from 'react';
import { Activity, RotateCcw, Play, Pause } from 'lucide-react';
import type { VitFrame } from '../hooks/useBioSimulator';

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
  const bpm = currentFrame.bpm;
  const beatDuration = bpm > 0 ? (60 / bpm).toFixed(2) : '0';

  let heartState = 'NORMAL';
  let heartColor = '#ef4444'; // rose-500
  let glowColor = 'rgba(244, 63, 94, 0.4)';
  let statusText = 'ESTABLE';
  let statusColor = 'text-emerald-500';

  if (bpm === 0 && totalFrames > 0 && simStatus !== 'idle') {
    heartState = 'OBITO';
    heartColor = '#475569'; // slate-600
    glowColor = 'transparent';
    statusText = 'ASISTOLIA / ÓBITO';
    statusColor = 'text-slate-500';
  } else if (bpm > 0 && bpm < 50) {
    heartState = 'BRADICARDIA';
    heartColor = '#8b5cf6'; // violet-500
    glowColor = 'rgba(139, 92, 246, 0.5)';
    statusText = 'BRADICARDIA CRÍTICA';
    statusColor = 'text-violet-500';
  } else if (bpm > 100) {
    heartState = 'TAQUICARDIA';
    heartColor = '#f59e0b'; // amber-500
    glowColor = 'rgba(245, 158, 11, 0.6)';
    statusText = 'TAQUICARDIA ALERTA';
    statusColor = 'text-amber-500';
  }

  return (
    <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .anim-heart {
          animation: ${bpm > 0 ? `heartbeat ${beatDuration}s infinite` : 'none'};
          transition: fill 0.5s ease, filter 0.5s ease;
        }
      `}</style>

      {/* Marca de agua */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none font-black text-[120px] leading-none text-center ${statusColor}`}>
        {heartState}
      </div>

      {/* Header del Monitor */}
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Activity className={`w-6 h-6 ${statusColor}`} />
          <span className={`font-bold tracking-widest ${statusColor}`}>{statusText}</span>
        </div>
        <div className="text-right">
          <span className="text-white text-xl font-mono font-black">{currentFrame.timeStr}</span>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hora Simulada</p>
        </div>
      </div>

      {/* Corazón SVG */}
      <div className="z-10 mt-8">
        <svg 
          viewBox="0 0 32 32" 
          className="w-64 h-64 anim-heart drop-shadow-2xl"
          style={{ 
            fill: heartColor, 
            filter: `drop-shadow(0 0 40px ${glowColor}) drop-shadow(0 0 80px ${glowColor})` 
          }}
        >
          <path d="M16 28.72a2 2 0 0 1-1.33-.51c-3.15-2.78-10.67-9.66-10.67-15.71A7.5 7.5 0 0 1 11.5 5a7.1 7.1 0 0 1 4.5 1.64A7.1 7.1 0 0 1 20.5 5a7.5 7.5 0 0 1 7.5 7.5c0 6.05-7.52 12.93-10.67 15.71a2 2 0 0 1-1.33.51Z" />
        </svg>
      </div>

      {/* Controles flotantes */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-4 border border-slate-700">
          <button onClick={onReset} className="p-2 text-slate-400 hover:text-white transition-colors" title="Reiniciar">
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={onPlayPause} 
            className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
            title={simStatus === 'playing' ? 'Pausar' : 'Reproducir'}
          >
            {simStatus === 'playing' ? <Pause size={24} className="fill-slate-900" /> : <Play size={24} className="fill-slate-900 ml-1" />}
          </button>
          <span className="text-slate-400 font-mono text-sm w-16 text-center">
            {simStep + 1} / {totalFrames}
          </span>
        </div>
      </div>
    </div>
  );
};
