import { getApiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { User } from '../../../store/types';

const api = getApiClient();

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email?: string;
  password: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User & { password_hash?: string };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Registration failed');
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      api.setToken(null);
      localStorage.removeItem('refresh_token');
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT + '-all');
    } finally {
      api.setToken(null);
      localStorage.removeItem('refresh_token');
    }
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Token refresh failed');
    }
    
    api.setToken(response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);
    
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user');
    }
    return response.data;
  },
};
