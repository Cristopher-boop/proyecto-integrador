import apiClient from '../../../api/client';
import type { AuditLog, AuditLogFilters } from '../types/logs.types';

export const logsApi = {
  getLogs: async (filters: AuditLogFilters = {}): Promise<AuditLog[]> => {
    const params: Record<string, string> = {};
    if (filters.modulo) params.modulo = filters.modulo;
    if (filters.rol) params.rol = filters.rol;
    if (filters.accion) params.accion = filters.accion;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;

    const response = await apiClient.get<AuditLog[]>('/users/logs/', { params });
    return response.data;
  },
};
