import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { INAAQC_THEME } from '../../../config/theme';

interface SofaRadarProps {
  data: { organo: string; valorPromedio: number; fullMark: number }[];
}

export const SofaRadar: React.FC<SofaRadarProps> = ({ data }) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: adobe.darkTint }}>
          Mapa Global de Disfunción (Promedios SOFA)
        </h3>
      </div>
      <div className="flex-1 w-full min-h-[350px]">
        {data.every(d => d.valorPromedio === 0) ? (
          <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">
            No hay suficientes puntajes SOFA guardados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="organo" tick={{ fill: adobe.darkTint, fontSize: 11, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 4]} stroke={adobe.midTint} fontSize={10} />
              <Radar name="Fallo Orgánico Promedio" dataKey="valorPromedio" stroke={adobe.highlight} fill={adobe.lightTint} fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
