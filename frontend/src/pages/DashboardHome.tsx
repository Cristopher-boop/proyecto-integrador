import React from 'react';
import { Activity, FileText, Users } from 'lucide-react';

const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <Users className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pacientes Activos</p>
            <p className="text-2xl font-bold text-slate-800">142</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Archivos Procesados</p>
            <p className="text-2xl font-bold text-slate-800">854</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-lg">
            <Activity className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Estado del Motor</p>
            <p className="text-2xl font-bold text-emerald-600">Óptimo</p>
          </div>
        </div>

      </div>

      {/* Espacio para futuros gráficos o tablas */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex justify-center items-center">
         <div className="text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">Sistema Listo</h3>
            <p className="text-sm text-slate-400 mt-1">Selecciona una opción del menú lateral para comenzar.</p>
         </div>
      </div>

    </div>
  );
};

export default DashboardHome;