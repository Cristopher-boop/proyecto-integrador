import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { INAAQC_THEME } from '../../../config/theme';
import { useTheme } from '../../../context';
import type { DocTypeItem } from '../types/dashboard.types';

interface DocTypesDonutProps {
  data: DocTypeItem[];
}

export const DocTypesDonut: React.FC<DocTypesDonutProps> = ({ data }) => {
  const { isDark } = useTheme();
  const PIE_COLORS = [
    INAAQC_THEME.scale[900],
    INAAQC_THEME.scale[700],
    INAAQC_THEME.scale[500],
    INAAQC_THEME.scale[300],
    INAAQC_THEME.scale[100]
  ];
  const totalCount = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-[#1E3040] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#334759] flex flex-col h-full transition-colors duration-200">
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#334759] dark:text-slate-200">
          Distribución de Ingesta Documental
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Clasificación por tipo de archivo auditado</p>
      </div>

      <div className="flex-1 min-h-[280px]">
        {totalCount === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-400 italic">
            No hay documentos procesados aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1E3040' : '#FFFFFF',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #334759' : '1px solid #E2E8F0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  fontSize: '12px',
                  color: isDark ? '#F1F5F9' : '#1E3040',
                }}
                itemStyle={{ fontWeight: 'bold', color: isDark ? '#F1F5F9' : '#1E3040' }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: isDark ? '#9EBDD9' : '#334759' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
