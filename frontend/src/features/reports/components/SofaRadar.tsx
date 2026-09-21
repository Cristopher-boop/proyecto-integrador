import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

interface SofaRadarProps {
  data: { organo: string; valorPromedio: number; fullMark: number }[];
}

export const SofaRadar: React.FC<SofaRadarProps> = ({ data }) => {

  return (
    <div className="bg-white dark:bg-[#1E3040] p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-100 dark:border-[#334759] flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1E3040] dark:text-[#87C7FF]" />
          Mapa Global de Disfunción (Promedios SOFA)
        </h3>
      </div>
      <div className="h-[250px] w-full">
        {data.every(d => d.valorPromedio === 0) ? (
          <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 italic">
            No hay suficientes puntajes SOFA guardados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
              <PolarGrid stroke="#94a3b8" strokeOpacity={0.25} />
              <PolarAngleAxis dataKey="organo" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 4]} stroke="#94a3b8" fontSize={9} />
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
              <Radar name="Fallo Orgánico Promedio" dataKey="valorPromedio" stroke="#87C7FF" strokeWidth={2} fill="#87C7FF" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
