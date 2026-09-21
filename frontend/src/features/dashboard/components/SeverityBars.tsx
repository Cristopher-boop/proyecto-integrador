import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { INAAQC_THEME } from '../../../config/theme';
import { useTheme } from '../../../context';
import type { SeverityItem } from '../types/dashboard.types';

interface SeverityBarsProps {
  data: SeverityItem[];
}

export const SeverityBars: React.FC<SeverityBarsProps> = ({ data }) => {
  const { isDark } = useTheme();
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;
  const totalCount = data.reduce((acc, curr) => acc + curr.Pacientes, 0);

  const getBarColor = (index: number) => {
    if (index === 2) return statusColors.alert.text;
    if (index === 1) return adobe.highlight;
    return isDark ? '#87C7FF' : adobe.base;
  };

  return (
    <div className="bg-white dark:bg-[#1E3040] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#334759] flex flex-col h-full transition-colors duration-200">
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#334759] dark:text-slate-200">
          Estratificación de Gravedad (SOFA Global)
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Niveles de afección multiorgánica</p>
      </div>

      <div className="flex-1 min-h-[280px]">
        {totalCount === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-400 italic">
            No hay pacientes con SOFA calculado aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334759' : '#F1F5F9'} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: isDark ? '#9EBDD9' : adobe.midTint, fontWeight: 600 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: isDark ? '#9EBDD9' : adobe.midTint, fontWeight: 600 }}
              />
              <Tooltip
                cursor={{ fill: `${adobe.lightTint}20` }}
                contentStyle={{
                  backgroundColor: isDark ? '#1E3040' : '#FFFFFF',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #334759' : '1px solid #E2E8F0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  fontSize: '12px',
                  color: isDark ? '#F1F5F9' : '#1E3040',
                }}
              />
              <Bar dataKey="Pacientes" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
