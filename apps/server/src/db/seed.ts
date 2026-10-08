import 'dotenv/config'
import { db, pool } from '@/config/db.js'
import { auth } from '@/config/auth.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { user, account } from '@/db/schemas/auth-schema.js'
import { eq } from 'drizzle-orm'

const ADAMA_OFFICE_NAME = 'Adama City Agriculture Office'

const ADAMA_PARAMETERS = {
  'land_unit.timad_to_ha': 0.25,
  'land_unit.hectare_to_ha': 1,
  'agro_zone.kolla_max_m': 1500,
  'agro_zone.dega_min_m': 2300,
  'voice.intent_confidence_threshold': 0.65,
  'weather.spray_wind_max_kmh': 15,
  'weather.spray_washoff_hours': 6,
  'weather.harvest_rain_prob_max_pct': 20,
  'weather.frost_min_c': 2,
  'weather.downpour_mm_per_day': 50,
  'weather.dry_spell_days': 10,
  'rain_onset.accumulation_mm': 20,
  'rain_onset.window_days': 3,
  'yield.cohort_min_size': 5,
  'diagnosis.low_confidence': 0.6,
  'outbreak.radius_km': 5,
  'outbreak.window_days': 7,
  'outbreak.min_cases': 3,
  'triage.overdue_hours': 72,
  'demand.critical_gap_pct': 20,
  'demand.max_margin_pct': 30,
  'market.stale_days': 14,
  'market.plausibility_band_pct': 50,
  'broadcast.sms_fallback_minutes': 30,
  'broadcast.quiet_hours': { start: '20:00', end: '07:00' },
  'local_id.regex': '^[A-Z0-9]{6,20}$',
}

const SEED_ADMIN = {
  name: 'System Administrator',
  email: 'admin@agri.adama.gov.et',
  password: 'AgriAdmin2026!',
  phoneNumber: '+251911000001',
}

async function seedCityOffice(): Promise<string> {
  const existing = await db
    .select({ id: cityOffices.id })
    .from(cityOffices)
    .where(eq(cityOffices.name, ADAMA_OFFICE_NAME))
    .limit(1)

  if (existing.length) {
    console.log(`[seed] City office already exists: ${ADAMA_OFFICE_NAME} (${existing[0]!.id})`)
    return existing[0]!.id
  }

  const [inserted] = await db
    .insert(cityOffices)
    .values({
      name: ADAMA_OFFICE_NAME,
      defaultLanguage: 'am',
      parameters: ADAMA_PARAMETERS,
      isActive: true,
    })
    .returning({ id: cityOffices.id })

  if (!inserted) throw new Error('[seed] Failed to insert city office.')

  console.log(`[seed] Created city office: ${ADAMA_OFFICE_NAME} (${inserted.id})`)
  return inserted.id
}

async function seedSystemAdmin(cityOfficeId: string): Promise<void> {
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, SEED_ADMIN.email))
    .limit(1)

  if (existing.length) {
    console.log(`[seed] System admin already exists: ${SEED_ADMIN.email}`)
    return
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: SEED_ADMIN.name,
      email: SEED_ADMIN.email,
      password: SEED_ADMIN.password,
    },
  })

  if (!result?.user?.id) {
    throw new Error('[seed] Better Auth signUpEmail did not return a user id.')
  }

  const adminId = result.user.id

  await db
    .update(user)
    .set({
      role: 'system_admin',
      phone_number: SEED_ADMIN.phoneNumber,
      city_office_id: cityOfficeId,
      preferred_language: 'am',
    })
    .where(eq(user.id, adminId))

  await auth.api.enableTwoFactor({
    body: { password: SEED_ADMIN.password },
    headers: new Headers({
      Authorization: `Bearer ${result.token}`,
    }),
  }).catch(() => {
    console.warn('[seed] Could not auto-enable 2FA — admin must enable it on first login.')
  })

  console.log(`[seed] Created system admin: ${SEED_ADMIN.email} (id: ${adminId})`)
  console.log(`[seed] Role: system_admin | Phone: ${SEED_ADMIN.phoneNumber}`)
  console.log(`[seed] ⚠  Change the default password immediately after first login.`)
}

async function main(): Promise<void> {
  console.log('[seed] Starting database seed...')

  const cityOfficeId = await seedCityOffice()
  await seedSystemAdmin(cityOfficeId)

  console.log('[seed] Seed completed successfully.')
}

main()
  .catch((err) => {
    console.error('[seed] Fatal error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
