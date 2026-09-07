import apiClient from '../../../api/client';
import type { Paciente, PacienteFormData } from '../../../types';

const ENDPOINT = '/patients/';

export const patientService = {
  getAll: async (estado: 'activos' | 'inactivos' | 'todos' = 'activos'): Promise<Paciente[]> => {
    const response = await apiClient.get<Paciente[]>(`${ENDPOINT}?estado=${estado}`);
    return response.data;
  },
  
  create: async (data: PacienteFormData | Partial<Paciente>): Promise<Paciente> => {
    const response = await apiClient.post<Paciente>(ENDPOINT, data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<PacienteFormData | Paciente>): Promise<Paciente> => {
    const response = await apiClient.put<Paciente>(`${ENDPOINT}${id}/`, data);
    return response.data;
  },
  
  deactivate: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`${ENDPOINT}${id}/`);
    return response.data;
  },
  
  reactivate: async (id: string): Promise<Paciente> => {
    const response = await apiClient.post<Paciente>(`${ENDPOINT}${id}/reactivar/`);
    return response.data;
  }
};