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
    // CONTENEDOR PRINCIPAL - Modal que cubre toda la pantalla
    <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200 bg-slate-900/50 backdrop-blur-sm p-4 md:p-8">
      
      {/* CUERPO DEL MODAL (Esquinas redondeadas, sombra elegante) */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border" style={{ borderColor: adobe.midTint }}>
        
        {/* HEADER TOP-BAR */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0 shadow-sm z-20 border-b" style={{ backgroundColor: adobe.base, borderColor: adobe.darkTint }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <FileSearch className="w-5 h-5" style={{ color: adobe.highlight }} />
            </div>
            <div>
              <h2 className="font-black leading-tight text-white tracking-wide">Auditoría de Ingesta Clínica</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: adobe.lightTint }}>Documento: {nombreArchivo}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="primary" 
              icon={<CheckCircle className="w-4 h-4" />} 
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-sm"
            >
              Aprobar Auditoría
            </Button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full transition-colors text-white/50 hover:bg-red-500/20 hover:text-red-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* SPLIT SCREEN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden bg-slate-100 gap-1 p-1">
          
          {/* PANEL IZQUIERDO: VISUALIZADOR DEL DOCUMENTO (60%) */}
          <div className="w-3/5 relative bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200">
            <DocumentPane url={documentoUrl} tipo={tipo} zoomCoords={zoomCoords} />
          </div>

          {/* PANEL DERECHO: DATOS EXTRAÍDOS (40%) */}
          <div className="w-2/5 flex flex-col bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200">
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
    </div>
  );
};