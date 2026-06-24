import { useState, useEffect, useCallback } from 'react';
import { admissionService } from '../services/admissionService';

export const useAdmissions = () => {
  const [admisiones, setAdmisiones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdmisiones = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await admissionService.getAll();
      setAdmisiones(data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar las admisiones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmisiones(); }, [fetchAdmisiones]);

  const toggleStatus = async (id: string, esta_activo: boolean) => {
    if (!window.confirm(`¿Estás seguro de que deseas ${esta_activo ? 'cerrar/dar de baja' : 'reactivar'} este episodio?`)) return;
    try {
      if (esta_activo) await admissionService.deactivate(id);
      else await admissionService.reactivate(id);
      await fetchAdmisiones();
    } catch (err) {
      alert('Error al cambiar el estado de la admisión.');
    }
  };

  const createAdmission = async (data: any) => { await admissionService.create(data); await fetchAdmisiones(); };
  const updateAdmission = async (id: string, data: any) => { await admissionService.update(id, data); await fetchAdmisiones(); };

  return { admisiones, isLoading, error, toggleStatus, createAdmission, updateAdmission };
};