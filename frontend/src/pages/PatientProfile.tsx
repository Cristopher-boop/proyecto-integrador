import React from 'react';
import { User, Calendar, Activity, AlertTriangle } from 'lucide-react';
import PatientChart from '../components/ui/PatientChart';

const PatientProfile: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Banner del Paciente */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <User className="w-10 h-10 text-blue-700" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">VELLEMANS, HILDE JOSEPHINE</h2>
              <p className="text-slate-500 font-medium">ID: 631228FVAA02 | Femenino, 62 años</p>
            </div>
            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-red-200">
              <AlertTriangle className="w-4 h-4" />
              Alerta Activa: Taquicardia
            </div>
          </div>
          
          <div className="mt-4 flex gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Admisión: 19 Ene 2026
            </span>
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Motivo: STEMI Inferior
            </span>
          </div>
        </div>
      </div>

      {/* Aquí inyectamos el Gráfico de Recharts */}
      <PatientChart />

    </div>
  );
};

export default PatientProfile;