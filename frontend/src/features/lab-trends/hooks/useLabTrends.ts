import { useState, useEffect, useMemo } from 'react';
import { trendsApi, type EpisodeTrendOption } from '../api/trendsApi';
import type { ObservacionBiomedica } from '../../../types';

export const COLOR_PALETTE = ['#4f46e5', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export interface VisibleChartItem {
  parametro: string;
  color: string;
  data: { timeStr: string; valor: number }[];
  min: number | null;
  max: number | null;
  unidad: string;
}

export const useLabTrends = () => {
  const [admisiones, setAdmisiones] = useState<EpisodeTrendOption[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [observaciones, setObservaciones] = useState<ObservacionBiomedica[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [uniqueTimes, setUniqueTimes] = useState<string[]>([]);
  const [simStep, setSimStep] = useState<number>(0);
  const [simStatus, setSimStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('finished');

  // 1. Cargar episodios
  useEffect(() => {
    const fetchAdmisiones = async () => {
      try {
        const episodes = await trendsApi.getEpisodes();
        setAdmisiones(episodes);
      } catch {
        setError('No se pudo cargar la lista de episodios.');
      }
    };
    fetchAdmisiones();
  }, []);

  // 2. Cargar datos y agrupar por tiempos
  useEffect(() => {
    if (!selectedAdmision) {
      setObservaciones([]);
      setUniqueTimes([]);
      return;
    }
    const fetchObservaciones = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await trendsApi.getObservations(selectedAdmision);

        // Filtro estricto de LAB
        const isLab = (parametro: string, tipoDb?: string) => {
          const p = (parametro || '').toLowerCase();
          if (p.includes('glasgow') || p.includes('coma')) return false; 
          if (p.includes('ph') || p.includes('pco2') || p.includes('po2') || p.includes('lactato') || p.includes('exceso de base') || p.includes('arterial') || p.includes('venoso') || p.includes('gases')) return false; 
          if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión arterial') || p === 'saturación de oxígeno') return false; 
          if (tipoDb === 'SIGNOS_VITALES' || tipoDb === 'NEUROLOGICO' || tipoDb === 'PULMONAR') return false;
          return true; 
        };

        const labOnly = data.filter((obs) => isLab(obs.parametro, obs.tipo_observacion));
        const sortedData = labOnly.sort((a, b) => 
          new Date(a.fecha_hora_registro).getTime() - new Date(b.fecha_hora_registro).getTime()
        );
        
        const times: string[] = Array.from(new Set(sortedData.map((obs) => obs.fecha_hora_registro)));
        
        setObservaciones(sortedData);
        setUniqueTimes(times);
        setSimStep(times.length);
        setSimStatus('finished');

      } catch {
        setError('Error al cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservaciones();
  }, [selectedAdmision]);

  // 3. Motor del Reproductor
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (simStatus === 'playing') {
      interval = setInterval(() => {
        setSimStep((prev) => {
          if (prev >= uniqueTimes.length) {
            setSimStatus('finished');
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [simStatus, uniqueTimes.length]);

  const handlePlayPause = () => {
    if (simStatus === 'playing') setSimStatus('paused');
    else {
      if (simStep >= uniqueTimes.length) setSimStep(1); 
      setSimStatus('playing');
    }
  };

  const handleSkipToEnd = () => {
    setSimStep(uniqueTimes.length);
    setSimStatus('finished');
  };

  const handleReset = () => {
    setSimStep(0);
    setSimStatus('idle');
  };

  const visibleData = useMemo(() => {
    if (uniqueTimes.length === 0) return [];
    const cutoffTime = uniqueTimes[simStep - 1]; 
    if (!cutoffTime) return [];
    return observaciones.filter(obs => new Date(obs.fecha_hora_registro).getTime() <= new Date(cutoffTime).getTime());
  }, [uniqueTimes, simStep, observaciones]);

  const visibleCharts = useMemo((): VisibleChartItem[] => {
    const parameters = Array.from(new Set(observaciones.map(obs => obs.parametro)));

    return parameters.map((param, index) => {
      const records = visibleData
        .filter(obs => obs.parametro === param)
        .map(obs => ({
          timeStr: new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          valor: typeof obs.valor_numerico === 'number' ? obs.valor_numerico : parseFloat(String(obs.valor_numerico || '0')),
        }));

      const allRecordsForParam = observaciones.filter(obs => obs.parametro === param);
      const globalMin = allRecordsForParam[0]?.rango_referencia_min ? parseFloat(String(allRecordsForParam[0].rango_referencia_min)) : null;
      const globalMax = allRecordsForParam[0]?.rango_referencia_max ? parseFloat(String(allRecordsForParam[0].rango_referencia_max)) : null;

      return {
        parametro: param,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
        data: records,
        min: globalMin,
        max: globalMax,
        unidad: allRecordsForParam[0]?.unidad_medida || 'Unidades'
      };
    });
  }, [visibleData, observaciones]);

  const masterData = useMemo(() => {
    const timeBuckets: { [key: string]: Record<string, string | number> } = {};
    
    visibleData.forEach(obs => {
      const time = new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!timeBuckets[time]) timeBuckets[time] = { timeStr: time };
      timeBuckets[time][obs.parametro] = typeof obs.valor_numerico === 'number' 
        ? obs.valor_numerico 
        : parseFloat(String(obs.valor_numerico || '0'));
    });

    return Object.values(timeBuckets);
  }, [visibleData]);

  return {
    admisiones,
    selectedAdmision,
    setSelectedAdmision,
    observaciones,
    isLoading,
    error,
    uniqueTimes,
    simStep,
    simStatus,
    handlePlayPause,
    handleSkipToEnd,
    handleReset,
    visibleCharts,
    masterData,
  };
};
