import React from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';

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
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button 
          onClick={onPlayPause}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white transition-all shadow-sm ${
            simStatus === 'playing' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {simStatus === 'playing' ? <Pause size={18} /> : <Play size={18} />}
          {simStatus === 'playing' ? 'Pausar' : 'Simular'}
        </button>
        <button 
          onClick={onSkipToEnd}
          disabled={simStatus === 'finished'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50"
        >
          <FastForward size={18} /> Terminar Ya
        </button>
        <button 
          onClick={onReset}
          className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          title="Reiniciar Simulación"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <div className="text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
        Bloques de tiempo: <span className="text-indigo-600">{simStep}</span> / {totalSteps}
        {simStep > 0 && currentTimestamp && (
          <span className="ml-2 text-slate-500 font-mono">
            ({new Date(currentTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
          </span>
        )}
      </div>
    </div>
  );
};
