import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';

interface SofaRadarProps {
  data: { organo: string; valorPromedio: number; fullMark: number }[];
}

export const SofaRadar: React.FC<SofaRadarProps> = ({ data }) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1E3040]" />
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
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="organo" tick={{ fill: adobe.base, fontSize: 10, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 4]} stroke="#94a3b8" fontSize={9} />
              <Tooltip 
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
              <Radar name="Fallo Orgánico Promedio" dataKey="valorPromedio" stroke="#00A896" strokeWidth={2} fill="#00A896" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
