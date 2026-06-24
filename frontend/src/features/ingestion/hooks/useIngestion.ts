import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { ingestionService } from '../services/ingestionService';

export interface FileWithMeta {
  file: File;
  detectedType: string;
}

export const useIngestion = () => {
  const [filesWithMeta, setFilesWithMeta] = useState<FileWithMeta[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [episode, setEpisode] = useState(''); // Estado inicial vacío
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- NUEVO: ESTADO SOLO PARA EL SELECTOR DE INGESTA ---
  const [episodeOptions, setEpisodeOptions] = useState<{value: string, label: string}[]>([]);

  // --- NUEVO: EFECTO AISLADO PARA TRAER EPISODIOS + NOMBRES ---
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [pacientesRes, admisionesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/patients/', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const options = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: any) => p.id_paciente === a.paciente);
          const nombre = px ? `${px.nombres} ${px.apellidos}` : 'Paciente Desconocido';
          return {
            value: a.numero_episodio, // Guardamos el número de episodio para Cloudinary
            label: `${a.numero_episodio} - ${nombre}` // Lo que el usuario verá
          };
        });
        setEpisodeOptions(options);
      } catch (error) {
        console.error("Error al cargar episodios para ingesta", error);
      }
    };
    fetchEpisodes();
  }, []);

  const inferType = (fileName: string): string => {
    const name = fileName.toLowerCase(); 
    
    if (name.includes('vit')) return 'VIT';
    if (name.includes('pul')) return 'PUL';
    if (name.includes('glas')) return 'GLAS';
    if (name.includes('lab') || name.includes('cyberlab')) return 'LAB';
    
    if (name.includes('prise_en_charge') || name.includes('prise') || name.includes('admission')) return 'NA';
    if (name.includes('journalier') || name.includes('evolucion') || name.includes('evolution')) return 'NE';
    
    return 'UNKNOWN';
  };

  const addFiles = useCallback((incomingFiles: File[]) => {
    const newFiles = incomingFiles.map(f => ({
      file: f,
      detectedType: inferType(f.name)
    }));
    setFilesWithMeta(prev => [...prev, ...newFiles]);
    setStatus('idle');
    setErrorMessage('');
  }, []);

  const removeFile = useCallback((indexToRemove: number) => {
    setFilesWithMeta(prev => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      if (updated.length === 0) setStatus('idle');
      return updated;
    });
  }, []);

  const updateFileType = useCallback((index: number, newType: string) => {
    setFilesWithMeta(prev => {
      const updated = [...prev];
      updated[index].detectedType = newType;
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFilesWithMeta([]);
    setStatus('idle');
    setFileIds([]);
  }, []);

  const uploadFiles = async () => {
    if (filesWithMeta.some(f => f.detectedType === 'UNKNOWN')) {
      setErrorMessage("Por favor, asigna un tipo a todos los documentos antes de subir.");
      setStatus('error');
      return;
    }

    setIsUploading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const uploadPromises = filesWithMeta.map(item => {
        const formData = new FormData();
        formData.append('archivo_fisico', item.file);
        formData.append('tipo_documento', item.detectedType);
        formData.append('numero_episodio', episode);
        return ingestionService.uploadFile(formData);
      });

      const responses = await Promise.all(uploadPromises);
      const ids = responses.map(res => res.id || res.id_archivo);
      
      setFileIds(ids);
      setStatus('uploaded');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.error || 'Error al subir los archivos. Verifica que el servidor esté activo.');
    } finally {
      setIsUploading(false);
    }
  };

  const processOCR = async () => {
    setIsProcessing(true);
    try {
      const processPromises = fileIds.map(id => ingestionService.processOCR(id));
      await Promise.all(processPromises);
      
      setSuccessMessage(`¡Éxito! ${fileIds.length} documentos analizados por el Motor OCR.`);
      setStatus('processed');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage('Error en el procesamiento de IA. Revisa los logs del servidor.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    filesWithMeta, addFiles, removeFile, updateFileType, clearAll,
    episode, setEpisode,
    isUploading, isProcessing, status, errorMessage, successMessage,
    uploadFiles, processOCR,
    episodeOptions // Exportamos nuestra nueva lista
  };
};