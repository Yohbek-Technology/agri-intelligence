export type AgroZone = 'BEREHA' | 'KOLLA' | 'WEYNA_DEGA' | 'DEGA' | 'WURCH';

export interface AgroZoneConfig {
  berehaMaxM?: number;
  kollaMaxM?: number;
  degaMinM?: number;
  wurchMinM?: number;
}

const DEFAULT_ZONE_CONFIG: Required<AgroZoneConfig> = {
  berehaMaxM: 500,
  kollaMaxM: 1500,
  degaMinM: 2300,
  wurchMinM: 3200,
};

/**
 * Pure function: Classifies Ethiopian agro-ecological zone from altitude in meters.
 * Traditional agro-climatic zones of Ethiopia:
 * - Bereha (arid lowland): < 500m
 * - Kolla (lowland): 500m - 1500m
 * - Weyna Dega (midland): 1500m - 2300m
 * - Dega (highland): 2300m - 3200m
 * - Wurch (cold alpine): >= 3200m
 */
export function classifyAgroZone(altitudeM: number, config?: AgroZoneConfig): AgroZone {
  const merged = { ...DEFAULT_ZONE_CONFIG, ...config };

  if (altitudeM >= merged.wurchMinM) {
    return 'WURCH';
  }
  if (altitudeM >= merged.degaMinM) {
    return 'DEGA';
  }
  if (altitudeM >= merged.kollaMaxM) {
    return 'WEYNA_DEGA';
  }
  if (altitudeM < merged.berehaMaxM) {
    return 'BEREHA';
  }
  return 'KOLLA';
}

