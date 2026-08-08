import api from './api';
import type { Issue } from '../types';

export const issueService = {
  getAll: async (params?: { status?: string; priority?: string }) => {
    const response = await api.get<Issue[]>('/issues', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Issue>(`/issues/${id}`);
    return response.data;
  },

  getMyIssues: async () => {
    const response = await api.get<Issue[]>('/issues');
    return response.data;
  },

  getAssignedIssues: async () => {
    const response = await api.get<Issue[]>('/issues');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/issues', data);
    return response.data;
  },

  update: async (id: number, data: { status?: string; assignedToId?: number }) => {
    const response = await api.patch(`/issues/${id}`, data);
    return response.data;
  },

  getComments: async (issueId: number) => {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data;
  },

  addComment: async (issueId: number, content: string, isWorkNote: boolean = false) => {
    const response = await api.post(`/issues/${issueId}/comments`, { content, isWorkNote });
    return response.data;
  }
};
