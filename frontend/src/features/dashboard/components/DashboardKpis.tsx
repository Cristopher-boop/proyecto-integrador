import React from 'react';
import { Users, HeartPulse, FileText, BrainCircuit } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import type { DashboardKpisData } from '../types/dashboard.types';

interface DashboardKpisProps {
  kpis: DashboardKpisData;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ kpis }) => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const cards = [
    {
      title: 'Pacientes Activos',
      value: kpis.pacientes,
      icon: Users,
      iconColor: adobe.base,
      bgColor: `${adobe.lightTint}30`,
    },
    {
      title: 'Episodios UCI',
      value: kpis.episodios,
      icon: HeartPulse,
      iconColor: statusColors.alert.text,
      bgColor: statusColors.alert.bg,
    },
    {
      title: 'Archivos Procesados',
      value: kpis.archivos,
      icon: FileText,
      iconColor: adobe.darkTint,
      bgColor: `${adobe.lightTint}50`,
    },
    {
      title: 'Inferencias IA',
      value: kpis.inferencias,
      icon: BrainCircuit,
      iconColor: '#FFFFFF',
      bgColor: adobe.base,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className="p-3.5 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: stat.bgColor }}
          >
            <stat.icon
              className="w-5 h-5"
              style={{ color: stat.iconColor }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="text-[11px] font-bold uppercase tracking-wider truncate"
              style={{ color: adobe.midTint }}
            >
              {stat.title}
            </p>
            <p
              className="text-2xl font-black mt-0.5"
              style={{ color: adobe.base }}
            >
              {stat.value.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
