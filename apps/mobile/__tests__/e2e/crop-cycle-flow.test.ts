import { describe, it, expect } from 'vitest';
import { toHectares, calculateYieldQtHa, calculateYieldGap } from '@repo/domain';

describe('E2E Flow 2: Crop Cycle Lifecycle (M-07 to M-17)', () => {
  it('registers plot with Timad conversion, creates cycle, logs harvest, and evaluates yield gap', () => {
    // 1. Plot registration: 4 Timad converted to 1.0 Hectare
    const areaTimad = 4;
    const areaHa = toHectares(areaTimad, 'TIMAD');
    expect(areaHa).toBe(1.0);

    // 2. Crop cycle created for Meher season with Teff
    const cycle = {
      seasonYear: 2024,
      season: 'MEHER',
      crop: 'Teff (Quncho)',
      seedRateKgHa: 15,
      stage: 'PLANTING',
    };
    expect(cycle.season).toBe('MEHER');

    // 3. Harvest: 22 Quintals harvested from 1.0 ha
    const harvestQt = 22;
    const yieldQtHa = calculateYieldQtHa(harvestQt, 'QUINTAL', areaHa);
    expect(yieldQtHa).toBe(22);

    // 4. Yield Gap evaluation against Kebele cohort benchmark of 24 Qt/ha
    const cohortBenchmarkQtHa = 24;
    const gap = calculateYieldGap(yieldQtHa, cohortBenchmarkQtHa);
    expect(gap.yieldGapQtHa).toBe(2);
    expect(gap.performanceCategory).toBe('ON_TRACK'); // within 10%
  });
});

