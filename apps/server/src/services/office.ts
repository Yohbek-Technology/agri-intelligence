import { eq } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import type { OfficeConfig } from '@repo/shared'

export interface OfficeSummary {
  id: string
  name: string
  defaultLanguage: string
  isActive: boolean
  parameters?: Record<string, unknown>
}

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
