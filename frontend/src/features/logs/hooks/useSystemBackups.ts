import { useState, useEffect, useCallback } from 'react';
import type { SystemBackup, BackupScheduleStatus } from '../types/logs.types';
import { logsApi } from '../api/logsApi';

export function useSystemBackups() {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [scheduleStatus, setScheduleStatus] = useState<BackupScheduleStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [backupsData, statusData] = await Promise.all([
        logsApi.getBackups(),
        logsApi.getScheduleStatus(),
      ]);
      setBackups(backupsData);
      setScheduleStatus(statusData);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al cargar respaldos del sistema.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const generateBackup = async (notas: string = '') => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccessMessage(null);
      const newBackup = await logsApi.generateBackup(notas, 'MANUAL_SUPERADMIN');
      setSuccessMessage(`¡Respaldo ${newBackup.nombre_archivo} generado con éxito!`);
      await fetchBackups();
      return newBackup;
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al generar el respaldo.');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBackup = async (idBackup: string, filename: string) => {
    try {
      setDownloadingId(idBackup);
      setError(null);
      await logsApi.downloadBackup(idBackup, filename);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al descargar el archivo.');
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    backups,
    scheduleStatus,
    isLoading,
    isGenerating,
    downloadingId,
    error,
    successMessage,
    setSuccessMessage,
    refetch: fetchBackups,
    generateBackup,
    downloadBackup,
  };
}
