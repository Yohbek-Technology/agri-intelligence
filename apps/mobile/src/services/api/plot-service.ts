import { apiRequest, ServiceResult } from './client';
import { API_ENDPOINTS } from '@/config/env';
import { syncQueue } from '@/database/sync/sync-queue';
import { normalizeToHectares, AreaUnit } from '@/utils/unit-converter';

export interface Plot {
  id: string;
  cityOfficeId?: string;
  farmerId?: string;
  name: string;
  areaValue: number | string;
  areaUnit: AreaUnit;
  hectaresPerUnitApplied?: number | string;
  areaHectares?: number | string;
  centroidLatitude: number | string;
  centroidLongitude: number | string;
  gpsAccuracyMeters: number | string;
  elevationMeters: number;
  agroZone: 'kolla' | 'weyna_dega' | 'dega';
  agroZoneDerived?: 'kolla' | 'weyna_dega' | 'dega';
  soilClass?: string;
  drainage?: string;
  plannedCropId?: string;
  plannedSeasonYear?: number;
  status: 'active' | 'archived';
  createdAt?: string | number;
  activeCycle?: {
    id: string;
    cropId?: string;
    cropName?: string;
    stage?: string;
    seasonYear?: number;
    startedOn?: string;
    daysAfterSowing?: number;
    progressPct?: number;
  } | null;
  cropHistory?: Array<{
    id: string;
    seasonYear: number;
    cropName?: string;
    cropId?: string;
    fallow: boolean;
    yieldQtPerHa?: number;
  }>;
  isOfflineOnly?: boolean;
}

export interface RegisterPlotPayload {
  name: string;
  areaValue: number;
  areaUnit: AreaUnit;
  centroidLatitude: number;
  centroidLongitude: number;
  gpsAccuracyMeters: number;
  elevationMeters?: number;
  agroZone?: 'kolla' | 'weyna_dega' | 'dega';
  soilClass?: string;
  drainage?: string;
  plannedCropId?: string;
  plannedCropName?: string;
  plannedSeasonYear?: number;
}

// Local in-memory / cache fallback for offline usage
let cachedPlots: Plot[] = [
  {
    id: 'plot-default-1',
    name: 'ታሕተዋይ መሬት (Lower Field)',
    areaValue: 2.0,
    areaUnit: 'timad',
    hectaresPerUnitApplied: 0.25,
    areaHectares: 0.5,
    centroidLatitude: 8.5411,
    centroidLongitude: 39.2704,
    gpsAccuracyMeters: 8.5,
    elevationMeters: 1710,
    agroZone: 'weyna_dega',
    agroZoneDerived: 'weyna_dega',
    soilClass: 'koticha_vertisol',
    drainage: 'waterlogs',
    status: 'active',
    activeCycle: {
      id: 'cycle-1',
      cropName: 'ስርናይ (Wheat)',
      stage: 'vegetative',
      seasonYear: 2024,
      startedOn: '2024-06-15',
      daysAfterSowing: 42,
      progressPct: 46,
    },
    cropHistory: [
      { id: 'h-1', seasonYear: 2023, cropName: 'Wheat (Dega)', fallow: false, yieldQtPerHa: 24 },
      { id: 'h-2', seasonYear: 2022, cropName: 'Chickpea / Haricot Bean', fallow: false },
    ],
  },
  {
    id: 'plot-default-2',
    name: 'ጎቦ መሬት (Hillside Plot)',
    areaValue: 4.0,
    areaUnit: 'timad',
    hectaresPerUnitApplied: 0.25,
    areaHectares: 1.0,
    centroidLatitude: 8.5492,
    centroidLongitude: 39.2815,
    gpsAccuracyMeters: 9.1,
    elevationMeters: 1740,
    agroZone: 'weyna_dega',
    agroZoneDerived: 'weyna_dega',
    soilClass: 'beda_nitisol',
    drainage: 'free_draining',
    status: 'active',
    activeCycle: {
      id: 'cycle-2',
      cropName: 'ጤፍ (Teff Magna)',
      stage: 'flowering',
      seasonYear: 2024,
      startedOn: '2024-05-20',
      daysAfterSowing: 65,
      progressPct: 59,
    },
    cropHistory: [
      { id: 'h-3', seasonYear: 2023, cropName: 'Teff (DZ-Cr-37)', fallow: false, yieldQtPerHa: 18 },
    ],
  },
];

