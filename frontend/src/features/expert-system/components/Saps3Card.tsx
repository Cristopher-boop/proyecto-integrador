import React from 'react';
import { INAAQC_THEME } from '../../../config/theme';

interface Saps3CardProps {
  saps3: number;
  mortalidad: number;
}

export const Saps3Card: React.FC<Saps3CardProps> = ({ saps3, mortalidad }) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <>
      <div className="p-4 rounded-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.lightTint }}>
            Puntaje de Severidad SAPS 3
          </span>
          <span className="text-2xl font-black text-white">
            {saps3} <span className="text-sm font-normal text-white/40">pts</span>
          </span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 text-center">
        <h4 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: adobe.highlight }}>
          Mortalidad Intrahospitalaria Estimada
        </h4>
        <div className="flex items-start justify-center gap-0.5">
          <span className="text-6xl font-black tracking-tighter text-white">
            {mortalidad}
          </span>
          <span className="text-2xl font-bold mt-2" style={{ color: adobe.lightTint }}>%</span>
        </div>
        <p className="text-[10px] mt-2 text-white/40 max-w-xs mx-auto leading-relaxed">
          Predicción calculada mediante modelos estadísticos basados en la regresión logística estándar del SAPS 3.
        </p>
      </div>
    </>
  );
};
