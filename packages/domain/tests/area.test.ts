import { describe, it, expect } from 'vitest';
import { toHectares, fromHectares } from '../src/area.js';

describe('area conversion rules', () => {
  it('converts Timad to Hectares (1 Timad = 0.25 ha)', () => {
    expect(toHectares(1, 'TIMAD')).toBe(0.25);
    expect(toHectares(4, 'TIMAD')).toBe(1.0);
    expect(toHectares(10, 'TIMAD')).toBe(2.5);
  });

  it('converts Kert to Hectares (1 Kert = 0.25 ha default)', () => {
    expect(toHectares(2, 'KERT')).toBe(0.5);
  });

  it('converts Square Meters to Hectares (10,000 sqm = 1 ha)', () => {
    expect(toHectares(10000, 'SQM')).toBe(1.0);
    expect(toHectares(2500, 'SQM')).toBe(0.25);
  });

  it('converts Hectares to target units correctly', () => {
    expect(fromHectares(1, 'TIMAD')).toBe(4);
    expect(fromHectares(2.5, 'TIMAD')).toBe(10);
    expect(fromHectares(1, 'SQM')).toBe(10000);
    expect(fromHectares(0.5, 'HECTARE')).toBe(0.5);
  });

  it('throws for negative values', () => {
    expect(() => toHectares(-1, 'TIMAD')).toThrow('Land area cannot be negative');
    expect(() => fromHectares(-2, 'HECTARE')).toThrow('Hectares cannot be negative');
  });

  it('supports custom city/kebele land unit coefficients', () => {
    expect(toHectares(2, 'TIMAD', { timadToHa: 0.33 })).toBe(0.66);
    expect(fromHectares(0.66, 'TIMAD', { timadToHa: 0.33 })).toBe(2);
  });
});