export const plotService = {
  /**
   * Fetches plots for current authenticated farmer.
   * If network fails, gracefully returns cached local plots.
   */
  async fetchPlots(): Promise<ServiceResult<Plot[]>> {
    const res = await apiRequest<{ data: Plot[] }>(API_ENDPOINTS.plots.me);
    if (res.success && res.data && Array.isArray((res.data as any).data)) {
      const serverPlots = (res.data as any).data as Plot[];
      if (serverPlots.length > 0) {
        cachedPlots = serverPlots;
      }
      return { success: true, data: cachedPlots };
    }

    // Graceful offline fallback
    return {
      success: true,
      data: cachedPlots,
      details: { isOfflineFallback: true },
    };
  },

  /**
   * Fetches detailed plot profile including active cycle and rotation history.
   */
  async fetchPlotDetail(plotId: string): Promise<ServiceResult<Plot>> {
    const res = await apiRequest<{ data: Plot }>(API_ENDPOINTS.plots.detail(plotId));
    if (res.success && res.data && (res.data as any).data) {
      return { success: true, data: (res.data as any).data };
    }

    const localFound = cachedPlots.find((p) => p.id === plotId);
    if (localFound) {
      return { success: true, data: localFound };
    }

    return {
      success: false,
      error: 'Plot not found',
    };
  },

  /**
   * Registers a new plot.
   * If online: directly saves via API.
   * If offline: persists to local cache and pushes to transactional sync queue (MOB-5).
   */
  async registerPlot(payload: RegisterPlotPayload): Promise<ServiceResult<Plot>> {
    const calculatedHa = normalizeToHectares(payload.areaValue, payload.areaUnit);
    const elevation = payload.elevationMeters || 1710;
    const agroZone = payload.agroZone || (elevation < 1500 ? 'kolla' : elevation <= 2300 ? 'weyna_dega' : 'dega');

    // Attempt online API call
    const res = await apiRequest<{ data: Plot }>(API_ENDPOINTS.plots.me, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        elevationMeters: elevation,
        agroZone,
      }),
    });

    if (res.success && res.data && (res.data as any).data) {
      const savedPlot = (res.data as any).data as Plot;
      cachedPlots = [savedPlot, ...cachedPlots];
      return { success: true, data: savedPlot };
    }

    // Offline optimistic path
    const localId = `local-plot-${Date.now()}`;
    const newLocalPlot: Plot = {
      id: localId,
      name: payload.name,
      areaValue: payload.areaValue,
      areaUnit: payload.areaUnit,
      hectaresPerUnitApplied: payload.areaUnit === 'timad' ? 0.25 : payload.areaUnit === 'kert' ? 0.125 : 1.0,
      areaHectares: calculatedHa,
      centroidLatitude: payload.centroidLatitude,
      centroidLongitude: payload.centroidLongitude,
      gpsAccuracyMeters: payload.gpsAccuracyMeters,
      elevationMeters: elevation,
      agroZone,
      soilClass: payload.soilClass || 'koticha_vertisol',
      drainage: payload.drainage || 'waterlogs',
      status: 'active',
      isOfflineOnly: true,
      activeCycle: payload.plannedCropName
        ? {
            id: `local-cycle-${Date.now()}`,
            cropName: payload.plannedCropName,
            stage: 'land_preparation',
            seasonYear: payload.plannedSeasonYear || 2024,
            startedOn: new Date().toISOString().split('T')[0],
            progressPct: 10,
          }
        : null,
      cropHistory: [],
    };

    // Push into sync queue with SHA-256 payload hash
    await syncQueue.enqueue(
      'plots',
      localId,
      'insert',
      {
        ...payload,
        elevationMeters: elevation,
        agroZone,
      } as Record<string, unknown>
    );

    cachedPlots = [newLocalPlot, ...cachedPlots];

    return {
      success: true,
      data: newLocalPlot,
      details: { queuedOffline: true },
    };
  },

  /**
   * Resolves geo coordinates to elevation and agro-zone.
   */
  async resolveGeoLocation(lat: number, lng: number): Promise<ServiceResult<{
    elevationMeters: number;
    agroZoneDerived: 'kolla' | 'weyna_dega' | 'dega';
    accuracyThresholdMeters: number;
  }>> {
    const res = await apiRequest<{
      data: {
        elevationMeters: number;
        agroZoneDerived: 'kolla' | 'weyna_dega' | 'dega';
        accuracyThresholdMeters: number;
      };
    }>(`${API_ENDPOINTS.plots.geoResolve}?lat=${lat}&lng=${lng}`);

    if (res.success && res.data && (res.data as any).data) {
      return { success: true, data: (res.data as any).data };
    }

    // Default offline Ethiopian highland plain resolution
    return {
      success: true,
      data: {
        elevationMeters: 1710,
        agroZoneDerived: 'weyna_dega',
        accuracyThresholdMeters: 10,
      },
    };
  },

  /**
   * Soft-archives a plot.
   */
  async archivePlot(plotId: string): Promise<ServiceResult<{ status: string }>> {
    return apiRequest<{ status: string }>(API_ENDPOINTS.plots.archive(plotId), {
      method: 'POST',
    });
  },
};
