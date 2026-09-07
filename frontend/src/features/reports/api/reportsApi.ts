import apiClient from '../../../api/client';

export interface ReportData {
  kpis: {
    mortalidad_promedio: number;
    sofa_promedio: number;
    precision_ia: number;
  };
  comorbiditiesData: { nombre: string; pacientes: number }[];
  sofaRadarData: { organo: string; valorPromedio: number; fullMark: number }[];
  mortalityData: { mes: string; prediccionSAPS: number; promedioSOFA: number }[];
}

export const reportsApi = {
  getReportData: async (): Promise<ReportData> => {
    const response = await apiClient.get<ReportData>('/clinical/reports/data/');
    return response.data;
  },

  exportReport: async (reportType: string, isPdf: boolean = false): Promise<void> => {
    const response = await apiClient.get<Blob>('/clinical/reports/export/', {
      params: { type: reportType },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const ext = isPdf ? 'pdf' : 'xlsx';
    link.setAttribute('download', `Reporte_INAAQC_${reportType.toUpperCase()}.${ext}`);
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
};
