import apiClient from '../../../api/client';

const ENDPOINT = '/clinical/archivos/';

export const ingestionService = {
  uploadFile: async (formData: FormData) => {
    const response = await apiClient.post(ENDPOINT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  processOCR: async (id: string) => {
    const response = await apiClient.post(`${ENDPOINT}${id}/procesar/`);
    return response.data;
  }
};