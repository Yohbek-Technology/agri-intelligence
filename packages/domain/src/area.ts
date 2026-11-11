export type LandUnit = 'TIMAD' | 'KERT' | 'HECTARE' | 'SQM';

export interface LandUnitConfig {
  timadToHa?: number; // Standard Ethiopian average is 0.25 ha (4 timad = 1 ha)
  kertToHa?: number;  // Regional variant (typically 0.25 ha)
}

const DEFAULT_LAND_CONFIG: Required<LandUnitConfig> = {
  timadToHa: 0.25,
  kertToHa: 0.25,
};

/**
 * Pure function: Converts any supported land unit to hectares.
 */
export function toHectares(
  value: number,
  unit: LandUnit,
  config?: LandUnitConfig
): number {
  if (value < 0) {
    throw new Error('Land area cannot be negative');
  }

  const { timadToHa, kertToHa } = { ...DEFAULT_LAND_CONFIG, ...config };

  switch (unit) {
    case 'HECTARE':
      return Number(value.toFixed(4));
    case 'TIMAD':
      return Number((value * timadToHa).toFixed(4));
    case 'KERT':
      return Number((value * kertToHa).toFixed(4));
    case 'SQM':
      return Number((value / 10000).toFixed(4));
    default: {
      const _exhaustive: never = unit;
      throw new Error(`Unsupported land unit: ${_exhaustive}`);
    }
  }
}

/**
 * Pure function: Converts hectares to the specified target land unit.
 */
export function fromHectares(
  ha: number,
  targetUnit: LandUnit,
  config?: LandUnitConfig
): number {
  if (ha < 0) {
    throw new Error('Hectares cannot be negative');
  }

  const { timadToHa, kertToHa } = { ...DEFAULT_LAND_CONFIG, ...config };

  switch (targetUnit) {
    case 'HECTARE':
      return Number(ha.toFixed(4));
    case 'TIMAD':
      return Number((ha / timadToHa).toFixed(2));
    case 'KERT':
      return Number((ha / kertToHa).toFixed(2));
    case 'SQM':
      return Number((ha * 10000).toFixed(2));
    default: {
      const _exhaustive: never = targetUnit;
      throw new Error(`Unsupported land unit: ${_exhaustive}`);
    }
  }
}

