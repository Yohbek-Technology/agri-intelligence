export type AreaUnit = 'timad' | 'kert' | 'hectare';

export interface OfficeUnitFactors {
  timadToHa: number;
  kertToHa: number;
  hectareToHa: number;
}

export const DEFAULT_UNIT_FACTORS: OfficeUnitFactors = {
  timadToHa: 0.25, // SRS default: 1 Timad = 0.25 Hectares
  kertToHa: 0.125, // SRS default: 1 Kert = 0.125 Hectares (~half a timad)
  hectareToHa: 1.0,
};

/**
 * Normalizes any entered local land unit into standardized hectares.
 */
export function normalizeToHectares(
  areaValue: number,
  unit: AreaUnit,
  factors: Partial<OfficeUnitFactors> = {}
): number {
  if (areaValue <= 0) return 0;

  const resolvedFactors = { ...DEFAULT_UNIT_FACTORS, ...factors };

  let factor = 1.0;
  switch (unit) {
    case 'timad':
      factor = resolvedFactors.timadToHa;
      break;
    case 'kert':
      factor = resolvedFactors.kertToHa;
      break;
    case 'hectare':
    default:
      factor = resolvedFactors.hectareToHa;
      break;
  }

  return Number((areaValue * factor).toFixed(4));
}

/**
 * Formats hectares back into the user's preferred local unit for display.
 */
export function formatFromHectares(
  areaHectares: number,
  targetUnit: AreaUnit,
  factors: Partial<OfficeUnitFactors> = {}
): number {
  if (areaHectares <= 0) return 0;

  const resolvedFactors = { ...DEFAULT_UNIT_FACTORS, ...factors };

  let factor = 1.0;
  switch (targetUnit) {
    case 'timad':
      factor = resolvedFactors.timadToHa;
      break;
    case 'kert':
      factor = resolvedFactors.kertToHa;
      break;
    case 'hectare':
    default:
      factor = resolvedFactors.hectareToHa;
      break;
  }

  return Number((areaHectares / factor).toFixed(2));
}
