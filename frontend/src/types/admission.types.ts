import type { Paciente } from './patient.types';

export interface Admision {
  id_admision: string;
  paciente: string; // UUID del paciente
  numero_episodio: string;
  fecha_ingreso: string;
  fecha_salida?: string | null;
  cama_sala?: string | null;
  peso_ingreso_kg?: number | string | null;
  talla_ingreso_cm?: number | string | null;
  creado_en?: string;
  esta_activo?: boolean;
}

export interface AdmisionConPaciente extends Admision {
  paciente_nombre?: string;
  paciente_detalle?: Paciente;
}

export interface AdmisionFormData {
  paciente: string;
  numero_episodio: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  cama_sala?: string;
  peso_ingreso_kg?: number;
  talla_ingreso_cm?: number;
}
