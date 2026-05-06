import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, FileText, CheckCircle, AlertCircle, X, Loader2, Cpu, Info } from 'lucide-react';
import axios from 'axios';

// Definimos la estructura para manejar cada archivo con su tipo detectado
interface FileWithMeta {
  file: File;
  detectedType: string; // 'LAB', 'VIT', 'GLAS', 'PUL' o 'UNKNOWN'
}

const UploadResults: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [filesWithMeta, setFilesWithMeta] = useState<FileWithMeta[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  
  const [episode, setEpisode] = useState('EP-001');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // --- FUNCIÓN DE INFERENCIA INTELIGENTE ---
  const inferType = (fileName: string): string => {
    const name = fileName.toUpperCase();
    if (name.includes('VIT')) return 'VIT';
    if (name.includes('PUL')) return 'PUL';
    if (name.includes('GLAS')) return 'GLAS';
    if (name.includes('LAB')) return 'LAB';
    return 'UNKNOWN';
  };

  const processIncomingFiles = (incomingFiles: File[]) => {
    const newFiles = incomingFiles.map(f => ({
      file: f,
      detectedType: inferType(f.name)
    }));
    setFilesWithMeta(prev => [...prev, ...newFiles]);
    setStatus('idle');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFilesWithMeta(prev => prev.filter((_, index) => index !== indexToRemove));
    if (filesWithMeta.length === 1) setStatus('idle');
  };

  // 1. SUBIR ARCHIVOS (Cada uno con su tipo detectado)
  const handleUpload = async () => {
    const hasUnknown = filesWithMeta.some(f => f.detectedType === 'UNKNOWN');
    if (hasUnknown) {
      setErrorMessage("Por favor, asigna un tipo a todos los documentos antes de subir.");
      setStatus('error');
      return;
    }

    setIsUploading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      
      const uploadPromises = filesWithMeta.map(item => {
        const formData = new FormData();
        formData.append('archivo_fisico', item.file);
        formData.append('tipo_documento', item.detectedType); // <--- TIPO INDIVIDUAL
        formData.append('numero_episodio', episode);

        return axios.post('http://127.0.0.1:8000/api/v1/clinical/archivos/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      });

      const responses = await Promise.all(uploadPromises);
      const ids = responses.map(res => res.data.id || res.data.id_archivo);
      setFileIds(ids);
      setStatus('uploaded');
      
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Error al subir los archivos. Verifica que el servidor esté activo.');
    } finally {
      setIsUploading(false);
    }
  };

  // 2. PROCESAR OCR
  const handleProcessOCR = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const processPromises = fileIds.map(id => 
        axios.post(`http://127.0.0.1:8000/api/v1/clinical/archivos/${id}/procesar/`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      await Promise.all(processPromises);
      setSuccessMessage(`¡Éxito! ${fileIds.length} documentos analizados.`);
      setStatus('processed');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage('Error en el procesamiento de IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="text-indigo-600 w-8 h-8" />
            Ingesta Inteligente
          </h2>
          <p className="text-slate-500">Sube múltiples PDF/JPG. El sistema detectará el tipo por el nombre.</p>
        </div>
        <div className="text-right">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Episodio Activo</label>
          <input 
            type="text" value={episode} onChange={(e) => setEpisode(e.target.value.toUpperCase())}
            className="border-b-2 border-indigo-200 focus:border-indigo-600 outline-none px-2 py-1 text-lg font-bold text-slate-700 w-32 text-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ZONA DE CARGA */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'}`}
          >
            <FileType className={`w-12 h-12 mb-3 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="text-slate-600 font-medium">Arrastra tus archivos aquí o haz clic</span>
            <span className="text-slate-400 text-sm mt-1">Soporta: PDF, JPG, PNG</span>
            <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleChange} />
          </div>

          {filesWithMeta.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Archivos en cola ({filesWithMeta.length})</span>
                <button onClick={() => setFilesWithMeta([])} className="text-xs text-red-500 hover:font-bold">Limpiar todo</button>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {filesWithMeta.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-lg ${item.detectedType === 'UNKNOWN' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {item.file.type.includes('pdf') ? <FileText size={20} /> : <FileType size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{item.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <select 
                          value={item.detectedType}
                          onChange={(e) => {
                            const updated = [...filesWithMeta];
                            updated[idx].detectedType = e.target.value;
                            setFilesWithMeta(updated);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.detectedType === 'UNKNOWN' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}
                        >
                          <option value="UNKNOWN">SELECCIONAR TIPO</option>
                          <option value="LAB">LABORATORIO</option>
                          <option value="VIT">VITALES</option>
                          <option value="GLAS">GLASGOW</option>
                          <option value="PUL">PULMONAR</option>
                        </select>
                        <span className="text-[10px] text-slate-400">{(item.file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-slate-300 hover:text-red-500"><X size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACCIONES */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Info size={18} className="text-indigo-500" /> Resumen de Carga
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total archivos:</span>
                <span className="font-bold text-slate-700">{filesWithMeta.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estado:</span>
                <span className={`font-bold ${status === 'processed' ? 'text-emerald-600' : 'text-indigo-600'}`}>{status.toUpperCase()}</span>
              </div>
            </div>

            {status === 'idle' && filesWithMeta.length > 0 && (
              <button 
                onClick={handleUpload} disabled={isUploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                Subir Archivos
              </button>
            )}

            {status === 'uploaded' && (
              <button 
                onClick={handleProcessOCR} disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Cpu />}
                Procesar con IA
              </button>
            )}

            {status === 'processed' && (
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm font-bold text-emerald-800">{successMessage}</p>
                <button onClick={() => {setFilesWithMeta([]); setStatus('idle');}} className="mt-3 text-xs text-emerald-600 underline">Subir más</button>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResults;