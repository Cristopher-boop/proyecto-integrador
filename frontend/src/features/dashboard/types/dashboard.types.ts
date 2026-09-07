export interface DashboardKpisData {
  pacientes: number;
  episodios: number;
  archivos: number;
  inferencias: number;
}

export interface DocTypeItem {
  name: string;
  value: number;
}

export interface SeverityItem {
  name: string;
  Pacientes: number;
}

export interface DashboardStats {
  kpis: DashboardKpisData;
  docTypesData: DocTypeItem[];
  severityData: SeverityItem[];
}
