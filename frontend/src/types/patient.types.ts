export type Sexo = 'M' | 'F' | 'U';

export interface Paciente {
  id_paciente: string;
  dossier_erasme: string;
  dossier_mpi?: string | null;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: string | null;
  sexo?: Sexo | null;
  creado_en?: string;
  esta_activo?: boolean;
}

export interface PacienteFormData {
  dossier_erasme: string;
  dossier_mpi?: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: string;
  sexo?: Sexo;
}
