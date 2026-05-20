import React from 'react';
import { INAAQC_THEME } from '../../../config/theme';
import { Loader2 } from 'lucide-react';

interface ExtractedDataPaneProps {
  datos: any[];
  isLoading: boolean;
  activeParam: string | null;
  onParamClick: (parametro: string, coords: any) => void;
  onUpdateValue: (id: string, val: string) => void;
}

export const ExtractedDataPane: React.FC<ExtractedDataPaneProps> = ({ datos, isLoading, activeParam, onParamClick, onUpdateValue }) => {
  const adobe = INAAQC_THEME.palette;

  if (isLoading) return <div className="flex-1 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: adobe.highlight }} /></div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ backgroundColor: '#ffffff' }}>
      <div className="mb-4 pb-2 border-b" style={{ borderColor: adobe.lightTint }}>
        <h3 className="font-black uppercase tracking-wide text-sm" style={{ color: adobe.base }}>Parámetros Detectados</h3>
        <p className="text-xs mt-1" style={{ color: adobe.darkTint }}>Verifica y corrige si el OCR falló.</p>
      </div>

      {datos.map((dato, idx) => {
        const isActive = activeParam === dato.parametro;
        
        return (
          <div 
            key={idx} 
            onClick={() => onParamClick(dato.parametro, dato.coordenadas_zoom)}
            className="p-3 rounded-lg border-2 cursor-pointer transition-all"
            style={{ 
              borderColor: isActive ? adobe.highlight : adobe.lightTint,
              backgroundColor: isActive ? adobe.lightTint : '#ffffff',
              boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm" style={{ color: adobe.base }}>{dato.parametro}</span>
              <span className="text-xs font-medium" style={{ color: adobe.darkTint }}>
                {dato.fecha_hora_registro ? new Date(dato.fecha_hora_registro).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <input 
                type="text" 
                defaultValue={dato.valor_numerico} 
                onBlur={(e) => {
                  if(e.target.value !== String(dato.valor_numerico)) onUpdateValue(dato.id_observacion, e.target.value);
                }}
                className="font-black text-xl bg-transparent w-24 outline-none border-b-2" 
                style={{ color: adobe.highlight, borderColor: adobe.midTint }}
                onFocus={(e) => e.target.style.borderColor = adobe.highlight}
                onBlurCapture={(e) => e.target.style.borderColor = adobe.midTint}
              />
              <span className="text-sm font-bold pb-1" style={{ color: adobe.darkTint }}>{dato.unidad_medida || 'u/L'}</span>
            </div>
          </div>
        );
      })}

      {datos.length === 0 && !isLoading && (
        <p className="text-center text-sm font-bold mt-10" style={{ color: adobe.midTint }}>No hay datos extraídos para este documento.</p>
      )}
    </div>
  );
};