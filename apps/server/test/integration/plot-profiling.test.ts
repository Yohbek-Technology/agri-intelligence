import { describe, it, expect, beforeAll, vi } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({ success: true }),
  sendBulkSms: vi.fn().mockResolvedValue({ sent: [], failed: [] }),
  onPhoneVerified: vi.fn().mockResolvedValue(undefined),
  normalizeEthiopianPhone: (p: string) => p,
  countSegments: vi.fn().mockReturnValue(1),
}))

vi.mock('@/config/socket.js', () => ({
  initSocket: vi.fn(),
  getIO: vi.fn(),
}))

import { auth } from '@/config/auth.js'
import { db } from '@/config/db.js'
import { cityOffices, kebeles } from '@/db/schemas/tenancy.js'
import { users } from '@/db/schemas/auth-schema.js'
import { farmers, plots, plotCropHistory } from '@/db/schemas/farmers.js'
import { crops } from '@/db/schemas/catalog.js'
import { auditLogs } from '@/db/schemas/sync.js'
import { farmerRouter } from '@/routes/farmer.js'
import { plotRouter, geoRouter } from '@/routes/plot.js'
import { eq, and, sql } from 'drizzle-orm'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser
    session: SessionSession
  }
}

const RUN_ID = Date.now()
const OFFICE_NAME = `PlotTestOffice_${RUN_ID}`
const TEST_TIMEOUT = 25_000
const randPhone = () => `+2519${Math.floor(10000000 + Math.random() * 90000000)}`

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmerRouter)
app.route('/api/v1/plots', plotRouter)
app.route('/api/v1/geo', geoRouter)

const BASE = 'http://localhost'

function extractSessionCookie(res: Response): string | null {
  const raw = res.headers.get('set-cookie')
  if (!raw) return null
  for (const part of raw.split(/,(?=[^ ])/)) {
    const kv = part.trim().split(';')[0]!
    if (kv.startsWith('agri.') && !kv.startsWith('agri.two_factor')) return kv
  }
  return null
}

