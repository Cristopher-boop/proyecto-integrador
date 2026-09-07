import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import type { VisibleChartItem } from '../hooks/useLabTrends';
import { INAAQC_THEME } from '../../../config/theme';

interface TrendsIndividualCardsProps {
  charts: VisibleChartItem[];
}

export const TrendsIndividualCards: React.FC<TrendsIndividualCardsProps> = ({ charts }) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {charts.map((chart, idx) => {
        const lastValue = chart.data.length > 0 ? chart.data[chart.data.length - 1].valor : null;
        const isInRange =
          lastValue !== null && chart.min !== null && chart.max !== null
            ? lastValue >= chart.min && lastValue <= chart.max
            : true;

        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between"
          >
            {/* Cabecera idéntica a ChartCard de INAAQC */}
            <div className="mb-3 flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3
                className="font-bold text-base flex items-center gap-2 tracking-tight"
                style={{ color: adobe.base }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: adobe.highlight }}
                />
                {chart.parametro}
              </h3>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded border bg-slate-50"
                style={{
                  borderColor: '#e2e8f0',
                  color: adobe.darkTint,
                }}
              >
                {chart.unidad}
              </span>
            </div>

            {/* Gráfica de Línea con diseño oficial INAAQC */}
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data} margin={{ top: 5, right: 15, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timeStr"
                    tick={{ fontSize: 11, fill: adobe.midTint }}
                    tickMargin={8}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: adobe.midTint }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      backgroundColor: adobe.base,
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    itemStyle={{ fontWeight: 'bold', color: adobe.highlight }}
                  />

                  {chart.min !== null && chart.max !== null && (
                    <ReferenceArea
                      y1={chart.min}
                      y2={chart.max}
                      fill={adobe.highlight}
                      fillOpacity={0.09}
                    />
                  )}

                  {/* Línea principal en color Navy/Slate base con puntos en Teal Highlight */}
                  <Line
                    type="monotone"
                    dataKey="valor"
                    name={chart.parametro}
                    stroke={adobe.base}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: adobe.highlight, strokeWidth: 2, stroke: adobe.base }}
                    activeDot={{ r: 6, fill: '#FFFFFF', stroke: adobe.highlight }}
                    animationDuration={350}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie de tarjeta con estado clínico del parámetro */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-500">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isInRange ? adobe.highlight : '#F59E0B',
                  }}
                />
                <span>
                  {chart.min !== null && chart.max !== null
                    ? `Rango ref: [${chart.min} - ${chart.max}]`
                    : 'Sin rango de referencia definido'}
                </span>
              </div>
              {lastValue !== null && (
                <span className="font-mono font-bold" style={{ color: adobe.base }}>
                  Último: {lastValue.toFixed(2)} {chart.unidad}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
