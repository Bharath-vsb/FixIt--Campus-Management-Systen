import api from './api';
import type { Issue, CreateIssueRequest, CreateIssueResponse, UpdateIssueRequest, Comment } from '../types';

export const issueService = {
  async getAll(params?: { status?: string; priority?: string; assignedTo?: number }): Promise<Issue[]> {
    const response = await api.get<Issue[]>('/issues', { params });
    return response.data;
  },

  async getById(id: number): Promise<Issue> {
    const response = await api.get<Issue>(`/issues/${id}`);
    return response.data;
  },

  async create(data: CreateIssueRequest): Promise<CreateIssueResponse> {
    const response = await api.post<CreateIssueResponse>('/issues', data);
    return response.data;
  },

  async update(id: number, data: UpdateIssueRequest): Promise<Issue> {
    const response = await api.put<Issue>(`/issues/${id}`, data);
    return response.data;
  },

  async getComments(issueId: number): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/issues/${issueId}/comments`);
    return response.data;
  },

  async addComment(issueId: number, content: string, isWorkNote: boolean = false): Promise<Comment> {
    const response = await api.post<Comment>(`/issues/${issueId}/comments`, { content, isWorkNote });
    return response.data;
  },

  async getMyIssues(): Promise<Issue[]> {
    const response = await api.get<Issue[]>('/issues/my');
    return response.data;
  },

  async getAssignedIssues(): Promise<Issue[]> {
    const response = await api.get<Issue[]>('/issues/assigned');
    return response.data;
  },
};
