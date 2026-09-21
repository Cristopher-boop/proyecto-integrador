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

  it('should have the official 10-shade monochromatic scale in hex', () => {
    expect(INAAQC_THEME.scale).toBeDefined();
    expect(INAAQC_THEME.scale[900]).toBe('#1E3040');
    expect(INAAQC_THEME.scale[800]).toBe('#334759');
    expect(INAAQC_THEME.scale[700]).toBe('#4D6173');
    expect(INAAQC_THEME.scale[600]).toBe('#6C7D8C');
    expect(INAAQC_THEME.scale[500]).toBe('#909CA6');
    expect(INAAQC_THEME.scale[400]).toBe('#9FB0BF');
    expect(INAAQC_THEME.scale[300]).toBe('#9EBDD9');
    expect(INAAQC_THEME.scale[200]).toBe('#99C8F2');
    expect(INAAQC_THEME.scale[100]).toBe('#87C7FF');
    expect(INAAQC_THEME.scale[50]).toBe('#6EBBFF');
  });
});
