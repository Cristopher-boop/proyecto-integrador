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
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col h-full min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70 shrink-0">
          <FileText size={16} style={{ color: adobe.highlight }} />
          <h3 className="font-bold text-sm" style={{ color: adobe.base }}>
            Base de Hechos (NLP)
          </h3>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar min-h-0">
          {/* Diagnósticos */}
          <div>
            <h4
              className="text-xs font-black uppercase tracking-wider mb-2.5"
              style={{ color: adobe.midTint }}
            >
              Diagnósticos Detectados
            </h4>
            {diagnosticos.length === 0 ? (
              <p className="text-xs italic text-slate-400">No se detectaron diagnósticos en el texto.</p>
            ) : (
              <ul className="space-y-1.5">
                {diagnosticos.map((dx, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border border-slate-100 bg-slate-50/60"
                    style={{ color: adobe.base }}
                  >
                    <CheckCircle2 size={15} style={{ color: adobe.highlight }} className="shrink-0" />
                    <span>{dx.nombre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Comorbilidades */}
          <div>
            <h4
              className="text-xs font-black uppercase tracking-wider mb-2.5"
              style={{ color: adobe.midTint }}
            >
              Comorbilidades Clínicas
            </h4>
            {comorbilidades.length === 0 ? (
              <p className="text-xs italic text-slate-400">Ninguna comorbilidad registrada en este episodio.</p>
            ) : (
              <ul className="space-y-2">
                {comorbilidades.map((com, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col p-2.5 rounded-xl border border-slate-100 shadow-xs relative overflow-hidden bg-white"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: adobe.highlight }}
                    />
                    <span className="font-bold text-xs pl-1.5" style={{ color: adobe.base }}>
                      {com.nombre}
                    </span>
                    {com.categoria && (
                      <span className="text-[11px] font-medium pl-1.5 mt-0.5 text-slate-400">
                        {com.categoria}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* COLUMNA 2: SOPORTES UCI */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col h-full min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/70 shrink-0">
          <Syringe size={16} style={{ color: adobe.highlight }} />
          <h3 className="font-bold text-sm" style={{ color: adobe.base }}>
            Intervenciones Extraídas
          </h3>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4 justify-between overflow-y-auto custom-scrollbar min-h-0">
          <div>
            <h4
              className="text-xs font-black uppercase tracking-wider mb-2.5"
              style={{ color: adobe.midTint }}
            >
              Soportes Orgánicos Activos
            </h4>
            {soportes.length === 0 ? (
              <p className="text-xs italic text-slate-400">No se detectó uso de soportes invasivos.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {soportes.map((sop, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                    style={{
                      backgroundColor: statusColors.success.bg,
                      color: statusColors.success.text,
                      borderColor: statusColors.success.border,
                    }}
                  >
                    {sop.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border border-dashed flex flex-col items-center justify-center p-3.5 text-center bg-slate-50/80"
            style={{ borderColor: `${adobe.lightTint}60` }}
          >
            <Activity size={22} style={{ color: adobe.highlight }} className="mb-1 opacity-80" />
            <p className="text-xs font-bold" style={{ color: adobe.base }}>
              Sincronización Determinista
            </p>
            <p className="text-[11px] mt-0.5 text-slate-500 max-w-xs mx-auto">
              Cálculo SOFA y SAPS 3 consolidado a partir de los datos analíticos del episodio.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
