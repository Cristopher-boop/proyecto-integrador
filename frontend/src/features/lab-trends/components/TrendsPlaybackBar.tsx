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
    <div className="bg-white dark:bg-[#1E3040] p-3.5 rounded-2xl shadow-xs border border-slate-100 dark:border-[#334759] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#15232F] hover:bg-slate-200 dark:hover:bg-[#334759]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/60 dark:border-[#334759]"
        >
          <FastForward size={15} /> Finalizar
        </button>

        <button
          onClick={onReset}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#15232F] rounded-xl transition-colors border border-slate-200/60 dark:border-[#334759]"
          title="Reiniciar Simulación"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#15232F] px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-[#334759] flex items-center justify-between sm:justify-end gap-2">
        <span>
          Bloques temporales:{' '}
          <strong className="text-slate-800 dark:text-white font-bold">{simStep}</strong> / {totalSteps}
        </span>
        {simStep > 0 && currentTimestamp && (
          <span
            className="font-mono font-bold px-2 py-0.5 rounded-md text-[11px] bg-[#9EBDD9]/30 text-[#1E3040] dark:bg-[#87C7FF]/20 dark:text-[#87C7FF]"
          >
            {new Date(currentTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
