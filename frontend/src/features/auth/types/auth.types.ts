export type UserRole = 'TI' | 'INVESTIGADOR' | 'DOCTOR' | 'SUPERADMIN' | 'ANALISTA';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id?: string | number;
  username: string;
  email?: string;
  rol: UserRole;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: AuthUser;
}
