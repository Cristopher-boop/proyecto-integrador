import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { INAAQC_THEME } from '../../../config/theme';

interface ComorbiditiesChartProps {
  data: { nombre: string; pacientes: number }[];
}

export const ComorbiditiesChart: React.FC<ComorbiditiesChartProps> = ({ data }) => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: adobe.darkTint }}>
          Distribución de Comorbilidades Detectadas
        </h3>
      </div>
      <div className="flex-1 min-h-[300px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">
            No hay comorbilidades registradas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
              <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.base, fontWeight: 600 }} width={180} />
              <Tooltip cursor={{ fill: adobe.lightTint + '20' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="pacientes" name="Nº Pacientes" fill={adobe.base} radius={[0, 4, 4, 0]} barSize={30}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? statusColors.alert.text : adobe.base} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
