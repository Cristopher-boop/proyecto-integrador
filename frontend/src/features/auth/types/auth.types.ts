export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id?: string;
  username: string;
  email?: string;
  role?: string;
}
