import apiClient from '../../../api/client';
import type { ExpertoData, Paciente, Admision } from '../../../types';

export interface EpisodeOption {
  value: string;
  label: string;
  secondary?: string;
}

export const expertApi = {
  getEpisodeOptions: async (): Promise<EpisodeOption[]> => {
    const [pacientesRes, admisionesRes] = await Promise.all([
      apiClient.get<Paciente[]>('/patients/'),
      apiClient.get<Admision[]>('/patients/admisiones/')
    ]);

    const pacientes = pacientesRes.data;
    const admisiones = admisionesRes.data;

    return admisiones.map((adm) => {
      const px = pacientes.find((p) => p.id_paciente === adm.paciente);
      const nombre = px ? `${px.nombres} ${px.apellidos}` : 'Paciente Desconocido';
      return {
        value: adm.numero_episodio,
        label: adm.numero_episodio,
        secondary: nombre,
      };
    });
  },

  getExpertData: async (numeroEpisodio: string): Promise<ExpertoData> => {
    const response = await apiClient.get<ExpertoData>('/clinical/expert-system/data/', {
      params: { numero_episodio: numeroEpisodio }
    });
    return response.data;
  }
};
