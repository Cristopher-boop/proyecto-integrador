import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser, UserRole, LoginCredentials } from '../types/auth.types';
import { authService } from '../api/authService';
import { tokenStorage } from '../utils/tokenStorage';

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser | null | undefined>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => tokenStorage.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = tokenStorage.getUser();
    const authed = tokenStorage.isAuthenticated();
    setUser(storedUser);
    setIsAuthenticated(authed);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser | null | undefined> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const currentUser = response.user || tokenStorage.getUser();
      setUser(currentUser || null);
      setIsAuthenticated(true);
      return currentUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    const currentUser = user || tokenStorage.getUser();
    if (!currentUser) return false;
    if (currentUser.is_superuser || currentUser.rol === 'SUPERADMIN') return true;
    return roles.includes(currentUser.rol);
  }, [user]);

  const activeUser = user || tokenStorage.getUser();
  const activeIsAuthenticated = isAuthenticated || tokenStorage.isAuthenticated();

  const value: AuthContextType = {
    user: activeUser,
    role: activeUser?.rol || null,
    isAuthenticated: activeIsAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
