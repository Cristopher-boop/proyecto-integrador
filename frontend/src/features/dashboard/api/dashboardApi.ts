import { apiClient } from '../../../api/client';
import type { DashboardStats } from '../types/dashboard.types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/clinical/dashboard/stats/');
    return response.data;
  },
};
