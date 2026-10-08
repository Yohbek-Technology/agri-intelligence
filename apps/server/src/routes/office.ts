import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { sessionGuard, tenantGuard } from '@/middlewares/index.js'
import type { OfficeConfig } from '@repo/shared'

const officeRouter = new Hono()

officeRouter.use('*', sessionGuard, tenantGuard)

officeRouter.get('/me', async (c) => {
  const user = c.get('user')
  const cityOfficeId = user.cityOfficeId!

  const [office] = await db
    .select()
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  if (!office) {
    return c.json({ error: { code: 'not_found', message: 'City office not found.' } }, 404)
  }

  const isOfficer = user.role === 'officer' || user.role === 'system_admin'

  return c.json({
    data: {
      id: office.id,
      name: office.name,
      defaultLanguage: office.defaultLanguage,
      isActive: office.isActive,
      ...(isOfficer ? { parameters: office.parameters } : {}),
    },
  })
})

officeRouter.get('/me/config', async (c) => {
  const user = c.get('user')
  const cityOfficeId = user.cityOfficeId!

  const [office] = await db
    .select({ parameters: cityOffices.parameters })
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  if (!office) {
    return c.json({ error: { code: 'not_found', message: 'City office not found.' } }, 404)
  }

  const p = (office.parameters ?? {}) as Record<string, unknown>

  const config: OfficeConfig = {
    landUnit: {
      timadToHa:   (p['land_unit.timad_to_ha']   as number) ?? 0.25,
      kertToHa:     p['land_unit.kert_to_ha']    as number | undefined,
      hectareToHa: (p['land_unit.hectare_to_ha'] as number) ?? 1,
    },
    agroZone: {
      kollaMaxM: (p['agro_zone.kolla_max_m'] as number) ?? 1500,
      degaMinM:  (p['agro_zone.dega_min_m']  as number) ?? 2300,
    },
    voice: {
      intentConfidenceThreshold: (p['voice.intent_confidence_threshold'] as number) ?? 0.65,
    },
    weather: {
      sprayWindMaxKmh:       (p['weather.spray_wind_max_kmh']        as number) ?? 15,
      sprayWashoffHours:     (p['weather.spray_washoff_hours']       as number) ?? 6,
      harvestRainProbMaxPct: (p['weather.harvest_rain_prob_max_pct'] as number) ?? 20,
      frostMinC:             (p['weather.frost_min_c']               as number) ?? 2,
      downpourMmPerDay:      (p['weather.downpour_mm_per_day']       as number) ?? 50,
      drySpellDays:          (p['weather.dry_spell_days']            as number) ?? 10,
    },
    rainOnset: {
      accumulationMm: (p['rain_onset.accumulation_mm'] as number) ?? 20,
      windowDays:     (p['rain_onset.window_days']     as number) ?? 3,
    },
    yield: {
      cohortMinSize: (p['yield.cohort_min_size'] as number) ?? 5,
    },
    diagnosis: {
      lowConfidence: (p['diagnosis.low_confidence'] as number) ?? 0.6,
    },
    outbreak: {
      radiusKm:   (p['outbreak.radius_km']    as number) ?? 5,
      windowDays: (p['outbreak.window_days']  as number) ?? 7,
      minCases:   (p['outbreak.min_cases']    as number) ?? 3,
    },
    triage: {
      overdueHours: (p['triage.overdue_hours'] as number) ?? 72,
    },
    demand: {
      criticalGapPct: (p['demand.critical_gap_pct'] as number) ?? 20,
      maxMarginPct:   (p['demand.max_margin_pct']   as number) ?? 30,
    },
    market: {
      staleDays:           (p['market.stale_days']             as number) ?? 14,
      plausibilityBandPct: (p['market.plausibility_band_pct']  as number) ?? 50,
    },
    broadcast: {
      smsFallbackMinutes: (p['broadcast.sms_fallback_minutes'] as number) ?? 30,
      quietHours: (p['broadcast.quiet_hours'] as { start: string; end: string }) ?? {
        start: '20:00',
        end:   '07:00',
      },
    },
    ai: {
      dailyCallQuota: p['ai.daily_call_quota'] as number | undefined,
    },
  }

  return c.json({ data: config })
})

export { officeRouter }
