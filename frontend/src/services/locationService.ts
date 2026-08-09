import api from './api';

export interface Location {
  id: number;
  name: string;
  building: string;
  issueCount: number;
}

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    const response = await api.get<Location[]>('/locations');
    return response.data;
  },

  create: async (name: string, building: string = ''): Promise<Location> => {
    const response = await api.post<Location>('/locations', { name, building });
    return response.data;
  },

  update: async (id: number, name: string, building?: string): Promise<void> => {
    await api.put(`/locations/${id}`, { name, building });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}`);
  }
};
