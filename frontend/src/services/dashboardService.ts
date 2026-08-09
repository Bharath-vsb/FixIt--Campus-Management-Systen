import api from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  getAdminStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/admin');
    return response.data;
  },

  getStaffStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/staff');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },

  getStudentStats: async () => {
    throw new Error('Not implemented. Derive locally.');
  }
};
