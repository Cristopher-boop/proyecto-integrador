import { describe, it, expect } from 'vitest';
import { apiClient } from '../client';

describe('apiClient', () => {
  it('should be defined and have default headers', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have a configured timeout', () => {
    expect(apiClient.defaults.timeout).toBe(30000);
  });
});
