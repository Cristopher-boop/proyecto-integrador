import React from 'react';
import { FileSearch, CheckCircle, X } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { useVisualizer } from '../hooks/useVisualizer';
import { DocumentPane } from '../components/DocumentPane';
import { ExtractedDataPane } from '../components/ExtractedDataPane';

interface AuditProps {
  onClose: () => void;
  idArchivo: string;
  documentoUrl: string;
  tipo: 'PDF' | 'IMAGE';
  nombreArchivo: string;
}

export const AuditSplitView: React.FC<AuditProps> = ({ onClose, idArchivo, documentoUrl, tipo, nombreArchivo }) => {
  const adobe = INAAQC_THEME.palette;
  const { datosExtraidos, isLoading, activeParam, zoomCoords, handleParamClick, handleUpdateValue } = useVisualizer(idArchivo);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: '#ffffff' }}>
      
      {/* HEADER TOP-BAR */}
      <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 shadow-sm" style={{ borderColor: adobe.lightTint, backgroundColor: '#ffffff' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: adobe.lightTint }}>
            <FileSearch className="w-5 h-5" style={{ color: adobe.highlight }} />
          </div>
          <div>
            <h2 className="font-black leading-tight" style={{ color: adobe.base }}>Auditoría de Ingesta (OCR)</h2>
            <p className="text-xs font-bold" style={{ color: adobe.darkTint }}>Documento: {nombreArchivo}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="primary" icon={<CheckCircle className="w-4 h-4" />} onClick={onClose}>Aprobar Auditoría</Button>
          <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: adobe.darkTint }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = adobe.darkTint; }}>
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* SPLIT SCREEN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANEL IZQUIERDO: VISUALIZADOR DEL DOCUMENTO (60%) */}
        <div className="w-3/5 border-r relative" style={{ borderColor: adobe.lightTint }}>
          <DocumentPane url={documentoUrl} tipo={tipo} zoomCoords={zoomCoords} />
        </div>

        {/* PANEL DERECHO: DATOS EXTRAÍDOS (40%) */}
        <div className="w-2/5 flex flex-col">
          <ExtractedDataPane 
            datos={datosExtraidos} 
            isLoading={isLoading} 
            activeParam={activeParam} 
            onParamClick={handleParamClick} 
            onUpdateValue={handleUpdateValue}
          />
        </div>

      </div>
    </div>
  );
};