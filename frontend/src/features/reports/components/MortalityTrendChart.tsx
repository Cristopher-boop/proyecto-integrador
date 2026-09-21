import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MortalityTrendChartProps {
  data: { mes: string; prediccionSAPS: number; promedioSOFA: number }[];
}

export const MortalityTrendChart: React.FC<MortalityTrendChartProps> = ({ data }) => {

  return (
    <div className="bg-white dark:bg-[#1E3040] p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-[#334759] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1E3040] dark:text-[#87C7FF]" />
          Evolución de Gravedad Estimada (SAPS 3 / SOFA)
        </h3>
      </div>
      <div className="h-[250px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 italic">
            No hay historial de puntajes calculados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={5} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3040', 
                  borderRadius: '12px', 
                  border: '1px solid #334759', 
                  color: '#fff', 
                  fontSize: '11px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }} />
              
              <Bar yAxisId="left" dataKey="prediccionSAPS" name="Riesgo Mortalidad (%)" barSize={24} fill="#4D6173" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="promedioSOFA" name="SOFA Promedio" stroke="#87C7FF" strokeWidth={2.5} dot={{ r: 3.5, fill: '#87C7FF', stroke: '#1E3040', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#ffffff', stroke: '#87C7FF', strokeWidth: 2.5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
