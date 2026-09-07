import apiClient from '../../../api/client';
import type { Admision, AdmisionFormData } from '../../../types';

const ENDPOINT = '/patients/admisiones/';

export const admissionService = {
  getAll: async (): Promise<Admision[]> => {
    const response = await apiClient.get<Admision[]>(ENDPOINT);
    return response.data;
  },
  
  create: async (data: AdmisionFormData | Partial<Admision>): Promise<Admision> => {
    const response = await apiClient.post<Admision>(ENDPOINT, data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<AdmisionFormData | Admision>): Promise<Admision> => {
    const response = await apiClient.put<Admision>(`${ENDPOINT}${id}/`, data);
    return response.data;
  },
  
  deactivate: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`${ENDPOINT}${id}/`);
    return response.data;
  },
  
  reactivate: async (id: string): Promise<Admision> => {
    const response = await apiClient.post<Admision>(`${ENDPOINT}${id}/reactivar/`);
    return response.data;
  }
};