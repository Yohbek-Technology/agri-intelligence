import { eq, sql } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { auditLogs } from '@/db/schemas/sync.js'
import type { OfficeConfig, OfficeSummary, OfficeParametersUpdate } from '@repo/shared'

function num(params: Record<string, unknown>, key: string, fallback: number): number {
  const v = params[key]
  return typeof v === 'number' ? v : fallback
}

function obj<T>(params: Record<string, unknown>, key: string, fallback: T): T {
  const v = params[key]
  return v !== undefined && v !== null ? (v as T) : fallback
}

export async function getOfficeSummary(
  cityOfficeId: string,
  includeParameters: boolean
): Promise<OfficeSummary | null> {
  const [office] = await db
    .select()
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  if (!office) return null

  return {
    id: office.id,
    name: office.name,
    defaultLanguage: office.defaultLanguage,
    isActive: office.isActive,
    ...(includeParameters ? { parameters: (office.parameters ?? {}) as Record<string, unknown> } : {}),
  }
}

export async function getOfficeConfig(cityOfficeId: string): Promise<OfficeConfig | null> {
  const [office] = await db
    .select({ parameters: cityOffices.parameters })
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  if (!office) return null

  const p = (office.parameters ?? {}) as Record<string, unknown>

  return {
    landUnit: {
      timadToHa:   num(p, 'land_unit.timad_to_ha', 0.25),
      kertToHa:    p['land_unit.kert_to_ha'] as number | undefined,
      hectareToHa: num(p, 'land_unit.hectare_to_ha', 1),
    },
    agroZone: {
      kollaMaxM: num(p, 'agro_zone.kolla_max_m', 1500),
      degaMinM:  num(p, 'agro_zone.dega_min_m', 2300),
    },
    voice: {
      intentConfidenceThreshold: num(p, 'voice.intent_confidence_threshold', 0.65),
    },
    weather: {
      sprayWindMaxKmh:       num(p, 'weather.spray_wind_max_kmh', 15),
      sprayWashoffHours:     num(p, 'weather.spray_washoff_hours', 6),
      harvestRainProbMaxPct: num(p, 'weather.harvest_rain_prob_max_pct', 20),
      frostMinC:             num(p, 'weather.frost_min_c', 2),
      downpourMmPerDay:      num(p, 'weather.downpour_mm_per_day', 50),
      drySpellDays:          num(p, 'weather.dry_spell_days', 10),
    },
    rainOnset: {
      accumulationMm: num(p, 'rain_onset.accumulation_mm', 20),
      windowDays:     num(p, 'rain_onset.window_days', 3),
    },
    yield: {
      cohortMinSize: num(p, 'yield.cohort_min_size', 5),
    },
    diagnosis: {
      lowConfidence: num(p, 'diagnosis.low_confidence', 0.6),
    },
    outbreak: {
      radiusKm:   num(p, 'outbreak.radius_km', 5),
      windowDays: num(p, 'outbreak.window_days', 7),
      minCases:   num(p, 'outbreak.min_cases', 3),
    },
    triage: {
      overdueHours: num(p, 'triage.overdue_hours', 72),
    },
    demand: {
      criticalGapPct: num(p, 'demand.critical_gap_pct', 20),
      maxMarginPct:   num(p, 'demand.max_margin_pct', 30),
    },
    market: {
      staleDays:           num(p, 'market.stale_days', 14),
      plausibilityBandPct: num(p, 'market.plausibility_band_pct', 50),
    },
    broadcast: {
      smsFallbackMinutes: num(p, 'broadcast.sms_fallback_minutes', 30),
      quietHours: obj(p, 'broadcast.quiet_hours', { start: '20:00', end: '07:00' }),
    },
    ai: {
      dailyCallQuota: p['ai.daily_call_quota'] as number | undefined,
    },
  }
}

