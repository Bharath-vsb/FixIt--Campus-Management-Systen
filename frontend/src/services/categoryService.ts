import api from './api';

export interface Category {
  id: number;
  name: string;
  icon: string;
  issueCount: number;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  create: async (name: string, icon: string = 'category'): Promise<Category> => {
    const response = await api.post<Category>('/categories', { name, icon });
    return response.data;
  },

  update: async (id: number, name: string, icon?: string): Promise<void> => {
    await api.put(`/categories/${id}`, { name, icon });
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};
