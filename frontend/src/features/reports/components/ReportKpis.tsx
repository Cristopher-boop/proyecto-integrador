import React from 'react';
import { BrainCircuit, ShieldAlert, Activity } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-[#1E3040] p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-[#334759] shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all">
        <div className="p-2.5 rounded-xl bg-[#9EBDD9]/30 text-[#1E3040] dark:bg-[#87C7FF]/20 dark:text-[#87C7FF] shrink-0">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
            Precisión Algorítmica (IA)
          </p>
          <p className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 text-slate-800 dark:text-white">
            {precisionIa}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E3040] p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-[#334759] shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all">
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
            Mortalidad Est. Promedio
          </p>
          <p className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 text-slate-800 dark:text-white">
            {mortalidadPromedio}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E3040] p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-[#334759] shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-[#15232F] dark:text-slate-300 shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
            SOFA Promedio Global
          </p>
          <p className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 text-slate-800 dark:text-white">
            {sofaPromedio} <span className="text-xs font-semibold text-slate-400">pts</span>
          </p>
        </div>
      </div>
    </div>
  );
};
