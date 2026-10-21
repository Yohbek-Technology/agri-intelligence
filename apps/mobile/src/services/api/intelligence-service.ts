import { apiRequest, ServiceResult } from './client';
import { getApiBaseUrl } from '@/config/env';

export interface YieldGapMetrics {
  realizedYieldQtPerHa: number;
  cohortMedianQtPerHa: number;
  cohortTopQuartileQtPerHa: number;
  gapPercent: number;
  absoluteGapQtPerHa: number;
}

export interface FactorResult {
  factor: string;
  rank: number;
  severity: 'high' | 'moderate' | 'low';
  lossContributionPercent: number;
  title: string;
  observedValue: string;
  targetBenchmark: string;
  delayDays?: number;
  description: string;
}

export interface RecommendationAction {
  id: string;
  title: string;
  description: string;
  actionType: string;
  targetStage: string;
}

export interface YieldGapEvaluation {
  id: string;
  cycleId: string;
  status: 'completed' | 'insufficient_data' | 'top_quartile' | 'failed';
  cohortDefinition: {
    cropType: string;
    soilClass: string;
    agroZone: string;
    woreda: string;
    season: string;
  };
  cohortSize: number;
  plotYieldQtPerHa: string;
  cohortMedianQtPerHa: string;
  cohortTopQuartileQtPerHa: string;
  gapPercentVsTopQuartile: string;
  factorResults: FactorResult[];
  recommendations: RecommendationAction[];
  narrationLang?: string;
  narrationText: string;
  plot?: {
    id: string;
    name: string;
    soilClass: string;
    elevationMeters: number;
  };
  cycle?: {
    id: string;
    cropType: string;
    season: string;
  };
  metrics?: YieldGapMetrics;
}

export interface WeatherObservation {
  locationName: string;
  gridLatitude: number;
  gridLongitude: number;
  tempC: number;
  condition: string;
  conditionCode: string;
  icon: string;
  windSpeedKmh: number;
  windDirection: string;
  rainProbabilityPercent: number;
  expectedRainMm: number;
  humidityPercent: number;
  dewPointC: number;
  dewDryingTime: string;
  soilCondition: {
    type: string;
    state: string;
    moistureLevel: string;
    trafficability: string;
    compactionRisk: string;
  };
  updatedAt: string;
}

export interface FarmOrNotDecision {
  decision: 'GO' | 'WAIT' | 'NO';
  title: string;
  subtitle: string;
  summary: string;
  recommendedWindow: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  audioKey?: string;
  driftRisk?: string;
  washoffRisk?: string;
  dewStatus?: string;
}

export interface FarmOrNotMatrix {
  plowing: FarmOrNotDecision;
  spraying: FarmOrNotDecision;
  harvesting: FarmOrNotDecision;
}

export interface WeatherCurrentData {
  current: WeatherObservation;
  decisions: FarmOrNotMatrix;
}

export interface DailyForecast {
  dayLabel: string;
  dayOfWeek: string;
  date: string;
  tempMaxC: number;
  tempMinC: number;
  rainProbabilityPercent: number;
  expectedRainMm: number;
  condition: string;
  icon: string;
  windSpeedKmh: number;
  sprayingSuitability: string;
  suitabilityRating: 'GO' | 'CAUTION' | 'NO';
}

export interface WeatherAlert {
  id: string;
  gridLatitude: string;
  gridLongitude: string;
  alertType: 'frost' | 'downpour' | 'dry_spell';
  startsOn: string;
  endsOn: string;
  details: {
    title: string;
    timing: string;
    severity: 'high' | 'moderate' | 'low';
    description: string;
    audioDuration?: string;
  };
}

let cachedYieldGap: Record<string, YieldGapEvaluation> = {};
let cachedWeatherData: WeatherCurrentData | null = null;
let cachedForecast: DailyForecast[] = [];
let cachedAlerts: WeatherAlert[] = [];

