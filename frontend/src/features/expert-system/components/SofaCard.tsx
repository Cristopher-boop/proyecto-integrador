import React from 'react';
import { INAAQC_THEME } from '../../../config/theme';

interface SofaCardProps {
  sofa: number;
}

export const SofaCard: React.FC<SofaCardProps> = ({ sofa }) => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const percentage = Math.min(((sofa || 0) / 24) * 100, 100);
  const barColor = sofa > 9 ? statusColors.warning.text : statusColors.success.text;

  return (
    <div className="p-4 rounded-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.lightTint }}>
          SOFA Score Total
        </span>
        <span className="text-3xl font-black text-white leading-none">
          {sofa} <span className="text-sm font-normal text-white/40">/24</span>
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
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
