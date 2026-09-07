import React from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';

interface TrendsPlaybackBarProps {
  simStatus: 'idle' | 'playing' | 'paused' | 'finished';
  simStep: number;
  totalSteps: number;
  currentTimestamp?: string;
  onPlayPause: () => void;
  onSkipToEnd: () => void;
  onReset: () => void;
}

export const TrendsPlaybackBar: React.FC<TrendsPlaybackBarProps> = ({
  simStatus,
  simStep,
  totalSteps,
  currentTimestamp,
  onPlayPause,
  onSkipToEnd,
  onReset,
}) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayPause}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-xs active:scale-95"
          style={{
            backgroundColor: simStatus === 'playing' ? '#E11D48' : adobe.highlight,
          }}
        >
          {simStatus === 'playing' ? <Pause size={16} /> : <Play size={16} />}
          {simStatus === 'playing' ? 'Pausar' : 'Iniciar Simulación'}
        </button>

        <button
          onClick={onSkipToEnd}
          disabled={simStatus === 'finished'}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/60"
        >
          <FastForward size={15} /> Finalizar
        </button>

        <button
          onClick={onReset}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60"
          title="Reiniciar Simulación"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 flex items-center justify-between sm:justify-end gap-2">
        <span>
          Bloques temporales:{' '}
          <strong className="text-slate-800 font-bold">{simStep}</strong> / {totalSteps}
        </span>
        {simStep > 0 && currentTimestamp && (
          <span
            className="font-mono font-bold px-2 py-0.5 rounded-md text-[11px]"
            style={{ backgroundColor: `${adobe.lightTint}30`, color: adobe.base }}
          >
            {new Date(currentTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
