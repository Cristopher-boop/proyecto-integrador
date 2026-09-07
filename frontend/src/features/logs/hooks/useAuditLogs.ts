import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuditLog, AuditLogFilters } from '../types/logs.types';
import { logsApi } from '../api/logsApi';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<AuditLogFilters>({
    modulo: '',
    rol: '',
    accion: '',
    estado: '',
    search: '',
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await logsApi.getLogs(filters);
      setLogs(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Acceso denegado. Solo el Superadministrador puede acceder a los registros de auditoría.');
      } else {
        setError('Error al cargar la bitácora de auditoría.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilter = useCallback((key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const exitosos = logs.filter((l) => l.estado === 'EXITOSO').length;
    const fallidos = logs.filter((l) => l.estado === 'DENEGADO' || l.estado === 'ERROR').length;
    const vinculaciones = logs.filter((l) => l.accion === 'VINCULAR_DOCUMENTO_EPISODIO' || l.modulo === 'INGESTA').length;

    return { total, exitosos, fallidos, vinculaciones };
  }, [logs]);

  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilter,
    refetch: fetchLogs,
    stats,
  };
};
