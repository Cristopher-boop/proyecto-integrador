import { useState, useEffect, useCallback } from 'react';
import { admissionService } from '../services/admissionService';

export const useAdmissions = (initialEstado: 'activos' | 'inactivos' | 'todos' = 'activos') => {
  const [admisiones, setAdmisiones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'activos' | 'inactivos' | 'todos'>(initialEstado);

  const fetchAdmisiones = useCallback(async (estado = estadoFilter) => {
    setIsLoading(true);
    try {
      const data = await admissionService.getAll(estado);
      setAdmisiones(data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar las admisiones.');
    } finally {
      setIsLoading(false);
    }
  }, [estadoFilter]);

  useEffect(() => { 
    fetchAdmisiones(estadoFilter); 
  }, [fetchAdmisiones, estadoFilter]);

  const toggleStatus = async (id: string, esta_activo: boolean) => {
    if (!window.confirm(`¿Estás seguro de que deseas ${esta_activo ? 'cerrar/dar de baja' : 'reactivar'} este episodio?`)) return;
    try {
      if (esta_activo) await admissionService.deactivate(id);
      else await admissionService.reactivate(id);
      await fetchAdmisiones(estadoFilter);
    } catch (err) {
      alert('Error al cambiar el estado de la admisión.');
    }
  };

  const createAdmission = async (data: any) => { 
    await admissionService.create(data); 
    await fetchAdmisiones(estadoFilter); 
  };
  
  const updateAdmission = async (id: string, data: any) => { 
    await admissionService.update(id, data); 
    await fetchAdmisiones(estadoFilter); 
  };

  return { 
    admisiones, 
    isLoading, 
    error, 
    estadoFilter,
    setEstadoFilter,
    fetchAdmisiones,
    toggleStatus, 
    createAdmission, 
    updateAdmission 
  };
};