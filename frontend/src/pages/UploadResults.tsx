import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileType, FileText, CheckCircle, AlertCircle, X, Loader2, Cpu } from 'lucide-react';
import axios from 'axios';

const UploadResults: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [episode, setEpisode] = useState('EP-001'); // Debe coincidir con un episodio real de tu BD
  const [docType, setDocType] = useState('LAB');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados: idle -> uploaded (subido, listo para OCR) -> processed (OCR terminado) -> error
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fileId, setFileId] = useState<string | null>(null); // Guardaremos el ID que nos devuelva Django

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      if (file.type === 'application/pdf') {
        setDocType('LAB');
      } else if (file.type.startsWith('image/')) {
        setDocType('IMG');
      }
    }
  }, [file]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  // 1. SUBIR EL ARCHIVO FÍSICO
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus('idle');

    const formData = new FormData();
    formData.append('archivo_fisico', file);
    formData.append('tipo_documento', docType);
    formData.append('numero_episodio', episode);

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post('http://127.0.0.1:8000/api/v1/clinical/archivos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // ¡MEGÁFONO 1! Vemos exactamente qué devuelve Django
      console.log("✅ Django respondió al subir:", response.data);

      // Truco: Atrapamos el ID sin importar cómo lo llame tu backend
      const idAtrapado = response.data.id || response.data.id_archivo || response.data.uuid || response.data.pk;
      
      setFileId(idAtrapado);
      setStatus('uploaded');
      
    } catch (error: any) {
      setStatus('error');
      if (error.response?.status === 401) {
        setErrorMessage('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      } else {
        setErrorMessage(error.response?.data?.error || 'Error de conexión al subir el archivo.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 2. DISPARAR EL MOTOR OCR
  const handleProcessOCR = async () => {
    // ¡MEGÁFONO 2! Vemos si el botón sabe qué ID procesar
    console.log("Intentando procesar el archivo con ID:", fileId);

    if (!fileId) {
      alert("🚨 ALERTA: El fileId está vacío. Abre la consola (F12) para ver qué devolvió Django en el paso anterior.");
      return;
    }

    setIsProcessing(true);
    setStatus('uploaded'); 

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(`http://127.0.0.1:8000/api/v1/clinical/archivos/${fileId}/procesar/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccessMessage(response.data.mensaje);
      setStatus('processed');
      
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Error interno del motor OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileId(null);
    setStatus('idle');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UploadCloud className="text-blue-600 w-7 h-7" />
          Ingesta de Datos Médicos
        </h2>
        <p className="text-slate-500 mt-2">
          Sube resultados de laboratorio, imágenes o documentos asociados a un episodio clínico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PARTE IZQUIERDA: Metadatos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-1 space-y-4">
          <h3 className="font-semibold text-slate-700 border-b pb-2 mb-4">Metadatos del Archivo</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nº Episodio (Admisión)</label>
            <input 
              type="text" 
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: EP-001"
              disabled={status === 'uploaded' || status === 'processed'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de Documento</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
              disabled={!file || status === 'uploaded' || status === 'processed'}
            >
              {!file && <option value="">Sube un archivo primero...</option>}
              
              {file?.type === 'application/pdf' && (
                <>
                  <option value="LAB">Laboratorio (LAB)</option>
                  <option value="NA">Nota de Admisión (NA)</option>
                  <option value="NE">Nota de Evolución (NE)</option>
                </>
              )}

              {file?.type.startsWith('image/') && (
                <option value="IMG">Imagen Médica (IMG)</option>
              )}
            </select>
          </div>
        </div>

        {/* PARTE DERECHA: Zona Drag & Drop y Acciones */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2 flex flex-col">
          
          {!file ? (
            <div 
              className={`flex-1 flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <FileType className={`w-12 h-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
              <p className="text-slate-600 font-medium text-center">
                Arrastra y suelta tu archivo aquí o haz clic para explorar
              </p>
              <p className="text-slate-400 text-sm mt-1">PDF, JPG, PNG admitidos</p>
              
              <input 
                ref={inputRef}
                type="file" 
                accept=".pdf, image/png, image/jpeg"
                className="hidden" 
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              
              {/* Tarjeta del archivo seleccionado */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`${status === 'processed' ? 'bg-emerald-600' : 'bg-blue-600'} p-3 rounded-lg text-white transition-colors`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {status !== 'processed' && !isProcessing && !isUploading && (
                  <button onClick={removeFile} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors" title="Quitar archivo">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Botones y Estados de Alerta */}
              <div className="mt-6 space-y-3">
                
                {/* Estado Inicial: Botón Subir */}
                {status === 'idle' && (
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                    {isUploading ? 'Subiendo al Servidor...' : 'Subir Archivo'}
                  </button>
                )}

                {/* Estado Subido: Botón Procesar OCR */}
                {status === 'uploaded' && (
                  <div className="space-y-4">
                    <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium py-2 px-4 rounded-lg flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Archivo guardado en base de datos. Listo para análisis.
                    </div>
                    
                    <button 
                      onClick={handleProcessOCR}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                      {isProcessing ? 'Extrayendo datos biomédicos...' : 'Procesar con Inteligencia Artificial'}
                    </button>
                  </div>
                )}

                {/* Estado Procesado: Éxito */}
                {status === 'processed' && (
                  <div className="w-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-medium py-4 px-4 rounded-lg flex flex-col justify-center items-center gap-2 shadow-sm text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mb-1" />
                    <span>{successMessage}</span>
                    <button 
                      onClick={removeFile}
                      className="mt-2 text-sm text-emerald-700 underline hover:text-emerald-900"
                    >
                      Procesar otro documento
                    </button>
                  </div>
                )}

                {/* Estado Error */}
                {status === 'error' && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 font-medium py-3 px-4 rounded-lg flex flex-col justify-center gap-1 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertCircle className="w-5 h-5" />
                      Se detectó un problema:
                    </div>
                    <span className="ml-7">{errorMessage}</span>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="mt-2 ml-7 text-xs text-red-600 underline text-left"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UploadResults;