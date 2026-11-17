import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';

interface DocumentPaneProps {
  url: string;
  tipo: 'PDF' | 'IMAGE';
  zoomCoords: any | null; // Para el futuro: hacer zoom programático aquí
}

export const DocumentPane: React.FC<DocumentPaneProps> = ({ url, tipo }) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: adobe.lightTint }}>
      <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controles Flotantes con estricto INAAQC_THEME */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full shadow-xl border"
                 style={{ backgroundColor: '#ffffff', borderColor: adobe.midTint }}>
              <button onClick={() => zoomIn()} className="p-2 rounded-full transition-all" style={{ color: adobe.base }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = adobe.lightTint} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-6" style={{ backgroundColor: adobe.midTint }}></div>
              <button onClick={() => resetTransform()} className="p-2 rounded-full transition-all" style={{ color: adobe.highlight }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = adobe.lightTint} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Maximize className="w-5 h-5" />
              </button>
              <div className="w-px h-6" style={{ backgroundColor: adobe.midTint }}></div>
              <button onClick={() => zoomOut()} className="p-2 rounded-full transition-all" style={{ color: adobe.base }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = adobe.lightTint} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* El Documento */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                {tipo === 'PDF' ? (
                  <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-[800px] h-[1000px] shadow-2xl" style={{ border: `1px solid ${adobe.midTint}` }} title="Documento Médico" />
                ) : (
                  <img src={url} alt="Documento Médico" className="max-w-full shadow-2xl" style={{ border: `1px solid ${adobe.midTint}` }} />
                )}
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};