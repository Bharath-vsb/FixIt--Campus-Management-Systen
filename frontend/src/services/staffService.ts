import api from './api';
import type { User } from '../types';

export interface StaffMember extends User {
  assignedCount: number;
  resolvedCount: number;
  status: 'Available' | 'Busy' | 'On Break';
}

export const staffService = {
  async getAll(): Promise<StaffMember[]> {
    const response = await api.get<StaffMember[]>('/staff');
    return response.data;
  },

  async getById(id: number): Promise<StaffMember> {
    const response = await api.get<StaffMember>(`/staff/${id}`);
    return response.data;
  },
};
