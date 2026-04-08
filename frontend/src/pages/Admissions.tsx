import React, { useState } from 'react';
import { Activity, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import useSound from 'use-sound';
import PatientChart from '../components/ui/PatientChart';
import alarmSfx from '../assets/alerta-usi.mp3';

const Admissions: React.FC = () => {
  const [criticalAlert, setCriticalAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [playAlarm] = useSound(alarmSfx, { 
    volume: 0.8,
    interrupt: false 
  });

  // Esta función es llamada POR EL GRÁFICO cuando la línea roja cruza el umbral
  const handleCriticalEvent = (message: string) => {
    // Si la alerta no estaba activa ya, la disparamos
    if (!criticalAlert) {
      setCriticalAlert(true);
      setAlertMessage(message);
      
      playAlarm();
      setTimeout(playAlarm, 1000);
      setTimeout(playAlarm, 2000);
    }
  };

  const acknowledgeAlert = () => {
    setCriticalAlert(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Panel Superior */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Episodio Activo</span>
              <h2 className="text-2xl font-bold text-slate-800">EP-001</h2>
            </div>
            <p className="text-slate-600 font-medium text-lg">VELLEMANS, HILDE JOSEPHINE</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-medium">Ingreso: 19 Ene 2026 - 12:00</p>
            <div className="flex items-center justify-end gap-2 mt-1 text-emerald-600 font-bold text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Monitorización Continua
            </div>
          </div>
        </div>

        {/* Panel de Alerta Dinámica */}
        {criticalAlert ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center animate-pulse shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-bold">¡ALERTA CRÍTICA DETECTADA!</h3>
                <p className="text-red-600 text-sm">{alertMessage}</p>
              </div>
            </div>
            <button onClick={acknowledgeAlert} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
              Reconocer Alarma
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex justify-between items-center">
             <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
              <p className="text-slate-600 text-sm font-medium">Parámetros dentro de umbrales tolerables. Esperando datos del monitor...</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* PASAMOS LA FUNCIÓN COMO PROP AL GRÁFICO */}
          <PatientChart onCriticalAlert={handleCriticalEvent} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Notas Clínicas</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            <div className="relative pl-6 border-l-2 border-blue-200 pb-4">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 shadow-[0_0_0_4px_white]"></div>
              <p className="text-xs text-slate-400 font-bold mb-1">20 Ene 2026 - 09:00</p>
              <p className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Nota de Evolución (NE)</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">P/ Statines Asa+Brilique. ETT faite aux urgences. Sortie jeudi si ok.</p>
            </div>
            <div className="relative pl-6 border-l-2 border-slate-200">
              <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[7px] top-1 shadow-[0_0_0_4px_white]"></div>
              <p className="text-xs text-slate-400 font-bold mb-1">19 Ene 2026 - 12:30</p>
              <p className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Intervención (PPCI)</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">Mise en place d'un DES Ultimaster 3.5/28 sur CD2-3.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;