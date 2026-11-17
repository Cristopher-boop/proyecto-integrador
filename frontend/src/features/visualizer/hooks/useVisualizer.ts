import { useState, useEffect, useCallback } from 'react';
import { visualizerService } from '../services/visualizerService';

export const useVisualizer = (idArchivo: string, datosIniciales?: any[]) => {
  const [datosExtraidos, setDatosExtraidos] = useState<any[]>(datosIniciales || []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeParam, setActiveParam] = useState<string | null>(null);
  const [zoomCoords, setZoomCoords] = useState<any | null>(null);

  const fetchDatos = useCallback(async () => {
    if (!idArchivo || datosIniciales) return;
    setIsLoading(true);
    try {
      const data = await visualizerService.getExtractedData(idArchivo);
      setDatosExtraidos(data);
    } catch (error) {
      console.error("Error al cargar datos del OCR", error);
    } finally {
      setIsLoading(false);
    }
  }, [idArchivo, datosIniciales]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const handleParamClick = (parametro: string, coordenadas: any) => {
    setActiveParam(parametro);
    setZoomCoords(coordenadas); // Le diremos al visor dónde hacer zoom
  };

  const handleUpdateValue = async (idObservacion: string, nuevoValor: string) => {
    try {
      await visualizerService.updateObservation(idObservacion, { valor_numerico: nuevoValor });
      setDatosExtraidos(prev => prev.map(obs => obs.id_observacion === idObservacion ? { ...obs, valor_numerico: nuevoValor } : obs));
    } catch (error) {
      alert("Error al actualizar el valor");
    }
  };

  return {
    datosExtraidos,
    isLoading,
    activeParam,
    zoomCoords,
    handleParamClick,
    handleUpdateValue
  };
};