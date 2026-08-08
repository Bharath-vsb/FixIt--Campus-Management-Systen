import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  storeAuth(authResponse: AuthResponse): void {
    localStorage.setItem('fixit_token', authResponse.token);
    localStorage.setItem('fixit_user', JSON.stringify(authResponse.user));
  },

  clearAuth(): void {
    localStorage.removeItem('fixit_token');
    localStorage.removeItem('fixit_user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('fixit_user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('fixit_token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
