import apiClient from '../../../api/client';
import type { ObservacionBiomedica, Paciente, Admision } from '../../../types';

export interface EpisodeTrendOption {
  id_admision: string;
  numero_episodio: string;
  paciente_nombre: string;
}

export const trendsApi = {
  getEpisodes: async (): Promise<EpisodeTrendOption[]> => {
    const [pacientesRes, admisionesRes] = await Promise.all([
      apiClient.get<Paciente[]>('/patients/'),
      apiClient.get<Admision[]>('/patients/admisiones/')
    ]);

    const pacientes = pacientesRes.data;
    const admisiones = admisionesRes.data;

    return admisiones.map((a) => {
      const px = pacientes.find((p) => p.id_paciente === a.paciente);
      return {
        id_admision: a.id_admision,
        numero_episodio: a.numero_episodio,
        paciente_nombre: px ? `${px.nombres} ${px.apellidos}` : 'Desconocido'
      };
    });
  },

  getObservations: async (admisionId: string): Promise<ObservacionBiomedica[]> => {
    const response = await apiClient.get<ObservacionBiomedica[]>(
      `/clinical/observaciones/admision/${admisionId}/`
    );
    return response.data;
  }
};
