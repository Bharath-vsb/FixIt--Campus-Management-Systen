import api from './api';

export interface StaffManagementItem {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  accountStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'DISABLED' | 'REMOVED';
  createdAt: string;
  activeIssuesCount: number;
  resolvedIssuesCount: number;
}

export const adminStaffService = {
  getStaff: async (status?: string): Promise<StaffManagementItem[]> => {
    const url = status ? `/admin/staff?status=${status}` : '/admin/staff';
    const response = await api.get(url);
    return response.data;
  },

  approveStaff: async (id: number): Promise<void> => {
    await api.post(`/admin/staff/${id}/approve`);
  },

  disableStaff: async (id: number): Promise<void> => {
    await api.post(`/admin/staff/${id}/disable`);
  },

  enableStaff: async (id: number): Promise<void> => {
    await api.post(`/admin/staff/${id}/enable`);
  },

  removeStaff: async (id: number): Promise<void> => {
    await api.post(`/admin/staff/${id}/remove`);
  }
};
