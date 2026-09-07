import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import axios from 'axios';
import { authService } from '../api/authService';
import { tokenStorage } from '../utils/tokenStorage';

vi.mock('axios');

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
};

describe('authService', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should authenticate user and save tokens upon successful login', async () => {
    const mockResponse = {
      data: {
        access: 'jwt-access-token',
        refresh: 'jwt-refresh-token'
      }
    };
    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.login({
      username: 'doctor1',
      password: 'password123'
    });

    expect(result.access).toBe('jwt-access-token');
    expect(result.refresh).toBe('jwt-refresh-token');
    expect(tokenStorage.getAccessToken()).toBe('jwt-access-token');
    expect(tokenStorage.getRefreshToken()).toBe('jwt-refresh-token');
  });

  it('should purge tokens upon logout', () => {
    tokenStorage.setTokens('access-123', 'refresh-456');
    expect(authService.isAuthenticated()).toBe(true);

    authService.logout();

    expect(authService.isAuthenticated()).toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('should return null if refresh token does not exist', async () => {
    const result = await authService.refreshToken();
    expect(result).toBeNull();
  });
});
