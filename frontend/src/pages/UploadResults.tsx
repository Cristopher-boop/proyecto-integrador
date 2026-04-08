import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileType, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const UploadResults: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [episode, setEpisode] = useState('EP-001');
  const [docType, setDocType] = useState('LAB');
  
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // --- NUEVA LÓGICA: Auto-seleccionar tipo según extensión ---
  useEffect(() => {
    if (file) {
      if (file.type === 'application/pdf') {
        setDocType('LAB'); // Por defecto si es PDF
      } else if (file.type.startsWith('image/')) {
        setDocType('IMG'); // Por defecto si es Imagen
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
      
      const response = await axios.post('http://127.0.0.1:8000/api/clinical/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta de Django:', response.data);
      setStatus('success');
      
    } catch (error: any) {
      console.error('Error al subir:', error);
      setStatus('error');
      // Mejoramos el mensaje para que avise si el token expiró
      if (error.response?.status === 401) {
        setErrorMessage('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      } else {
        setErrorMessage(error.response?.data?.error || 'Error de conexión con el servidor.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de Documento</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
              disabled={!file} // Deshabilitado si no hay archivo
            >
              {!file && <option value="">Sube un archivo primero...</option>}
              
              {/* Opciones dinámicas para PDF */}
              {file?.type === 'application/pdf' && (
                <>
                  <option value="LAB">Laboratorio (LAB)</option>
                  <option value="NA">Nota de Admisión (NA)</option>
                  <option value="NE">Nota de Evolución (NE)</option>
                </>
              )}

              {/* Opciones dinámicas para Imágenes */}
              {file?.type.startsWith('image/') && (
                <option value="IMG">Imagen Médica (IMG)</option>
              )}
            </select>
          </div>
        </div>

        {/* PARTE DERECHA: Zona Drag & Drop */}
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
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="bg-blue-600 p-3 rounded-lg text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-blue-900 truncate">{file.name}</p>
                    <p className="text-xs text-blue-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={removeFile} className="p-2 hover:bg-blue-100 rounded-full text-blue-700 transition-colors" title="Quitar archivo">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6">
                {status === 'idle' && (
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                    {isUploading ? 'Procesando en el Motor...' : 'Subir Archivo al Sistema'}
                  </button>
                )}

                {status === 'success' && (
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium py-3 rounded-lg flex justify-center items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ¡Archivo ingerido exitosamente!
                  </div>
                )}

                {status === 'error' && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-600 font-medium py-3 rounded-lg flex flex-col justify-center items-center gap-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{errorMessage}</span>
                    </div>
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