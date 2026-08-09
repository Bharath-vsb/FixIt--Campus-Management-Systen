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

  /**
   * Create a new issue with required problem photo.
   * Uses FormData — DO NOT set Content-Type manually; Axios handles the multipart boundary.
   */
  create: async (data: {
    title: string;
    description: string;
    category: string;
    location: string;
    urgency: string;
    affectedPeople: number;
  }, photo: File) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('location', data.location);
    formData.append('urgency', data.urgency);
    formData.append('affectedPeople', String(data.affectedPeople));
    formData.append('photo', photo);
    // Override default application/json so Axios sets multipart/form-data + boundary
    const response = await api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: number, data: { status?: string; assignedToId?: number }) => {
    const response = await api.patch(`/issues/${id}`, data);
    return response.data;
  },

  /**
   * Staff uploads resolution photo for their assigned issue.
   * Uses FormData — DO NOT set Content-Type manually.
   */
  uploadResolutionEvidence: async (issueId: number, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    // No manual Content-Type — Axios/browser handles multipart boundary
    const response = await api.post(`/issues/${issueId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Admin verifies a resolved issue.
   */
  verify: async (issueId: number) => {
    const response = await api.post<Issue>(`/issues/${issueId}/verify`);
    return response.data;
  },

  /**
   * Admin requests rework on a resolved issue with a mandatory reason.
   */
  requestRework: async (issueId: number, reason: string) => {
    const response = await api.post<Issue>(`/issues/${issueId}/rework`, { reason });
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
