import { describe, it, expect } from 'vitest';
import { classifyAgroZone } from '../src/zone.js';

describe('classifyAgroZone', () => {
  it('classifies Bereha for altitudes below 500m', () => {
    expect(classifyAgroZone(400)).toBe('BEREHA');
  });

  it('classifies Kolla for altitudes between 500m and 1500m', () => {
    expect(classifyAgroZone(500)).toBe('KOLLA');
    expect(classifyAgroZone(1200)).toBe('KOLLA');
    expect(classifyAgroZone(1499)).toBe('KOLLA');
  });

  it('classifies Weyna Dega for altitudes between 1500m and 2300m', () => {
    expect(classifyAgroZone(1500)).toBe('WEYNA_DEGA');
    expect(classifyAgroZone(1900)).toBe('WEYNA_DEGA');
    expect(classifyAgroZone(2299)).toBe('WEYNA_DEGA');
  });

  it('classifies Dega for altitudes between 2300m and 3200m', () => {
    expect(classifyAgroZone(2300)).toBe('DEGA');
    expect(classifyAgroZone(2800)).toBe('DEGA');
    expect(classifyAgroZone(3199)).toBe('DEGA');
  });

  it('classifies Wurch for alpine altitudes 3200m and above', () => {
    expect(classifyAgroZone(3200)).toBe('WURCH');
    expect(classifyAgroZone(3800)).toBe('WURCH');
  });

  it('respects custom office config bounds', () => {
    expect(classifyAgroZone(1700, { kollaMaxM: 1800 })).toBe('KOLLA');
    expect(classifyAgroZone(2100, { degaMinM: 2000 })).toBe('DEGA');
  });
});

