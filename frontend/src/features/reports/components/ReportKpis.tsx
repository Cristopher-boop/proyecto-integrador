import React from 'react';
import { BrainCircuit, ShieldAlert, Activity } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';

interface ReportKpisProps {
  precisionIa: number;
  mortalidadPromedio: number;
  sofaPromedio: number;
}

export const ReportKpis: React.FC<ReportKpisProps> = ({
  precisionIa,
  mortalidadPromedio,
  sofaPromedio,
}) => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 rounded-lg" style={{ backgroundColor: adobe.lightTint + '30' }}>
          <BrainCircuit className="w-6 h-6" style={{ color: adobe.base }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>Precisión Algorítmica (IA)</p>
          <p className="text-2xl font-black" style={{ color: adobe.base }}>{precisionIa}%</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 rounded-lg" style={{ backgroundColor: statusColors.alert.bg }}>
          <ShieldAlert className="w-6 h-6" style={{ color: statusColors.alert.text }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>Mortalidad Est. Promedio</p>
          <p className="text-2xl font-black" style={{ color: adobe.base }}>{mortalidadPromedio}%</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 rounded-lg" style={{ backgroundColor: statusColors.success.bg }}>
          <Activity className="w-6 h-6" style={{ color: statusColors.success.text }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>SOFA Promedio Global</p>
          <p className="text-2xl font-black" style={{ color: adobe.base }}>{sofaPromedio} pts</p>
        </div>
      </div>
    </div>
  );
};
