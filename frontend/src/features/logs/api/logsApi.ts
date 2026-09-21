import apiClient from '../../../api/client';
import type { AuditLog, AuditLogFilters, SystemBackup, BackupScheduleStatus } from '../types/logs.types';

export const logsApi = {
  getLogs: async (filters: AuditLogFilters = {}): Promise<AuditLog[]> => {
    const params: Record<string, string> = {};
    if (filters.modulo) params.modulo = filters.modulo;
    if (filters.rol) params.rol = filters.rol;
    if (filters.accion) params.accion = filters.accion;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;
    if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
    if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;

    const response = await apiClient.get<AuditLog[]>('/users/logs/', { params });
    return response.data;
  },

  exportLogs: async (filters: AuditLogFilters = {}, format: 'csv' | 'json' = 'csv'): Promise<void> => {
    const params: Record<string, string> = { formato: format };
    if (filters.modulo) params.modulo = filters.modulo;
    if (filters.rol) params.rol = filters.rol;
    if (filters.accion) params.accion = filters.accion;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;
    if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
    if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;

    const response = await apiClient.get('/users/logs/exportar/', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `logs_auditoria_${new Date().toISOString().slice(0, 10)}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getBackups: async (): Promise<SystemBackup[]> => {
    const response = await apiClient.get<SystemBackup[]>('/users/backups/');
    return response.data;
  },

  generateBackup: async (notas: string = '', tipo: string = 'MANUAL_SUPERADMIN'): Promise<SystemBackup> => {
    const response = await apiClient.post<SystemBackup>('/users/backups/', { notas, tipo });
    return response.data;
  },

  downloadBackup: async (idBackup: string, filename: string): Promise<void> => {
    const response = await apiClient.get(`/users/backups/${idBackup}/descargar/`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getScheduleStatus: async (): Promise<BackupScheduleStatus> => {
    const response = await apiClient.get<BackupScheduleStatus>('/users/backups/estado-programacion/');
    return response.data;
  },
};

