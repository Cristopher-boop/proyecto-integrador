import apiClient from '../../../api/client';
import type { ArchivoFuente, ObservacionBiomedica } from '../../../types';

export const visualizerService = {
  getArchivosPorEpisodio: async (episodio: string): Promise<ArchivoFuente[]> => {
    const response = await apiClient.get<ArchivoFuente[]>('/clinical/archivos/', {
      params: { episodio }
    });
    return response.data;
  },

  getExtractedData: async (idArchivo: string): Promise<ObservacionBiomedica[]> => {
    const response = await apiClient.get<ObservacionBiomedica[]>('/clinical/observaciones/', {
      params: { archivo_fuente: idArchivo }
    });
    return response.data;
  },
  
  updateObservation: async (idObservacion: string, data: Partial<ObservacionBiomedica>): Promise<ObservacionBiomedica> => {
    const response = await apiClient.put<ObservacionBiomedica>(`/clinical/observaciones/${idObservacion}/`, data);
    return response.data;
  }
};