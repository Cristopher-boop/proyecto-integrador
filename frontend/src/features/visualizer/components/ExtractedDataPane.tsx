import React, { useState } from 'react';
import { Loader2, Save, Edit3 } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';

interface Observacion {
  id_observacion: string;
  parametro: string;
  valor_numerico: string;
  unidad_medida: string | null;
  rango_referencia_min: string | null;
  rango_referencia_max: string | null;
  fecha_hora_registro: string;
}

interface ExtractedDataPaneProps {
  datos: Observacion[];
  isLoading: boolean;
  activeParam: string | null;
  onParamClick: (paramName: string) => void;
  onUpdateValue: (id: string, nuevoValor: string) => void;
}

// ARREGLO DE ORDEN MULTI-IDIOMA (Soporta Francés e Inglés de CyberLab)
const CLINICAL_ORDER = [
  ['bilirrubina total', 'bilirubine totale', 'total bilirubin'],
  ['calcio', 'calcium', 'ca'],
  ['creatinina', 'créatinine', 'creatinine'],
  ['globulos blancos', 'leucocytes', 'wbc', 'globules blancs', 'blancs globules', 'leucocitos'],
  ['hematocrito', 'hématocrite', 'hct'],
  ['inr'],
  ['lactato', 'lactate'],
  ['pco2'],
  ['ph'],
  ['plaquetas', 'plaquettes', 'platelets', 'plt'],
  ['po2'],
  ['potasio', 'potassium', 'k'],
  ['sodio', 'sodium', 'na'],
  ['urea', 'urée', 'bun']
];

export const ExtractedDataPane: React.FC<ExtractedDataPaneProps> = ({ datos, isLoading, activeParam, onParamClick, onUpdateValue }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const adobe = INAAQC_THEME.palette;

  // Lógica de Agrupación y Ordenamiento
  const groupedData = React.useMemo(() => {
    // 1. Ordenamos todo el bloque
    const sorted = [...datos].sort((a, b) => {
      const pA = a.parametro.toLowerCase();
      const pB = b.parametro.toLowerCase();
      
      let indexA = CLINICAL_ORDER.findIndex(aliases => aliases.some(alias => pA.includes(alias)));
      let indexB = CLINICAL_ORDER.findIndex(aliases => aliases.some(alias => pB.includes(alias)));
      
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      
      if (indexA !== indexB) return indexA - indexB;
      if (indexA === 999 && indexB === 999 && pA !== pB) return pA.localeCompare(pB);
      
      // Mismo parámetro: más reciente primero
      return new Date(b.fecha_hora_registro).getTime() - new Date(a.fecha_hora_registro).getTime();
    });

    // 2. Agrupamos por parámetro
    return sorted.reduce((acc, obs) => {
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.parametro === obs.parametro) {
        lastGroup.items.push(obs);
      } else {
        acc.push({ parametro: obs.parametro, items: [obs] });
      }
      return acc;
    }, [] as { parametro: string, items: Observacion[] }[]);
  }, [datos]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: adobe.highlight }} />
        <p className="text-sm font-bold" style={{ color: adobe.darkTint }}>Sincronizando Hechos Biomédicos...</p>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-500">No se detectaron parámetros estructurados en este documento.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="bg-slate-50 p-4 border-b shrink-0 shadow-sm z-10" style={{ borderColor: adobe.lightTint }}>
        <h3 className="font-black text-sm uppercase tracking-widest" style={{ color: adobe.base }}>
          Datos Extraídos ({datos.length})
        </h3>
        <p className="text-[10px] text-slate-500 mt-1 uppercase">Clic en un parámetro para iluminarlo en el documento</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50/50">
        {groupedData.map((group, gIdx) => (
          <div key={`group-${gIdx}`} className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: adobe.lightTint }}>
            {/* Cabecera del Parámetro */}
            <div className="px-4 py-2 border-b flex justify-between items-center" style={{ backgroundColor: adobe.base, borderColor: adobe.base }}>
              <span className="font-bold text-sm text-white">{group.parametro}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white">
                {group.items.length} {group.items.length === 1 ? 'REG' : 'REGS'}
              </span>
            </div>

            {/* Lista de Registros */}
            <div className="divide-y" style={{ borderColor: adobe.lightTint }}>
              {group.items.map((obs) => {
                const isActive = activeParam === obs.parametro;
                const isEditing = editingId === obs.id_observacion;

                return (
                  <div 
                    key={obs.id_observacion}
                    onClick={() => !isEditing && onParamClick(obs.parametro)}
                    className={`p-3 flex items-center justify-between transition-colors cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: adobe.darkTint }}>
                        {new Date(obs.fecha_hora_registro).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {obs.rango_referencia_min && obs.rango_referencia_max ? `[${obs.rango_referencia_min} - ${obs.rango_referencia_max}]` : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <input 
                            type="number" step="0.01" value={editValue} onChange={e => setEditValue(e.target.value)}
                            className="w-20 text-right text-sm font-bold p-1 border rounded"
                            autoFocus
                          />
                          <button onClick={() => { onUpdateValue(obs.id_observacion, editValue); setEditingId(null); }} className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100">
                            <Save size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-base font-black ${isActive ? 'text-blue-700' : ''}`} style={{ color: isActive ? '' : adobe.base }}>
                            {parseFloat(obs.valor_numerico).toFixed(2)}
                          </span>
                          <span className="text-xs font-bold" style={{ color: adobe.midTint }}>{obs.unidad_medida || ''}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingId(obs.id_observacion); setEditValue(obs.valor_numerico); }} 
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};