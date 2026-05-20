import React from 'react';
import { UploadCloud, FileType, FileText, CheckCircle, AlertCircle, X, Loader2, Cpu, Info } from 'lucide-react';
import { useIngestion } from '../hooks/useIngestion';
import { useAdmissions } from '../../admissions/hooks/useAdmissions';
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { Dropzone } from '../../../components/common/Dropzone';
import { Autocomplete } from '../../../components/common/Autocomplete';
import { useNavigate } from 'react-router-dom';

const IngestionView: React.FC = () => {
  const {
    filesWithMeta, addFiles, removeFile, updateFileType, clearAll,
    episode, setEpisode,
    isUploading, isProcessing, status, errorMessage, successMessage,
    uploadFiles, processOCR
  } = useIngestion();

  const navigate = useNavigate();
  const { admisiones } = useAdmissions();
  const adobe = INAAQC_THEME.palette;

  const episodeOptions = admisiones.map(a => ({ label: a.numero_episodio, value: a.numero_episodio }));

  const getStatusInfo = (s: string) => {
    switch(s) {
      case 'idle': return { label: 'ESPERANDO ARCHIVOS', color: adobe.base };
      case 'uploaded': return { label: 'SUBIDO A LA NUBE', color: adobe.highlight };
      case 'processed': return { label: 'PROCESADO CON IA', color: '#10b981' };
      case 'error': return { label: 'ERROR CRÍTICO', color: '#ef4444' };
      default: return { label: s.toUpperCase(), color: adobe.base };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up font-sans">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: adobe.base }}>
            <UploadCloud style={{ color: adobe.highlight }} className="w-8 h-8" />
            Ingesta Inteligente (OCR)
          </h2>
          <p className="mt-1" style={{ color: adobe.darkTint }}>Carga múltiple de archivos. Detección automática por inferencia.</p>
        </div>
        <div className="text-right bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: adobe.midTint }}>Episodio Destino</label>
          <input 
            type="text" 
            value={episode} 
            onChange={(e) => setEpisode(e.target.value.toUpperCase())}
            className="bg-transparent border-b-2 outline-none px-2 py-1 text-lg font-black text-center w-36 transition-colors focus:border-blue-500"
            style={{ color: adobe.base, borderColor: adobe.lightTint }}
            placeholder="EP-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LADO IZQUIERDO: DROPZONE Y LISTA DE ARCHIVOS */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* ¡MIRA QUÉ LIMPIO QUEDA ESTO AHORA! */}
          <Dropzone onFilesDropped={addFiles} />

          {/* Lista de Archivos */}
          {filesWithMeta.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: adobe.darkTint }}>Archivos en cola ({filesWithMeta.length})</span>
                <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Limpiar todo</button>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
                {filesWithMeta.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-lg ${item.detectedType === 'UNKNOWN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.file.type.includes('pdf') ? <FileText size={20} /> : <FileType size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: adobe.base }}>{item.file.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <select 
                          value={item.detectedType}
                          onChange={(e) => updateFileType(idx, e.target.value)}
                          className={`text-xs font-bold px-3 py-1 rounded-md border appearance-none cursor-pointer pr-8 transition-colors
                            ${item.detectedType === 'UNKNOWN' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${item.detectedType === 'UNKNOWN' ? 'B45309' : '4D6173'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px'
                          }}
                        >
                          <option value="UNKNOWN">⚠️ SELECCIONAR TIPO</option>
                          <option value="LAB">LABORATORIO</option>
                          <option value="VIT">VITALES</option>
                          <option value="GLAS">GLASGOW</option>
                          <option value="PUL">PULMONAR</option>
                        </select>
                        <span className="text-xs font-medium" style={{ color: adobe.midTint }}>{(item.file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO: PANEL DE ACCIONES (SUMMARY) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: adobe.base }}>
              <Info size={18} style={{ color: adobe.highlight }} /> Resumen de Operación
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="font-medium" style={{ color: adobe.darkTint }}>Total archivos:</span>
                <span className="font-black" style={{ color: adobe.base }}>{filesWithMeta.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium" style={{ color: adobe.darkTint }}>Estado actual:</span>
                <span className={`font-black ${status === 'processed' ? 'text-emerald-600' : status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                  {status.toUpperCase()}
                </span>
              </div>
            </div>

            {status === 'idle' && filesWithMeta.length > 0 && (
              <Button onClick={uploadFiles} disabled={isUploading} variant="primary" className="w-full py-3">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                Subir al Servidor
              </Button>
            )}

            {status === 'uploaded' && (
              <Button onClick={processOCR} disabled={isProcessing} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                Ejecutar Motor OCR
              </Button>
            )}

            {status === 'processed' && (
              <div className="text-center p-4 rounded-xl border animate-in zoom-in-95" 
                  style={{ backgroundColor: 'hsl(147, 74%, 96%)', borderColor: 'hsl(147, 74%, 85%)' }}>
                <CheckCircle className="mx-auto mb-2" size={32} style={{ color: '#10b981' }} />
                <p className="text-sm font-bold text-emerald-800">{successMessage}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={clearAll} 
                    variant="outline" 
                    className="flex-1 py-2 text-xs">
                    Subir Más
                  </Button>
                  <Button 
                    onClick={() => navigate(`/laboratorios?episodio=${episode}&openAudit=true`)} 
                    variant="primary" 
                    className="flex-1 py-2 text-xs">
                    Ver Resultados
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2 animate-in shake">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs font-bold text-red-700 leading-relaxed">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default IngestionView;