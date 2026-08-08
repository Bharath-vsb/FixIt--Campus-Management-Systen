import api from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getStaffStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/staff-stats');
    return response.data;
  },

  async getAdminStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/admin-stats');
    return response.data;
  },
};
