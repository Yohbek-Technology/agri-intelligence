export type WeightUnit = 'KG' | 'QUINTAL';

export type YieldPerformanceCategory = 'SEVERELY_BELOW' | 'BELOW' | 'ON_TRACK' | 'ABOVE';

export interface YieldGapResult {
  actualYieldQtHa: number;
  benchmarkYieldQtHa: number;
  yieldGapQtHa: number;     // benchmark - actual (positive means gap exists)
  yieldGapPct: number;      // % gap relative to benchmark
  performanceCategory: YieldPerformanceCategory;
}

/**
 * Pure function: Calculates yield in Quintals per Hectare (Qt/ha).
 * Note: 1 Quintal = 100 kg.
 */
export function calculateYieldQtHa(
  harvestAmount: number,
  unit: WeightUnit,
  areaHectares: number
): number {
  if (harvestAmount < 0) {
    throw new Error('Harvest amount cannot be negative');
  }
  if (areaHectares <= 0) {
    throw new Error('Area in hectares must be greater than zero');
  }

  const amountInQuintals = unit === 'QUINTAL' ? harvestAmount : harvestAmount / 100;
  const yieldQtHa = amountInQuintals / areaHectares;
  return Number(yieldQtHa.toFixed(2));
}

/**
 * Pure function: Calculates yield gap against cohort or potential benchmark.
 */
export function calculateYieldGap(
  actualYieldQtHa: number,
  benchmarkYieldQtHa: number
): YieldGapResult {
  if (actualYieldQtHa < 0 || benchmarkYieldQtHa <= 0) {
    throw new Error('Yield values must be non-negative, and benchmark must be > 0');
  }

  const gap = benchmarkYieldQtHa - actualYieldQtHa;
  const gapPct = (gap / benchmarkYieldQtHa) * 100;

  let performanceCategory: YieldPerformanceCategory;
  if (gapPct > 35) {
    performanceCategory = 'SEVERELY_BELOW';
  } else if (gapPct > 10) {
    performanceCategory = 'BELOW';
  } else if (gapPct >= -10) {
    performanceCategory = 'ON_TRACK';
  } else {
    performanceCategory = 'ABOVE';
  }

  return {
    actualYieldQtHa: Number(actualYieldQtHa.toFixed(2)),
    benchmarkYieldQtHa: Number(benchmarkYieldQtHa.toFixed(2)),
    yieldGapQtHa: Number(gap.toFixed(2)),
    yieldGapPct: Number(gapPct.toFixed(1)),
    performanceCategory,
  };
}

