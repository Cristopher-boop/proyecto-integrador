import { useState, useEffect } from 'react';
import axios from 'axios';

interface Admision { id_admision: string; numero_episodio: string; paciente_nombre?: string; }
interface Observacion { id_observacion: string; parametro: string; valor_numerico: string; unidad_medida: string | null; rango_referencia_min: string | null; rango_referencia_max: string | null; fecha_hora_registro: string; tipo_observacion?: string; }
interface Archivo { id_archivo: string; nombre_archivo: string; tipo_documento: string; archivo_fisico: string; }

export type FilterType = 'ALL' | 'VIT' | 'GLAS' | 'LAB' | 'PUL';

export const useLaboratory = (episodioUrl?: string) => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Cargar todas las admisiones al montar
  useEffect(() => {
    const fetchAdmisiones = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [pacientesRes, admisionesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/patients/', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const admisionesConNombre = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: any) => p.id_paciente === a.paciente);
          return { ...a, paciente_nombre: px ? `${px.nombres} ${px.apellidos}` : 'Paciente Desconocido' };
        });

        setAdmisiones(admisionesConNombre);

        if (episodioUrl) {
          const adm = admisionesConNombre.find((a: Admision) => a.numero_episodio === episodioUrl);
          if (adm) setSelectedAdmision(adm.id_admision);
        }
      } catch (err) {
        setError('No se pudo cargar la lista de episodios.');
      }
    };
    fetchAdmisiones();
  }, [episodioUrl]);

  useEffect(() => {
    if (!selectedAdmision) {
      setObservaciones([]);
      setArchivos([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [obsRes, archRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/admision/${selectedAdmision}/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/v1/clinical/archivos/?admision_id=${selectedAdmision}`, { headers }).catch(() => ({ data: [] })) // Fallback si no existe la ruta
        ]);

        setObservaciones(obsRes.data);
        setArchivos(archRes.data);
        setActiveFilter('ALL'); 
      } catch (err: any) {
        setError('Error al cargar los datos clínicos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedAdmision]);

  return {
    admisiones, selectedAdmision, setSelectedAdmision,
    archivos, observaciones,
    activeFilter, setActiveFilter,
    isLoading, error
  };
};