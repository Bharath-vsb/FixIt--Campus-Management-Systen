export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'STAFF';
}

export interface AuthResponse {
  token: string;
  user: User;
}
