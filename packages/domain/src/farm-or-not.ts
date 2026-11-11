export interface WeatherConditions {
  temperatureC: number;
  windSpeedKmh: number;
  precipitationMm: number;
  rainProbabilityPct: number;
  forecastHoursUntilRain?: number;
  soilMoistureStatus?: 'DRY' | 'OPTIMAL' | 'WATERLOGGED';
}

export interface FarmOrNotConfig {
  sprayWindMaxKmh?: number;
  sprayWashoffHours?: number;
  harvestRainProbMaxPct?: number;
  frostMinC?: number;
  downpourMmPerDay?: number;
}

export interface AdvisoryDecision {
  canProceed: boolean;
  code: 'GO' | 'WAIT';
  reasonKey: string;
  defaultReason: string;
}

export interface FarmOrNotEvaluation {
  plowing: AdvisoryDecision;
  spraying: AdvisoryDecision;
  harvesting: AdvisoryDecision;
}

const DEFAULT_WEATHER_CONFIG: Required<FarmOrNotConfig> = {
  sprayWindMaxKmh: 15,
  sprayWashoffHours: 6,
  harvestRainProbMaxPct: 20,
  frostMinC: 2,
  downpourMmPerDay: 35,
};

/**
 * Pure function: Evaluates daily Farm-or-Not advisories for Plowing, Spraying, and Harvesting
 * against micro-climate agro-meteorological thresholds.
 */
export function evaluateFarmOrNot(
  weather: WeatherConditions,
  config?: FarmOrNotConfig
): FarmOrNotEvaluation {
  const cfg = { ...DEFAULT_WEATHER_CONFIG, ...config };

  // 1. Plowing Decision
  let plowing: AdvisoryDecision;
  if (weather.precipitationMm >= cfg.downpourMmPerDay) {
    plowing = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.plowWaitHeavyRain',
      defaultReason: `Heavy downpour (${weather.precipitationMm}mm) will cause severe soil compaction.`,
    };
  } else if (weather.soilMoistureStatus === 'WATERLOGGED') {
    plowing = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.plowWaitWaterlogged',
      defaultReason: 'Soil is waterlogged. Wait for Koticha/Vertisol to drain.',
    };
  } else {
    plowing = {
      canProceed: true,
      code: 'GO',
      reasonKey: 'weather.plowGoGoodCondition',
      defaultReason: 'Soil condition is favorable for plowing and seedbed preparation.',
    };
  }

  // 2. Spraying Decision
  let spraying: AdvisoryDecision;
  if (weather.windSpeedKmh > cfg.sprayWindMaxKmh) {
    spraying = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.sprayWaitHighWind',
      defaultReason: `Wind speed (${weather.windSpeedKmh} km/h) exceeds safe threshold (${cfg.sprayWindMaxKmh} km/h), causing chemical drift.`,
    };
  } else if (
    weather.forecastHoursUntilRain !== undefined &&
    weather.forecastHoursUntilRain < cfg.sprayWashoffHours
  ) {
    spraying = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.sprayWaitWashoffRisk',
      defaultReason: `Rain expected in ${weather.forecastHoursUntilRain}h. Minimum washoff window is ${cfg.sprayWashoffHours}h.`,
    };
  } else if (weather.rainProbabilityPct > 40) {
    spraying = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.sprayWaitHighRainProb',
      defaultReason: `High probability of rain (${weather.rainProbabilityPct}%) will dilute chemicals.`,
    };
  } else {
    spraying = {
      canProceed: true,
      code: 'GO',
      reasonKey: 'weather.sprayGoGoodCondition',
      defaultReason: 'Wind and rain conditions are ideal for safe chemical application.',
    };
  }

  // 3. Harvesting Decision
  let harvesting: AdvisoryDecision;
  if (weather.rainProbabilityPct > cfg.harvestRainProbMaxPct) {
    harvesting = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.harvestWaitRainRisk',
      defaultReason: `Rain probability (${weather.rainProbabilityPct}%) exceeds safe threshold (${cfg.harvestRainProbMaxPct}%). Avoid damp harvest mold.`,
    };
  } else if (weather.precipitationMm > 5) {
    harvesting = {
      canProceed: false,
      code: 'WAIT',
      reasonKey: 'weather.harvestWaitPrecipitation',
      defaultReason: 'Recent rainfall detected. Grains require dry drying conditions.',
    };
  } else {
    harvesting = {
      canProceed: true,
      code: 'GO',
      reasonKey: 'weather.harvestGoDryWeather',
      defaultReason: 'Dry conditions are optimal for harvest and threshing.',
    };
  }

  return { plowing, spraying, harvesting };
}

