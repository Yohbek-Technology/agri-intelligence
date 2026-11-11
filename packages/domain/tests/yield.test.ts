import { describe, it, expect } from 'vitest';
import { calculateYieldQtHa, calculateYieldGap } from '../src/yield.js';

describe('yield calculations', () => {
  it('calculates yield in quintals per hectare from quintals', () => {
    // 25 quintals harvested from 1.0 ha = 25 Qt/ha
    expect(calculateYieldQtHa(25, 'QUINTAL', 1.0)).toBe(25);
    // 15 quintals harvested from 0.5 ha = 30 Qt/ha
    expect(calculateYieldQtHa(15, 'QUINTAL', 0.5)).toBe(30);
  });

  it('calculates yield in quintals per hectare from kg', () => {
    // 2000 kg = 20 quintals. Over 1.0 ha = 20 Qt/ha
    expect(calculateYieldQtHa(2000, 'KG', 1.0)).toBe(20);
    // 1500 kg = 15 quintals. Over 0.5 ha = 30 Qt/ha
    expect(calculateYieldQtHa(1500, 'KG', 0.5)).toBe(30);
  });

  it('throws when area is zero or negative', () => {
    expect(() => calculateYieldQtHa(10, 'QUINTAL', 0)).toThrow('Area in hectares must be greater than zero');
    expect(() => calculateYieldQtHa(10, 'QUINTAL', -1)).toThrow('Area in hectares must be greater than zero');
  });

  it('calculates yield gap accurately against cohort benchmark', () => {
    // Benchmark is 40 Qt/ha, actual is 20 Qt/ha -> Gap is 20 Qt/ha (50% gap -> SEVERELY_BELOW)
    const gap1 = calculateYieldGap(20, 40);
    expect(gap1.yieldGapQtHa).toBe(20);
    expect(gap1.yieldGapPct).toBe(50);
    expect(gap1.performanceCategory).toBe('SEVERELY_BELOW');

    // Benchmark is 30 Qt/ha, actual is 25 Qt/ha -> Gap is 5 Qt/ha (16.7% gap -> BELOW)
    const gap2 = calculateYieldGap(25, 30);
    expect(gap2.yieldGapQtHa).toBe(5);
    expect(gap2.performanceCategory).toBe('BELOW');

    // Benchmark is 30 Qt/ha, actual is 29 Qt/ha -> 3.3% gap -> ON_TRACK
    const gap3 = calculateYieldGap(29, 30);
    expect(gap3.performanceCategory).toBe('ON_TRACK');

    // Benchmark is 30 Qt/ha, actual is 35 Qt/ha -> -16.7% gap -> ABOVE
    const gap4 = calculateYieldGap(35, 30);
    expect(gap4.performanceCategory).toBe('ABOVE');
  });
});

