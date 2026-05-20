import { useState, useCallback } from 'react';
import { ingestionService } from '../services/ingestionService';

export interface FileWithMeta {
  file: File;
  detectedType: string;
}

export const useIngestion = () => {
  const [filesWithMeta, setFilesWithMeta] = useState<FileWithMeta[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [episode, setEpisode] = useState('EP-001');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inferType = (fileName: string): string => {
    const name = fileName.toUpperCase();
    if (name.includes('VIT')) return 'VIT';
    if (name.includes('PUL')) return 'PUL';
    if (name.includes('GLAS')) return 'GLAS';
    if (name.includes('LAB')) return 'LAB';
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
    uploadFiles, processOCR
  };
};