import axios from 'axios';

const getHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
});

export const visualizerService = {
  // Función NUEVA: Trae los archivos subidos a un episodio
  getArchivosPorEpisodio: async (episodio: string) => {
    // Asegúrate de que esta ruta coincida con la de tu Django
    const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/archivos/?episodio=${episodio}`, getHeaders());
    return response.data;
  },

  getExtractedData: async (idArchivo: string) => {
    const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/?archivo_fuente=${idArchivo}`, getHeaders());
    return response.data;
  },
  
  updateObservation: async (idObservacion: string, data: any) => {
    const response = await axios.put(`http://127.0.0.1:8000/api/v1/clinical/observaciones/${idObservacion}/`, data, getHeaders());
    return response.data;
  }
};