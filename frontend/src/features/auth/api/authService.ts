import axios from 'axios';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';
import { tokenStorage } from '../utils/tokenStorage';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://127.0.0.1:8000/api';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${AUTH_BASE_URL}/token/`, credentials);
    const { access, refresh, user } = response.data;
    tokenStorage.setTokens(access, refresh);
    if (user) {
      tokenStorage.setUser(user);
    }
    return response.data;
  },

  refreshToken: async (): Promise<string | null> => {
    const refresh = tokenStorage.getRefreshToken();
    if (!refresh) return null;

    try {
      const response = await axios.post<{ access: string }>(`${AUTH_BASE_URL}/token/refresh/`, {
        refresh,
      });
      tokenStorage.setAccessToken(response.data.access);
      return response.data.access;
    } catch {
      tokenStorage.clearTokens();
      return null;
    }
  },

  logout: (): void => {
    tokenStorage.clearTokens();
  },

  isAuthenticated: (): boolean => {
    return tokenStorage.isAuthenticated();
  },

  getUser: () => {
    return tokenStorage.getUser();
  },

  getRole: () => {
    return tokenStorage.getRole();
  },
};
