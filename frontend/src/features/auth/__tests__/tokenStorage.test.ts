import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { tokenStorage } from '../utils/tokenStorage';

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
};

describe('tokenStorage utility', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('should return null when no tokens are stored', () => {
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(tokenStorage.isAuthenticated()).toBe(false);
  });

  it('should store and retrieve access and refresh tokens', () => {
    tokenStorage.setTokens('access-token-123', 'refresh-token-456');

    expect(tokenStorage.getAccessToken()).toBe('access-token-123');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token-456');
    expect(tokenStorage.isAuthenticated()).toBe(true);
  });

  it('should update only access token with setAccessToken', () => {
    tokenStorage.setTokens('old-access', 'refresh-123');
    tokenStorage.setAccessToken('new-access');

    expect(tokenStorage.getAccessToken()).toBe('new-access');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-123');
  });

  it('should clear all tokens on clearTokens()', () => {
    tokenStorage.setTokens('access-123', 'refresh-456');
    expect(tokenStorage.isAuthenticated()).toBe(true);

    tokenStorage.clearTokens();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(tokenStorage.isAuthenticated()).toBe(false);
  });
});
