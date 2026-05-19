import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { INAAQC_THEME } from '../../config/theme';

interface ChartCardProps {
  title: string;
  unit: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  statusText?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, unit, data, dataKey, xAxisKey, statusText }) => {
  const adobe = INAAQC_THEME.palette;
  
  return (
    <div className="p-6 rounded-2xl border bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: adobe.base }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: adobe.highlight }} />
          {title}
        </h3>
        <span className="text-xs font-bold px-2 py-1 rounded border bg-white" style={{ color: adobe.darkTint, borderColor: '#e2e8f0' }}>
          {unit}
        </span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 11, fill: adobe.midTint }} axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: adobe.midTint }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: adobe.base, color: '#fff' }} 
              itemStyle={{ fontWeight: 'bold', color: adobe.highlight }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={adobe.base} 
              strokeWidth={3} 
              dot={{ r: 4, fill: adobe.highlight, strokeWidth: 2, stroke: adobe.base }} 
              activeDot={{ r: 6, fill: '#fff', stroke: adobe.highlight }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {statusText && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium" style={{ color: adobe.midTint }}>
          <CheckCircle2 className="w-4 h-4" style={{ color: INAAQC_THEME.status.success.text }} /> {statusText}
        </div>
      )}
    </div>
  );
};