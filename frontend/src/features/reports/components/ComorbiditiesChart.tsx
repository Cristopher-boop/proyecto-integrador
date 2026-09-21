import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Layers } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';

interface ComorbiditiesChartProps {
  data: { nombre: string; pacientes: number }[];
}

export const ComorbiditiesChart: React.FC<ComorbiditiesChartProps> = ({ data }) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1E3040]" />
          Distribución de Comorbilidades Detectadas
        </h3>
      </div>
      <div className="h-[200px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 italic">
            No hay comorbilidades registradas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: adobe.base, fontWeight: 600 }} width={160} />
              <Tooltip 
                cursor={{ fill: 'rgba(30, 48, 64, 0.05)' }} 
                contentStyle={{ 
                  backgroundColor: '#1E3040', 
                  borderRadius: '12px', 
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '11px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' 
                }} 
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="pacientes" name="Nº Pacientes" fill={adobe.base} radius={[0, 4, 4, 0]} barSize={18}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? adobe.darkTint : adobe.base} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