export const intelligenceService = {
  /**
   * Evaluate Yield Gap for a closed crop cycle
   */
  async evaluateYieldGap(cycleId: string): Promise<ServiceResult<YieldGapEvaluation>> {
    const res = await apiRequest<YieldGapEvaluation>('/api/v1/yield-gap/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        cycleId,
        engineVersion: 'v1.3-gemini',
      }),
    });

    if (res.success && res.data) {
      cachedYieldGap[cycleId] = res.data;
      return res;
    }

    // Fallback offline evaluation
    if (cachedYieldGap[cycleId]) {
      return { success: true, data: cachedYieldGap[cycleId], details: { fromCache: true } };
    }

    const fallback: YieldGapEvaluation = {
      id: `offline-yield-gap-${cycleId}`,
      cycleId,
      status: 'completed',
      cohortDefinition: {
        cropType: 'Teff',
        soilClass: 'koticha_vertisol',
        agroZone: 'weyna_dega',
        woreda: 'Adama',
        season: 'Meher 2024',
      },
      cohortSize: 14,
      plotYieldQtPerHa: '18.00',
      cohortMedianQtPerHa: '26.50',
      cohortTopQuartileQtPerHa: '32.00',
      gapPercentVsTopQuartile: '43.75',
      metrics: {
        realizedYieldQtPerHa: 18.0,
        cohortMedianQtPerHa: 26.5,
        cohortTopQuartileQtPerHa: 32.0,
        gapPercent: 43.8,
        absoluteGapQtPerHa: 14.0,
      },
      factorResults: [
        {
          factor: 'urea_2_timing',
          rank: 1,
          severity: 'high',
          lossContributionPercent: 40,
          title: '2nd Urea Top-Dressing Timing',
          observedValue: '49 DAS',
          targetBenchmark: '28 DAS (Early Tillering)',
          delayDays: 21,
          description: 'Nitrogen applied at 49 DAS vs top-quartile 28 DAS. High Koticha clay leaching occurred.',
        },
        {
          factor: 'weeding_window',
          rank: 2,
          severity: 'moderate',
          lossContributionPercent: 32,
          title: 'Weeding Delay Window',
          observedValue: '35 DAS',
          targetBenchmark: '20-30 DAS',
          delayDays: 10,
          description: 'First weeding completed at 35 DAS. Dense weed canopy outcompeted young teff shoots.',
        },
        {
          factor: 'seed_genetic_purity',
          rank: 3,
          severity: 'moderate',
          lossContributionPercent: 28,
          title: 'Seed Source & Genetic Purity',
          observedValue: 'Recycled Home Grain',
          targetBenchmark: 'Certified Improved Quncho (DZ-Cr-37)',
          description: 'Planted with recycled local grain. Certified Quncho yielded +14 Qt/Ha in peer plots.',
        },
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Schedule 2nd Urea at exactly 25-30 DAS',
          description: 'AgriIntel will trigger automated SMS/Voice calendar alarm based on your confirmed 2025 sowing date.',
          actionType: 'calendar_alarm',
          targetStage: 'vegetative_tillering',
        },
        {
          id: 'rec-2',
          title: 'Pre-order Certified Quncho Seed',
          description: 'Reserve 35kg bag at Adama Agricultural Cooperative Union depot before May 15.',
          actionType: 'coop_preorder',
          targetStage: 'land_preparation',
        },
      ],
      narrationLang: 'am',
      narrationText: 'የማዳበሪያ አጠቃቀምዎ ዘግይቶ መከናወኑ እና የተሻሻለ የቁንጮ ዝርያ አለመጠቀምዎ በመኸር ወቅት 14 ኩንታል በሄክታር እንዲያጡ አድርጓል።',
    };

    return { success: true, data: fallback, details: { fallbackOffline: true } };
  },

  /**
   * Fetch Yield Gap by Crop Cycle ID
   */
  async fetchYieldGapByCycle(cycleId: string): Promise<ServiceResult<YieldGapEvaluation>> {
    const res = await apiRequest<YieldGapEvaluation>(`/api/v1/yield-gap/cycle/${cycleId}`);
    if (res.success && res.data) {
      cachedYieldGap[cycleId] = res.data;
      return res;
    }
    if (cachedYieldGap[cycleId]) {
      return { success: true, data: cachedYieldGap[cycleId], details: { fromCache: true } };
    }
    return this.evaluateYieldGap(cycleId);
  },

  /**
   * Fetch Live Weather Observation and Decisions
   */
  async fetchWeatherCurrent(lat = 8.5, lon = 39.3): Promise<ServiceResult<WeatherCurrentData>> {
    const res = await apiRequest<WeatherCurrentData>(`/api/v1/weather/current?lat=${lat}&lon=${lon}`);
    if (res.success && res.data) {
      cachedWeatherData = res.data;
      return res;
    }

    if (cachedWeatherData) {
      return { success: true, data: cachedWeatherData, details: { fromCache: true } };
    }

    // Default offline fallback
    const fallback: WeatherCurrentData = {
      current: {
        locationName: 'Adama Kebele 03 (Lower Field)',
        gridLatitude: lat,
        gridLongitude: lon,
        tempC: 24,
        condition: 'Mild & Clear',
        conditionCode: 'clear',
        icon: 'wb_sunny',
        windSpeedKmh: 9,
        windDirection: 'NE',
        rainProbabilityPercent: 15,
        expectedRainMm: 0.0,
        humidityPercent: 58,
        dewPointC: 12,
        dewDryingTime: '10:00 AM',
        soilCondition: {
          type: 'Koticha Clay (Vertisol)',
          state: 'Friable',
          moistureLevel: 'Adequate',
          trafficability: 'Good Traction',
          compactionRisk: 'Low',
        },
        updatedAt: new Date().toISOString(),
      },
      decisions: {
        plowing: {
          decision: 'GO',
          title: 'Plowing / ማረስ',
          subtitle: 'Oxen & Tractor Pass',
          summary: 'Soil moisture is optimal for plowing. Koticha clay has dried past plastic limit; no clod compaction risk today.',
          recommendedWindow: '07:00 AM – 04:30 PM',
          riskLevel: 'safe',
        },
        spraying: {
          decision: 'GO',
          title: 'Herbicide / Spraying',
          subtitle: 'Broadleaf & Rust Guard Window',
          summary: 'Low wind (<10 km/h), zero rain probability for next 8 hours. No chemical wash-off or drift hazard.',
          recommendedWindow: '06:00 AM – 10:30 AM',
          driftRisk: 'Minimum',
          riskLevel: 'safe',
        },
        harvesting: {
          decision: 'WAIT',
          title: 'Harvesting / ማጨድ',
          subtitle: 'Teff Grain & Hay Baling',
          summary: 'Passing morning dew on panicles. Moisture level at 21%. Postpone cutting until after 1:00 PM to avoid grain mold in storage.',
          recommendedWindow: 'Resume 1:30 PM onward',
          dewStatus: 'Drying (est. 12:45 PM)',
          riskLevel: 'caution',
        },
      },
    };

    return { success: true, data: fallback, details: { fallbackOffline: true } };
  },

  /**
   * Fetch 7-Day Forecast
   */
  async fetchWeatherForecast(lat = 8.5, lon = 39.3): Promise<ServiceResult<DailyForecast[]>> {
    const res = await apiRequest<{ forecastDays: DailyForecast[] }>(
      `/api/v1/weather/forecast?lat=${lat}&lon=${lon}`
    );
    if (res.success && res.data?.forecastDays) {
      cachedForecast = res.data.forecastDays;
      return { success: true, data: cachedForecast };
    }
    if (cachedForecast.length > 0) {
      return { success: true, data: cachedForecast, details: { fromCache: true } };
    }

    const fallbackForecast: DailyForecast[] = [
      {
        dayLabel: 'TODAY',
        dayOfWeek: 'Mon',
        date: new Date().toISOString().split('T')[0],
        tempMaxC: 26,
        tempMinC: 14,
        rainProbabilityPercent: 10,
        expectedRainMm: 0,
        condition: 'Sunny',
        icon: 'sunny',
        windSpeedKmh: 9,
        sprayingSuitability: 'Excellent (06:00 - 10:30)',
        suitabilityRating: 'GO',
      },
      {
        dayLabel: 'Tue',
        dayOfWeek: 'Tue',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        tempMaxC: 25,
        tempMinC: 15,
        rainProbabilityPercent: 15,
        expectedRainMm: 0,
        condition: 'Partly Cloudy',
        icon: 'partly_cloudy_day',
        windSpeedKmh: 11,
        sprayingSuitability: 'Good (06:30 - 09:30)',
        suitabilityRating: 'GO',
      },
      {
        dayLabel: 'Wed',
        dayOfWeek: 'Wed',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        tempMaxC: 21,
        tempMinC: 8,
        rainProbabilityPercent: 65,
        expectedRainMm: 14,
        condition: 'Rain / Cold Frost',
        icon: 'weather_mix',
        windSpeedKmh: 18,
        sprayingSuitability: 'High Wash-off Risk (Avoid)',
        suitabilityRating: 'NO',
      },
      {
        dayLabel: 'Thu',
        dayOfWeek: 'Thu',
        date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        tempMaxC: 22,
        tempMinC: 9,
        rainProbabilityPercent: 70,
        expectedRainMm: 18,
        condition: 'Scattered Showers',
        icon: 'rainy',
        windSpeedKmh: 14,
        sprayingSuitability: 'High Wash-off Risk (Avoid)',
        suitabilityRating: 'NO',
      },
      {
        dayLabel: 'Fri',
        dayOfWeek: 'Fri',
        date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        tempMaxC: 24,
        tempMinC: 13,
        rainProbabilityPercent: 30,
        expectedRainMm: 2,
        condition: 'Partly Cloudy',
        icon: 'partly_cloudy_day',
        windSpeedKmh: 10,
        sprayingSuitability: 'Moderate (Early morning only)',
        suitabilityRating: 'CAUTION',
      },
      {
        dayLabel: 'Sat',
        dayOfWeek: 'Sat',
        date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        tempMaxC: 26,
        tempMinC: 14,
        rainProbabilityPercent: 10,
        expectedRainMm: 0,
        condition: 'Clear Sky',
        icon: 'sunny',
        windSpeedKmh: 8,
        sprayingSuitability: 'Optimal (All Morning)',
        suitabilityRating: 'GO',
      },
      {
        dayLabel: 'Sun',
        dayOfWeek: 'Sun',
        date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
        tempMaxC: 26,
        tempMinC: 14,
        rainProbabilityPercent: 5,
        expectedRainMm: 0,
        condition: 'Sunny',
        icon: 'sunny',
        windSpeedKmh: 7,
        sprayingSuitability: 'Optimal (All Morning)',
        suitabilityRating: 'GO',
      },
    ];

    return { success: true, data: fallbackForecast, details: { fallbackOffline: true } };
  },

  /**
   * Fetch Active Weather Alerts
   */
  async fetchWeatherAlerts(lat = 8.5, lon = 39.3): Promise<ServiceResult<WeatherAlert[]>> {
    const res = await apiRequest<WeatherAlert[]>(`/api/v1/weather/alerts?lat=${lat}&lon=${lon}`);
    if (res.success && res.data) {
      cachedAlerts = res.data;
      return res;
    }
    if (cachedAlerts.length > 0) {
      return { success: true, data: cachedAlerts, details: { fromCache: true } };
    }

    const fallbackAlerts: WeatherAlert[] = [
      {
        id: 'fallback-frost-alert',
        gridLatitude: String(lat),
        gridLongitude: String(lon),
        alertType: 'frost',
        startsOn: new Date().toISOString().split('T')[0],
        endsOn: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        details: {
          title: 'Frost Warning • ውርጭ ማስጠንቀቂያ',
          timing: 'Wed Night',
          severity: 'high',
          description: 'Frost risk for highland kebeles (>2,300m). Adama valley is safe, but prepare straw mulch covers on slope seedbeds.',
          audioDuration: '0:24 min',
        },
      },
    ];

    return { success: true, data: fallbackAlerts, details: { fallbackOffline: true } };
  },

  /**
   * Get Yield Gap Audio URL
   */
  getYieldGapAudioUrl(id: string, lang = 'am'): string {
    return `${getApiBaseUrl()}/api/v1/yield-gap/${id}/audio?lang=${lang}`;
  },

  /**
   * Get Weather Weekly Advisory Audio URL
   */
  getWeatherAdvisoryAudioUrl(lang = 'am'): string {
    return `${getApiBaseUrl()}/api/v1/weather/advisory/audio?lang=${lang}`;
  },
};
