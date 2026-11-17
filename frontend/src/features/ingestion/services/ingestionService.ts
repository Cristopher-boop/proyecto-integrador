import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/clinical/archivos/';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(isMultipart ? { 'Content-Type': 'multipart/form-data' } : {})
    }
  };
};

export const ingestionService = {
  uploadFile: async (formData: FormData) => {
    const response = await axios.post(API_URL, formData, getHeaders(true));
    return response.data;
  },
  
  processOCR: async (id: string) => {
    const response = await axios.post(`${API_URL}${id}/procesar/`, {}, getHeaders());
    return response.data;
  }
};