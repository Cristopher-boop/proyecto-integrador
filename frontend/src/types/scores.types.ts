import type { ComorbilidadItem, SoporteItem, DiagnosticoItem } from './clinical.types';

export interface SofaOrganScores {
  respiratorio: number;
  coagulacion: number;
  hepatico: number;
  cardiovascular: number;
  neurologico: number;
  renal: number;
  total: number;
}

export interface Saps3Score {
  puntos: number;
  mortalidad_estimada: number;
}

export interface PuntajesEpisodio {
  admision_id: string;
  sofa: SofaOrganScores;
  saps3: Saps3Score;
  datos_insuficientes: boolean;
  ultima_actualizacion?: string;
}

export interface ExpertoData {
  sofa: number;
  saps3: number;
  mortalidad: number;
  datosInsuficientes: boolean;
  comorbilidades: ComorbilidadItem[];
  soportes: SoporteItem[];
  diagnosticos: DiagnosticoItem[];
}
