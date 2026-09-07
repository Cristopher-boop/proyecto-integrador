import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { VisibleChartItem } from '../hooks/useLabTrends';

interface TrendsMasterChartProps {
  data: Record<string, string | number>[];
  visibleCharts: VisibleChartItem[];
  simStatus: 'idle' | 'playing' | 'paused' | 'finished';
  currentTimeStr: string;
}

export const TrendsMasterChart: React.FC<TrendsMasterChartProps> = ({
  data,
  visibleCharts,
  simStatus,
  currentTimeStr,
}) => {
  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h3 className="text-white font-bold text-xl flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${simStatus === 'playing' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
            Monitor Longitudinal Consolidado
          </h3>
          <p className="text-slate-400 text-xs font-medium">Correlación temporal de parámetros de laboratorio</p>
        </div>
        <div className="text-right">
          <span className="text-indigo-400 text-lg font-mono font-black">
            {currentTimeStr}
          </span>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hora Simulada</p>
        </div>
      </div>

      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 30, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="timeStr" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickMargin={15}
              axisLine={{ stroke: '#475569' }}
              interval="preserveStartEnd" 
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 'bold', padding: '2px 0' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
              cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '40px' }}
            />
            {visibleCharts.map((c, i) => (
              <Line 
                key={i} 
                type="monotone" 
                dataKey={c.parametro} 
                stroke={c.color} 
                strokeWidth={4} 
                dot={{ r: 5, strokeWidth: 2, fill: '#1e293b', stroke: c.color }} 
                activeDot={{ r: 8, strokeWidth: 0, fill: c.color }} 
                animationDuration={400} 
                connectNulls 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