async function req(
  method: string,
  path: string,
  body?: unknown,
  cookie?: string | null
): Promise<Response> {
  return app.fetch(
    new Request(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  )
}

describe('Phase 2: Plot Profiling, Soil Classification & Spatial Tests', () => {
  let officeId: string
  let kebeleId: string
  let farmerId: string
  let cropId: string

  let farmerCookie: string
  let daCookie: string
  let createdPlotId: string

  beforeAll(async () => {
    // 1. Create city office with jurisdiction MultiPolygon around Adama (approx 8.5 to 8.6 N, 39.2 to 39.3 E)
    // and custom conversion factor for Timad = 0.25
    const [office] = await db
      .insert(cityOffices)
      .values({
        name: OFFICE_NAME,
        defaultLanguage: 'am',
        jurisdiction: sql`ST_Multi(ST_GeomFromText('POLYGON((39.20 8.50, 39.35 8.50, 39.35 8.65, 39.20 8.65, 39.20 8.50))', 4326))::geography`,
        parameters: {
          'land_unit.timad_to_ha': 0.25,
          'land_unit.kert_to_ha': 0.20,
          'agro_zone.kolla_max_m': 1500,
          'agro_zone.dega_min_m': 2300,
        },
        isActive: true,
      })
      .returning()
    officeId = office!.id

    const [kb] = await db
      .insert(kebeles)
      .values({
        cityOfficeId: officeId,
        name: `Adama_Central_${RUN_ID}`,
        centroidLatitude: '8.540000',
        centroidLongitude: '39.270000',
        radiusMeters: 4000,
      })
      .returning()
    kebeleId = kb!.id

    // 2. Create an active crop in catalog
    const [crp] = await db
      .insert(crops)
      .values({
        cityOfficeId: officeId,
        code: `TEFF_${RUN_ID}`,
        nameEn: 'Teff (Magna)',
        nameAm: 'ጤፍ (ማግና)',
        status: 'active',
      })
      .returning()
    cropId = crp!.id

    // 3. Create Farmer user & profile
    const farmerPass = 'PlotFarmer2026!'
    const farmerEmail = `plotfarmer-${RUN_ID}@agri.test.invalid`
    const farmerPhone = randPhone()
    const farmerSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Plot Tester Farmer',
      email: farmerEmail,
      password: farmerPass,
      phoneNumber: farmerPhone,
    })
    const [createdFarmerUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, farmerEmail))
      .limit(1)

    await db
      .update(users)
      .set({
        phone_number: farmerPhone,
        phone_number_verified: true,
        role: 'farmer',
      })
      .where(eq(users.id, createdFarmerUser!.id))

    const fLogin = await req('POST', '/api/auth/sign-in/email', {
      email: farmerEmail,
      password: farmerPass,
    })
    farmerCookie = extractSessionCookie(fLogin) ?? extractSessionCookie(farmerSignUp)!

    // Self-onboard farmer
    const fOnboard = await req(
      'POST',
      '/api/v1/farmers/me',
      {
        fullName: 'Plot Tester Farmer',
        localIdNumber: `LID-PLOT-${RUN_ID}`,
        kebeleId,
        preferredLanguage: 'am',
        consentAgreed: true,
      },
      farmerCookie
    )
    const fOnboardData = await fOnboard.json()
    farmerId = fOnboardData.data.id

    // 4. Create DA user
    const daPass = 'PlotDaPass2026!'
    const daEmail = `plotda-${RUN_ID}@agri.test.invalid`
    const daPhone = randPhone()
    const daSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Plot DA Agent',
      email: daEmail,
      password: daPass,
      phoneNumber: daPhone,
    })
    const [createdDaUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, daEmail))
      .limit(1)

    await db
      .update(users)
      .set({
        role: 'da',
        city_office_id: officeId,
        phone_number: `+251955${String(RUN_ID).slice(-6)}`,
        phone_number_verified: true,
        assigned_kebele_ids: [kebeleId],
      })
      .where(eq(users.id, createdDaUser!.id))

    const daLogin = await req('POST', '/api/auth/sign-in/email', {
      email: daEmail,
      password: daPass,
    })
    daCookie = extractSessionCookie(daLogin) ?? extractSessionCookie(daSignUp)!
  })

  it('1. Geo-resolution resolves elevation, agro-climatic zone and kebele', async () => {
    const res = await req('GET', '/api/v1/geo/resolve?lat=8.5411&lng=39.2704&unit=timad', undefined, farmerCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.isInJurisdiction).toBe(true)
    expect(body.data.elevationMeters).toBeGreaterThan(0)
    expect(['dega', 'weyna_dega', 'kolla']).toContain(body.data.agroZoneDerived)
    expect(body.data.kebeleId).toBe(kebeleId)
    expect(body.data.hectaresPerUnitApplied).toBe(0.25)
  }, TEST_TIMEOUT)

  it('2. Plot registration with Timad applies conversion factor and computes area_hectares', async () => {
    const res = await req(
      'POST',
      `/api/v1/farmers/${farmerId}/plots`,
      {
        name: 'Upper Koticha Ridge',
        areaValue: 4, // 4 timad = 1.0 hectare with 0.25 factor
        areaUnit: 'timad',
        centroid: { lat: 8.5411, lng: 39.2704, accuracyMeters: 5.0 },
        soilClass: 'koticha_vertisol',
        drainage: 'waterlogs',
        plannedCropId: cropId,
        plannedSeasonYear: 2027,
      },
      farmerCookie
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.name).toBe('Upper Koticha Ridge')
    expect(body.data.areaValue).toBe(4)
    expect(body.data.areaUnit).toBe('timad')
    expect(body.data.hectaresPerUnitApplied).toBe(0.25)
    expect(body.data.areaHectares).toBe(1.0)
    expect(body.data.soilClass).toBe('koticha_vertisol')
    expect(body.data.drainage).toBe('waterlogs')
    expect(body.data.plannedCropId).toBe(cropId)
    expect(body.data.status).toBe('active')
    createdPlotId = body.data.id
  }, TEST_TIMEOUT)

  it('3. Coordinates outside city office boundary are rejected with 422', async () => {
    // Coordinate far outside Adama (e.g. Hawassa lat 7.05, lng 38.47)
    const res = await req(
      'POST',
      `/api/v1/farmers/${farmerId}/plots`,
      {
        name: 'Outside Plot',
        areaValue: 2,
        areaUnit: 'timad',
        centroid: { lat: 7.05, lng: 38.47, accuracyMeters: 5.0 },
        soilClass: 'beda_nitisol',
        drainage: 'moderate',
      },
      farmerCookie
    )

    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error.code).toBe('coordinates_outside_jurisdiction')
  }, TEST_TIMEOUT)

  it('4. DA can override derived agro-zone with mandatory reason logging', async () => {
    const res = await req(
      'PUT',
      `/api/v1/plots/${createdPlotId}/agro-zone`,
      {
        agroZone: 'dega',
        reason: 'Micro-climate high ridge elevation verified on site inspection.',
      },
      daCookie
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.agroZone).toBe('dega')
    expect(body.data.agroZoneOverrideReason).toContain('Micro-climate')

    // Verify audit log
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, createdPlotId), eq(auditLogs.action, 'plot.zone_override')))
    expect(logs.length).toBeGreaterThan(0)
  }, TEST_TIMEOUT)

  it('5. Plot archiving and restoration toggle status', async () => {
    // Archive
    const archRes = await req('POST', `/api/v1/plots/${createdPlotId}/archive`, {}, farmerCookie)
    expect(archRes.status).toBe(200)
    const archBody = await archRes.json()
    expect(archBody.data.status).toBe('archived')

    // Restore
    const restRes = await req('POST', `/api/v1/plots/${createdPlotId}/restore`, {}, farmerCookie)
    expect(restRes.status).toBe(200)
    const restBody = await restRes.json()
    expect(restBody.data.status).toBe('active')
  }, TEST_TIMEOUT)

  it('6. Plot crop history CRUD saves 1–3 seasons and validates fallow constraint', async () => {
    // Add 2026 season crop
    const h1 = await req(
      'PUT',
      `/api/v1/plots/${createdPlotId}/crop-history/2026`,
      { cropId, fallow: false },
      farmerCookie
    )
    expect(h1.status).toBe(200)
    const h1Body = await h1.json()
    expect(h1Body.data.seasonYear).toBe(2026)
    expect(h1Body.data.cropId).toBe(cropId)
    expect(h1Body.data.fallow).toBe(false)

    // Add 2025 fallow season
    const h2 = await req(
      'PUT',
      `/api/v1/plots/${createdPlotId}/crop-history/2025`,
      { cropId: null, fallow: true },
      farmerCookie
    )
    expect(h2.status).toBe(200)
    const h2Body = await h2.json()
    expect(h2Body.data.seasonYear).toBe(2025)
    expect(h2Body.data.fallow).toBe(true)

    // List history
    const listRes = await req('GET', `/api/v1/plots/${createdPlotId}/crop-history`, undefined, farmerCookie)
    expect(listRes.status).toBe(200)
    const listBody = await listRes.json()
    expect(listBody.data.length).toBe(2)
  }, TEST_TIMEOUT)
})
