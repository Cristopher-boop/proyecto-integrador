import { useState, useEffect } from 'react';
import { simulationApi, type EpisodeSelectOption } from '../api/simulationApi';
import type { ObservacionBiomedica } from '../../../types';

export interface VitFrame {
  timeStr: string;
  timestamp: number;
  bpm: number;
  spo2: number | null;
  temp: number | null;
}

export const useBioSimulator = () => {
  const [admisiones, setAdmisiones] = useState<EpisodeSelectOption[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [frames, setFrames] = useState<VitFrame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [simStep, setSimStep] = useState<number>(0);
  const [simStatus, setSimStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');

  // Cargar admisiones
  useEffect(() => {
    const fetchAdmisiones = async () => {
      try {
        const episodes = await simulationApi.getEpisodes();
        setAdmisiones(episodes);
      } catch {
        setError('No se pudo cargar la lista de episodios.');
      }
    };
    fetchAdmisiones();
  }, []);

  // Cargar y procesar datos VIT
  useEffect(() => {
    if (!selectedAdmision) {
      setFrames([]);
      setSimStep(0);
      setSimStatus('idle');
      return;
    }
    
    const fetchVitData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const observations = await simulationApi.getVitalObservations(selectedAdmision);

        // 1. Filtrar solo Vitales
        const isVit = (parametro: string, tipoDb?: string) => {
          const p = (parametro || '').toLowerCase();
          if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión') || p.includes('saturación')) return true;
          if (tipoDb === 'SIGNOS_VITALES') return true;
          return false;
        };
        const vitData = observations.filter((obs: ObservacionBiomedica) => isVit(obs.parametro, obs.tipo_observacion));
        
        // 2. Agrupar por hora exacta
        const timeMap = new Map<string, VitFrame>();
        vitData.forEach((obs: ObservacionBiomedica) => {
          const p = obs.parametro.toLowerCase();
          const time = new Date(obs.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const timestamp = new Date(obs.fecha_hora_registro).getTime();

          if (!timeMap.has(time)) {
            timeMap.set(time, { timeStr: time, timestamp, bpm: 0, spo2: null, temp: null });
          }
          
          const frame = timeMap.get(time)!;
          const val = typeof obs.valor_numerico === 'number' ? obs.valor_numerico : parseFloat(String(obs.valor_numerico || '0'));
          
          if (p.includes('frecuencia')) frame.bpm = val;
          else if (p.includes('saturación') || p.includes('spo2')) frame.spo2 = val;
          else if (p.includes('temperatura')) frame.temp = val;
        });

        // 3. Ordenar cronológicamente y propagar el BPM
        const sortedFrames = Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp);
        for (let i = 1; i < sortedFrames.length; i++) {
          if (sortedFrames[i].bpm === 0 && sortedFrames[i-1].bpm > 0) {
            sortedFrames[i].bpm = sortedFrames[i-1].bpm;
          }
        }

        setFrames(sortedFrames);
        setSimStep(0);
        setSimStatus('idle');

      } catch {
        setError('Error al cargar datos vitales.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVitData();
  }, [selectedAdmision]);

  // Motor del Reproductor
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (simStatus === 'playing') {
      interval = setInterval(() => {
        setSimStep(prev => {
          if (prev >= frames.length - 1) {
            setSimStatus('finished');
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [simStatus, frames.length]);

  const handlePlayPause = () => {
    if (simStatus === 'playing') setSimStatus('paused');
    else {
      if (simStep >= frames.length - 1) setSimStep(0); 
      setSimStatus('playing');
    }
  };

  const handleReset = () => {
    setSimStep(0);
    setSimStatus('idle');
  };

  return {
    admisiones,
    selectedAdmision,
    setSelectedAdmision,
    frames,
    isLoading,
    error,
    simStep,
    simStatus,
    handlePlayPause,
    handleReset,
  };
};
