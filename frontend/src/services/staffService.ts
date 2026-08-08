import api from './api';

export interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  status: 'Available' | 'Busy' | 'On Break';
  assignedCount: number;
  resolvedCount: number;
}

export const staffService = {
  getAll: async () => {
    const response = await api.get<StaffMember[]>('/staff');
    return response.data;
  }
};
