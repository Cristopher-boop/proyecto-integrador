import React, { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

const fullClinicalData = [
  { time: '19/01 12:00', heartRate: 76, spO2: 96 },
  { time: '19/01 13:00', heartRate: 65, spO2: 97 },
  { time: '19/01 14:00', heartRate: 72, spO2: 97 },
  { time: '19/01 18:00', heartRate: 65, spO2: 96 },
  { time: '19/01 20:00', heartRate: 74, spO2: 97 },
  { time: '19/01 22:00', heartRate: 86, spO2: 96 },
  { time: '20/01 00:00', heartRate: 57, spO2: 97 },
  { time: '20/01 02:00', heartRate: 115, spO2: 96 }, // Pico Crítico
  { time: '20/01 04:00', heartRate: 72, spO2: 94 },
  { time: '20/01 06:00', heartRate: 59, spO2: 96 },
  { time: '20/01 08:00', heartRate: 65, spO2: 92 },
  { time: '20/01 09:00', heartRate: 90, spO2: 91 },
];

// Definimos que el gráfico puede emitir una alerta hacia afuera
interface PatientChartProps {
  onCriticalAlert?: (message: string) => void;
}

const PatientChart: React.FC<PatientChartProps> = ({ onCriticalAlert }) => {
  const [dataIndex, setDataIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // El Motor de Animación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && dataIndex < fullClinicalData.length) {
      interval = setInterval(() => {
        const nextPoint = fullClinicalData[dataIndex];

        // Lógica de Detección de Anomalías (Umbral > 100 lpm)
        if (nextPoint.heartRate > 100 && onCriticalAlert) {
           onCriticalAlert(`Taquicardia severa (FC: ${nextPoint.heartRate} lpm) detectada a las ${nextPoint.time.split(' ')[1]}.`);
        }

        // Avanzamos al siguiente punto
        setDataIndex(prev => prev + 1);
      }, 1000); // 1 segundo en la vida real = 1 punto en el gráfico
    } else if (dataIndex >= fullClinicalData.length) {
      setIsPlaying(false); // Detenemos cuando terminan los datos
    }

    return () => clearInterval(interval);
  }, [isPlaying, dataIndex, onCriticalAlert]);

  // Solo mostramos los datos hasta el índice actual
  const displayedData = fullClinicalData.slice(0, dataIndex);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const resetSimulation = () => {
    setIsPlaying(false);
    setDataIndex(0);
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Evolución Longitudinal - Episodio EP-001
        </h3>
        
        {/* Controles del Simulador */}
        <div className="flex gap-2">
          <button 
            onClick={togglePlay}
            disabled={dataIndex >= fullClinicalData.length}
            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-bold transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isPlaying ? 'Pausar' : 'Simular Ingreso de Datos'}
          </button>
          <button 
            onClick={resetSimulation}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            
            {/* Forzamos el dominio X para que el gráfico no se encoja al iniciar */}
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} type="category" allowDuplicatedCategory={false} />
            <YAxis yAxisId="left" domain={[40, 140]} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis yAxisId="right" orientation="right" domain={[85, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
            
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <ReferenceArea yAxisId="left" y1={100} y2={140} fill="#fee2e2" fillOpacity={0.4} />

            <Line 
              isAnimationActive={false} // Apagamos la animación por defecto de recharts porque nosotros controlamos el render
              yAxisId="left" type="monotone" dataKey="heartRate" name="Frecuencia Cardíaca (lpm)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} 
            />
            <Line 
              isAnimationActive={false}
              yAxisId="right" type="monotone" dataKey="spO2" name="Saturación O2 (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientChart;