import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';

export const usePatients = () => {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPacientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getAll();
      setPacientes(data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar los pacientes. Verifica tu conexión o sesión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const toggleStatus = async (id: string, esta_activo: boolean) => {
    if (!window.confirm(`¿Estás seguro de que deseas ${esta_activo ? 'desactivar' : 'activar'} a este paciente?`)) return;
    try {
      if (esta_activo) {
        await patientService.deactivate(id);
      } else {
        await patientService.reactivate(id);
      }
      await fetchPacientes();
    } catch (err) {
      alert('Error al cambiar el estado del paciente.');
    }
  };

  // NUEVO: Funciones de Creación y Edición
  const createPatient = async (data: any) => {
    await patientService.create(data);
    await fetchPacientes(); // Recargamos la tabla al terminar
  };

  const updatePatient = async (id: string, data: any) => {
    await patientService.update(id, data);
    await fetchPacientes(); // Recargamos la tabla al terminar
  };

  return { pacientes, isLoading, error, fetchPacientes, toggleStatus, createPatient, updatePatient };
};