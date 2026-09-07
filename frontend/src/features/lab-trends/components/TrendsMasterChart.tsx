import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { VisibleChartItem } from '../hooks/useLabTrends';
import { INAAQC_THEME } from '../../../config/theme';

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
  const adobe = INAAQC_THEME.palette;

  return (
    <div
      className="p-6 rounded-2xl shadow-lg border text-white transition-all"
      style={{
        backgroundColor: adobe.base,
        borderColor: `${adobe.darkTint}60`,
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h3 className="text-white font-bold text-lg flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                simStatus === 'playing' ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: simStatus === 'playing' ? adobe.highlight : '#64748B',
              }}
            />
            Monitor Longitudinal Consolidado
          </h3>
          <p className="text-slate-300 text-xs font-medium">
            Correlación temporal de parámetros de laboratorio sanguíneo
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-lg font-mono font-black tracking-tight"
            style={{ color: adobe.highlight }}
          >
            {currentTimeStr}
          </span>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            Hora Simulada
          </p>
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 15, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="timeStr"
              stroke="#94a3b8"
              fontSize={11}
              tickMargin={12}
              axisLine={{ stroke: '#475569' }}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: adobe.base,
                border: `1px solid ${adobe.darkTint}`,
                borderRadius: '10px',
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
              labelStyle={{
                color: '#94a3b8',
                marginBottom: '6px',
                borderBottom: '1px solid #334155',
                paddingBottom: '4px',
              }}
              cursor={{ stroke: adobe.highlight, strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px', fontSize: '12px' }}
            />
            {visibleCharts.map((c, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={c.parametro}
                stroke={c.color}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: adobe.base, stroke: c.color }}
                activeDot={{ r: 7, strokeWidth: 0, fill: c.color }}
                animationDuration={350}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
