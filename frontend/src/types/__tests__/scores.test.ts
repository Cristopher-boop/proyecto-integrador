import { describe, it, expect } from 'vitest';
import type { SofaOrganScores, Saps3Score } from '../scores.types';

describe('Scores Domain Models', () => {
  it('should validate SOFA organ score constraints (sum of systems)', () => {
    const scores: SofaOrganScores = {
      respiratorio: 3,
      coagulacion: 2,
      hepatico: 1,
      cardiovascular: 3,
      neurologico: 2,
      renal: 1,
      total: 12
    };

    const calculatedTotal =
      scores.respiratorio +
      scores.coagulacion +
      scores.hepatico +
      scores.cardiovascular +
      scores.neurologico +
      scores.renal;

    expect(scores.total).toBe(calculatedTotal);
    expect(scores.total).toBeLessThanOrEqual(24);
    expect(scores.total).toBeGreaterThanOrEqual(0);
  });

  it('should validate SAPS 3 mortality percentage bounds', () => {
    const saps3: Saps3Score = {
      puntos: 65,
      mortalidad_estimada: 42.5
    };

    expect(saps3.mortalidad_estimada).toBeGreaterThanOrEqual(0);
    expect(saps3.mortalidad_estimada).toBeLessThanOrEqual(100);
  });
});
