import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { INAAQC_THEME } from '../../../config/theme';

interface MortalityTrendChartProps {
  data: { mes: string; prediccionSAPS: number; promedioSOFA: number }[];
}

export const MortalityTrendChart: React.FC<MortalityTrendChartProps> = ({ data }) => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: adobe.darkTint }}>
          Evolución de Gravedad Estimada (SAPS 3 / SOFA)
        </h3>
      </div>
      <div className="flex-1 min-h-[350px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">
            No hay historial de puntajes calculados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
              
              <Bar yAxisId="left" dataKey="prediccionSAPS" name="Riesgo Mortalidad (%)" barSize={30} fill={adobe.base} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="promedioSOFA" name="SOFA Promedio" stroke={statusColors.warning.text} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