// Translation map: validator underscore-key → DB dotted-key
const PARAM_KEY_MAP: Record<keyof OfficeParametersUpdate, string> = {
  land_unit_timad_to_ha:             'land_unit.timad_to_ha',
  land_unit_kert_to_ha:              'land_unit.kert_to_ha',
  land_unit_hectare_to_ha:           'land_unit.hectare_to_ha',
  agro_zone_kolla_max_m:             'agro_zone.kolla_max_m',
  agro_zone_dega_min_m:              'agro_zone.dega_min_m',
  voice_intent_confidence_threshold: 'voice.intent_confidence_threshold',
  weather_spray_wind_max_kmh:        'weather.spray_wind_max_kmh',
  weather_spray_washoff_hours:       'weather.spray_washoff_hours',
  weather_harvest_rain_prob_max_pct: 'weather.harvest_rain_prob_max_pct',
  weather_frost_min_c:               'weather.frost_min_c',
  weather_downpour_mm_per_day:       'weather.downpour_mm_per_day',
  weather_dry_spell_days:            'weather.dry_spell_days',
  rain_onset_accumulation_mm:        'rain_onset.accumulation_mm',
  rain_onset_window_days:            'rain_onset.window_days',
  yield_cohort_min_size:             'yield.cohort_min_size',
  diagnosis_low_confidence:          'diagnosis.low_confidence',
  outbreak_radius_km:                'outbreak.radius_km',
  outbreak_window_days:              'outbreak.window_days',
  outbreak_min_cases:                'outbreak.min_cases',
  triage_overdue_hours:              'triage.overdue_hours',
  demand_critical_gap_pct:           'demand.critical_gap_pct',
  demand_max_margin_pct:             'demand.max_margin_pct',
  market_stale_days:                 'market.stale_days',
  market_plausibility_band_pct:      'market.plausibility_band_pct',
  broadcast_sms_fallback_minutes:    'broadcast.sms_fallback_minutes',
  ai_daily_call_quota:               'ai.daily_call_quota',
}

export function translateParamKeys(input: OfficeParametersUpdate): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [underKey, value] of Object.entries(input)) {
    if (value === undefined) continue
    const dottedKey = PARAM_KEY_MAP[underKey as keyof OfficeParametersUpdate]
    if (dottedKey) {
      result[dottedKey] = value
    }
  }
  return result
}

export async function updateOfficeParameters(
  cityOfficeId: string,
  actorUserId: string,
  input: OfficeParametersUpdate,
  defaultLanguage?: 'am' | 'om' | 'ti' | 'en'
): Promise<OfficeSummary | null> {
  // Read current parameters for before-snapshot
  const [current] = await db
    .select({ parameters: cityOffices.parameters })
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  if (!current) return null

  const currentParams = (current.parameters ?? {}) as Record<string, unknown>
  const dottedKeys = translateParamKeys(input)

  // Compute before/after for only the submitted keys
  const before: Record<string, unknown> = {}
  const after: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(dottedKeys)) {
    before[k] = currentParams[k]
    after[k] = v
  }

  // Build update set — we use conditional updates to avoid type issues
  if (Object.keys(dottedKeys).length > 0 && defaultLanguage) {
    await db
      .update(cityOffices)
      .set({
        parameters: sql`parameters || ${JSON.stringify(dottedKeys)}::jsonb`,
        defaultLanguage,
        updatedAt: new Date(),
      })
      .where(eq(cityOffices.id, cityOfficeId))
  } else if (Object.keys(dottedKeys).length > 0) {
    await db
      .update(cityOffices)
      .set({
        parameters: sql`parameters || ${JSON.stringify(dottedKeys)}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(cityOffices.id, cityOfficeId))
  } else if (defaultLanguage) {
    await db
      .update(cityOffices)
      .set({
        defaultLanguage,
        updatedAt: new Date(),
      })
      .where(eq(cityOffices.id, cityOfficeId))
  }

  // Insert audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'office.parameters_update',
    entityType: 'city_office',
    entityId: cityOfficeId,
    changesJson: { before, after },
  })

  return getOfficeSummary(cityOfficeId, true)
}
