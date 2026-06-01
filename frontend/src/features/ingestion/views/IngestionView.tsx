import React from 'react';
import { UploadCloud, FileType, FileText, CheckCircle, AlertCircle, X, Loader2, Cpu, Info, ChevronDown } from 'lucide-react';
import { useIngestion } from '../hooks/useIngestion';
import { useAdmissions } from '../../admissions/hooks/useAdmissions';
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { Dropzone } from '../../../components/common/Dropzone';
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
  const themeStatus = INAAQC_THEME.status;

  const getStatusInfo = (s: string) => {
    switch(s) {
      case 'idle': return { label: 'ESPERANDO ARCHIVOS', color: adobe.base };
      case 'uploaded': return { label: 'SUBIDO A LA NUBE', color: adobe.highlight };
      case 'processed': return { label: 'PROCESADO CON IA', color: themeStatus.success.text };
      case 'error': return { label: 'ERROR CRÍTICO', color: themeStatus.warning.text };
      default: return { label: s.toUpperCase(), color: adobe.base };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up font-sans">
      
      {/* HEADER UNIFICADO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: adobe.base }}>
            <UploadCloud style={{ color: adobe.highlight }} className="w-8 h-8" /> Ingesta Inteligente (OCR)
          </h2>
          <p className="mt-1 font-medium text-sm" style={{ color: adobe.darkTint }}>Carga múltiple de archivos y detección por inferencia.</p>
        </div>
        
        <div className="w-full md:w-96">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: adobe.midTint }}>Episodio Destino</label>
          <div className="relative">
            {/* FIX: Desplegable con episodios reales, nombre de paciente y fondo blanco */}
            <select 
              className="w-full appearance-none border-2 text-sm font-bold p-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer bg-white"
              style={{ borderColor: adobe.midTint, color: adobe.base }}
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
            >
              <option value="">-- Selecciona un episodio --</option>
              {admisiones.map((a: any) => (
                <option key={a.id_admision} value={a.numero_episodio}>
                  {a.numero_episodio} - {a.paciente_nombre || 'Paciente Desconocido'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: adobe.base }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Dropzone onFilesDropped={addFiles} />
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

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: adobe.lightTint }}>
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
                <span className="font-black" style={{ color: getStatusInfo(status).color }}>
                  {getStatusInfo(status).label}
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
                  style={{ backgroundColor: themeStatus.success.bg, borderColor: themeStatus.success.border }}>
                <CheckCircle className="mx-auto mb-2" size={32} style={{ color: themeStatus.success.text }} />
                <p className="text-sm font-bold" style={{ color: themeStatus.success.text }}>{successMessage}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button onClick={clearAll} variant="outline" className="flex-1 py-2 text-xs">
                    Subir Más
                  </Button>
                  <Button onClick={() => navigate(`/dashboard/laboratorios?episodio=${episode}`)} variant="primary" className="flex-1 py-2 text-xs">
                    Ver Resultados
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-4 rounded-xl border flex items-start gap-2 animate-in shake" style={{ backgroundColor: themeStatus.warning.bg, borderColor: themeStatus.warning.border }}>
                <AlertCircle className="shrink-0 mt-0.5" size={18} style={{ color: themeStatus.warning.text }} />
                <p className="text-xs font-bold leading-relaxed" style={{ color: themeStatus.warning.text }}>{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngestionView;