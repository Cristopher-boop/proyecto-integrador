import React from 'react';
import { CheckCircle2, FileText, Syringe, Activity } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import type { DiagnosticoItem, ComorbilidadItem, SoporteItem } from '../../../types';

interface EntityBadgesProps {
  diagnosticos: DiagnosticoItem[];
  comorbilidades: ComorbilidadItem[];
  soportes: SoporteItem[];
}

export const EntityBadges: React.FC<EntityBadgesProps> = ({
  diagnosticos,
  comorbilidades,
  soportes,
}) => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  return (
    <>
      {/* COLUMNA 1: BASE DE HECHOS NLP */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2" style={{ backgroundColor: '#f8fafc' }}>
          <FileText size={18} style={{ color: adobe.darkTint }} />
          <h3 className="font-bold" style={{ color: adobe.base }}>Base de Hechos (NLP)</h3>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Diagnósticos */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: adobe.midTint }}>
              Diagnósticos Principales / Secundarios
            </h4>
            {diagnosticos.length === 0 ? (
              <p className="text-xs italic text-slate-400">No se detectaron diagnósticos en el texto.</p>
            ) : (
              <ul className="space-y-2">
                {diagnosticos.map((dx, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-semibold p-2 rounded-lg" style={{ backgroundColor: adobe.lightTint + '20', color: adobe.darkTint }}>
                    <CheckCircle2 size={16} style={{ color: adobe.highlight }} />
                    {dx.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Comorbilidades */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: adobe.midTint }}>
              Antecedentes Personales (Comorbilidades)
            </h4>
            {comorbilidades.length === 0 ? (
              <p className="text-xs italic text-slate-400">Ninguna comorbilidad registrada en este episodio.</p>
            ) : (
              <ul className="space-y-2">
                {comorbilidades.map((com, idx) => (
                  <li key={idx} className="flex flex-col p-3 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden bg-white">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: adobe.highlight }} />
                    <span className="font-bold text-sm" style={{ color: adobe.base }}>{com.nombre}</span>
                    {com.categoria && (
                      <span className="text-xs font-medium mt-0.5" style={{ color: adobe.midTint }}>{com.categoria}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* COLUMNA 2: SOPORTES UCI */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2" style={{ backgroundColor: '#f8fafc' }}>
          <Syringe size={18} style={{ color: adobe.darkTint }} />
          <h3 className="font-bold" style={{ color: adobe.base }}>Intervenciones Extraídas</h3>
        </div>
        
        <div className="p-5 flex-1 flex flex-col gap-6">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: adobe.midTint }}>
              Soportes Orgánicos Activos
            </h4>
            {soportes.length === 0 ? (
              <p className="text-xs italic text-slate-400">No se detectó uso de soportes invasivos.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {soportes.map((sop, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-md text-xs font-bold border" 
                        style={{ backgroundColor: statusColors.success.bg, color: statusColors.success.text, borderColor: statusColors.success.border }}>
                    {sop.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center" style={{ borderColor: adobe.lightTint, backgroundColor: adobe.lightTint + '10' }}>
             <Activity size={32} style={{ color: adobe.midTint }} className="mb-2 opacity-50" />
             <p className="text-sm font-semibold" style={{ color: adobe.darkTint }}>Sincronización Fisiológica</p>
             <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: adobe.midTint }}>
               Los peores laboratorios de las primeras 24h cruzados automáticamente con los soportes para calcular los scores médicos.
             </p>
          </div>
        </div>
      </div>
    </>
  );
};
