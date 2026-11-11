import { describe, it, expect } from 'vitest';
import { filterSafePesticides, type PesticideItem } from '../src/pesticide.js';

describe('filterSafePesticides', () => {
  const samplePesticides: PesticideItem[] = [
    {
      pesticide_id: 'p-1',
      trade_name: 'Rexil Ultra',
      active_ingredient: 'Tebuconazole',
      is_registered: true,
      target_pest_ids: ['pest-rust'],
      target_crop_ids: ['crop-wheat'],
      rain_free_hours: 4,
    },
    {
      pesticide_id: 'p-2',
      trade_name: 'Banned Toxic Chemical',
      active_ingredient: 'DDT',
      is_registered: true,
      is_banned: true,
      target_pest_ids: ['pest-rust'],
      target_crop_ids: ['crop-wheat'],
    },
    {
      pesticide_id: 'p-3',
      trade_name: 'Unregistered Imported Brand',
      active_ingredient: 'Malathion',
      is_registered: false,
      target_pest_ids: ['pest-rust'],
      target_crop_ids: ['crop-wheat'],
    },
    {
      pesticide_id: 'p-4',
      trade_name: 'Coragen',
      active_ingredient: 'Chlorantraniliprole',
      is_registered: true,
      target_pest_ids: ['pest-armyworm'],
      target_crop_ids: ['crop-maize'],
      rain_free_hours: 6,
    },
  ];

  it('recommends valid registered pesticides for target pest and crop', () => {
    const result = filterSafePesticides(samplePesticides, {
      pestId: 'pest-rust',
      cropId: 'crop-wheat',
      forecastHoursUntilRain: 8,
    });

    expect(result.recommended.length).toBe(1);
    expect(result.recommended[0].trade_name).toBe('Rexil Ultra');
  });

  it('rejects banned or unregistered pesticides', () => {
    const result = filterSafePesticides(samplePesticides, {
      pestId: 'pest-rust',
      cropId: 'crop-wheat',
    });

    const reasons = result.rejected.map((r) => r.reason);
    expect(reasons).toContain('Pesticide is banned or restricted by national regulatory authority');
    expect(reasons).toContain('Pesticide is not registered in national database');
  });

  it('rejects chemicals when rain forecast violates rain_free_hours', () => {
    const result = filterSafePesticides(samplePesticides, {
      pestId: 'pest-rust',
      cropId: 'crop-wheat',
      forecastHoursUntilRain: 2, // Only 2h, but Rexil Ultra needs 4h
    });

    expect(result.recommended.length).toBe(0);
    expect(result.rejected.some((r) => r.reason.includes('rain-free window'))).toBe(true);
  });
});

