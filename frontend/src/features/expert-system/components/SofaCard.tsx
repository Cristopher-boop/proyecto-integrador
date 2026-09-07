import React from 'react';
import { INAAQC_THEME } from '../../../config/theme';

interface SofaCardProps {
  sofa: number;
}

export const SofaCard: React.FC<SofaCardProps> = ({ sofa }) => {
  const statusColors = INAAQC_THEME.status;

  const percentage = Math.min(((sofa || 0) / 24) * 100, 100);
  const barColor = sofa > 9 ? statusColors.warning.text : '#00A896';

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
          SOFA Score Total
        </span>
        <span className="text-2xl sm:text-3xl font-black text-white leading-none">
          {sofa} <span className="text-xs font-normal text-white/40">/24</span>
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mt-2.5 bg-white/10">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: barColor 
          }}
        />
      </div>
    </div>
  );
};
