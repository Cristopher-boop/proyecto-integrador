import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import type { VisibleChartItem } from '../hooks/useLabTrends';

interface TrendsIndividualCardsProps {
  charts: VisibleChartItem[];
}

export const TrendsIndividualCards: React.FC<TrendsIndividualCardsProps> = ({ charts }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {charts.map((chart, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-4 flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chart.color }} />
              {chart.parametro}
            </h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
              {chart.unidad}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeStr" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                
                {chart.min !== null && chart.max !== null && (
                  <ReferenceArea y1={chart.min} y2={chart.max} fill="#10b981" fillOpacity={0.1} />
                )}

                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  name="Valor" 
                  stroke={chart.color} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: chart.color, strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={500} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};
