import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/patients/';

// Helper para obtener los headers
const getHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
});

export const patientService = {
  getAll: async () => {
    const response = await axios.get(API_URL, getHeaders());
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await axios.post(API_URL, data, getHeaders());
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}${id}/`, data, getHeaders());
    return response.data;
  },
  
  deactivate: async (id: string) => {
    const response = await axios.delete(`${API_URL}${id}/`, getHeaders());
    return response.data;
  },
  
  reactivate: async (id: string) => {
    const response = await axios.post(`${API_URL}${id}/reactivar/`, {}, getHeaders());
    return response.data;
  }
};