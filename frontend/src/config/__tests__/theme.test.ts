import { describe, it, expect } from 'vitest';
import { INAAQC_THEME } from '../theme';

describe('INAAQC_THEME Configuration', () => {
  it('should have the exact required palette keys', () => {
    expect(INAAQC_THEME.palette).toBeDefined();
    expect(INAAQC_THEME.palette.base).toBe('hsl(208, 36%, 18%)');
    expect(INAAQC_THEME.palette.darkTint).toBe('hsl(208, 20%, 38%)');
    expect(INAAQC_THEME.palette.midTint).toBe('hsl(208, 11%, 61%)');
    expect(INAAQC_THEME.palette.lightTint).toBe('hsl(208, 42%, 73%)');
    expect(INAAQC_THEME.palette.highlight).toBe('hsl(208, 100%, 76%)');
  });

  it('should have status colors with bg, text, and border', () => {
    const statuses = ['alert', 'success', 'warning'] as const;

    statuses.forEach((key) => {
      const item = INAAQC_THEME.status[key];
      expect(item).toBeDefined();
      expect(item.bg).toMatch(/^hsl\(/);
      expect(item.text).toMatch(/^hsl\(/);
      expect(item.border).toMatch(/^hsl\(/);
    });
  });
});
