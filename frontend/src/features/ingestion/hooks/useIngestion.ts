import { useState, useCallback, useEffect } from 'react';
import apiClient from '../../../api/client';
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
  const [episodeOptions, setEpisodeOptions] = useState<
    { value: string; label: string; secondary?: string; fecha_ingreso?: string }[]
  >([]);

  // --- NUEVO: EFECTO AISLADO PARA TRAER EPISODIOS + NOMBRES ---
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const [pacientesRes, admisionesRes] = await Promise.all([
          apiClient.get<any[]>('/patients/'),
          apiClient.get<any[]>('/patients/admisiones/')
        ]);

        const options = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: any) => p.id_paciente === a.paciente);
          const nombre = px ? `${px.nombres} ${px.apellidos}` : 'Paciente Desconocido';
          return {
            value: a.numero_episodio,
            label: a.numero_episodio,
            secondary: nombre,
            fecha_ingreso: a.fecha_ingreso,
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

  const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  const addFiles = useCallback((incomingFiles: File[]) => {
    let rejectedCount = 0;
    const validFiles: File[] = [];

    incomingFiles.forEach(f => {
      const hasValidType = ALLOWED_TYPES.includes(f.type);
      const hasValidExt = ALLOWED_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext));
      const hasValidSize = f.size > 0 && f.size <= MAX_FILE_SIZE;

      if ((hasValidType || hasValidExt) && hasValidSize) {
        validFiles.push(f);
      } else {
        rejectedCount++;
      }
    });

    if (rejectedCount > 0) {
      setErrorMessage(`Se omitieron ${rejectedCount} archivo(s) no válidos. Solo se admiten documentos PDF e imágenes JPG/PNG/WEBP de hasta 50MB.`);
    } else {
      setErrorMessage('');
    }

    const newFiles = validFiles.map(f => ({
      file: f,
      detectedType: inferType(f.name)
    }));
    setFilesWithMeta(prev => [...prev, ...newFiles]);
    setStatus('idle');
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
    if (!episode || !episode.trim()) {
      setErrorMessage("Por favor, selecciona un episodio clínico de destino antes de subir los archivos.");
      setStatus('error');
      return;
    }

    if (filesWithMeta.length === 0) {
      setErrorMessage("No hay archivos en la cola para subir.");
      setStatus('error');
      return;
    }

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