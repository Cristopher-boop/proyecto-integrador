import React from 'react';

interface Saps3CardProps {
  saps3: number;
  mortalidad: number;
}

export const Saps3Card: React.FC<Saps3CardProps> = ({ saps3, mortalidad }) => {

  return (
    <>
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Puntaje de Severidad SAPS 3
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {saps3} <span className="text-xs font-normal text-white/40">pts</span>
          </span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-white/10 text-center">
        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1 text-[#87C7FF]">
          Mortalidad Intrahospitalaria Estimada
        </h4>
        <div className="flex items-start justify-center gap-0.5">
          <span className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-none">
            {mortalidad}
          </span>
          <span className="text-xl font-bold mt-1 text-[#87C7FF]/80">%</span>
        </div>
        <p className="text-[10px] mt-2 text-white/50 max-w-xs mx-auto leading-relaxed">
          Predicción calculada mediante modelos estadísticos basados en la regresión logística estándar del SAPS 3.
        </p>
      </div>
    </>
  );
};
