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
import { farmers, plots } from '@/db/schemas/farmers.js'
import { crops } from '@/db/schemas/catalog.js'
import { auditLogs } from '@/db/schemas/sync.js'
import { officeRegistryRouter } from '@/routes/registry.js'
import { eq, and } from 'drizzle-orm'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser
    session: SessionSession
  }
}

const RUN_ID = Date.now()
const OFFICE_NAME = `RegistryTestOffice_${RUN_ID}`
const TEST_TIMEOUT = 25_000

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

const officeManagementRouter = new Hono()
officeManagementRouter.route('/registry', officeRegistryRouter)
app.route('/api/v1/office', officeManagementRouter)

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

describe('Phase 2: Municipal Land Registry & Customary Unit Conversion Tests', () => {
  let officeId: string
  let kebele1Id: string
  let kebele2Id: string
  let cropTeffId: string
  let cropWheatId: string

  let officerCookie: string
  let farmerCookie: string

  beforeAll(async () => {
    // 1. City Office with Timad = 0.25 ha and Kert = 0.20 ha
    const [office] = await db
      .insert(cityOffices)
      .values({
        name: OFFICE_NAME,
        defaultLanguage: 'am',
        parameters: {
          'land_unit.timad_to_ha': 0.25,
          'land_unit.kert_to_ha': 0.20,
          'land_unit.hectare_to_ha': 1.0,
        },
        isActive: true,
      })
      .returning()
    officeId = office!.id

    const [kb1] = await db
      .insert(kebeles)
      .values({
        cityOfficeId: officeId,
        name: `Kebele_Alpha_${RUN_ID}`,
        centroidLatitude: '8.540000',
        centroidLongitude: '39.270000',
        radiusMeters: 3000,
      })
      .returning()
    kebele1Id = kb1!.id

    const [kb2] = await db
      .insert(kebeles)
      .values({
        cityOfficeId: officeId,
        name: `Kebele_Beta_${RUN_ID}`,
        centroidLatitude: '8.560000',
        centroidLongitude: '39.290000',
        radiusMeters: 3000,
      })
      .returning()
    kebele2Id = kb2!.id

    // Crops
    const [cr1] = await db
      .insert(crops)
      .values({
        cityOfficeId: officeId,
        code: `TEFF_REG_${RUN_ID}`,
        nameEn: 'Teff',
        nameAm: 'ጤፍ',
        status: 'active',
      })
      .returning()
    cropTeffId = cr1!.id

    const [cr2] = await db
      .insert(crops)
      .values({
        cityOfficeId: officeId,
        code: `WHEAT_REG_${RUN_ID}`,
        nameEn: 'Wheat',
        nameAm: 'ስንዴ',
        status: 'active',
      })
      .returning()
    cropWheatId = cr2!.id

    // 2. Officer user
    const officerPass = 'RegOfficer2026!'
    const officerEmail = `regofficer-${RUN_ID}@agri.test.invalid`
    const officerPhone = `+251966${String(RUN_ID).slice(-6)}`
    const officerSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Registry Officer',
      email: officerEmail,
      password: officerPass,
      phoneNumber: officerPhone,
    })
    const [createdOfficer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, officerEmail))
      .limit(1)

    await db
      .update(users)
      .set({
        role: 'officer',
        city_office_id: officeId,
        phone_number: officerPhone,
        phone_number_verified: true,
      })
      .where(eq(users.id, createdOfficer!.id))

    const offLogin = await req('POST', '/api/auth/sign-in/email', {
      email: officerEmail,
      password: officerPass,
    })
    officerCookie = extractSessionCookie(offLogin) ?? extractSessionCookie(officerSignUp)!

    // 3. Regular farmer user (for RBAC test)
    const farmerPass = 'RegFarmer2026!'
    const farmerEmail = `regfarmer-${RUN_ID}@agri.test.invalid`
    const farmerPhone = `+251977${String(RUN_ID).slice(-6)}`
    const farmerSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Registry Farmer',
      email: farmerEmail,
      password: farmerPass,
      phoneNumber: farmerPhone,
    })
    const [createdFarmer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, farmerEmail))
      .limit(1)

    await db
      .update(users)
      .set({
        role: 'farmer',
        city_office_id: officeId,
        phone_number: farmerPhone,
        phone_number_verified: true,
      })
      .where(eq(users.id, createdFarmer!.id))

    const fLogin = await req('POST', '/api/auth/sign-in/email', {
      email: farmerEmail,
      password: farmerPass,
    })
    farmerCookie = extractSessionCookie(fLogin) ?? extractSessionCookie(farmerSignUp)!

    // 4. Seed Farmers and Plots
    // Farmer 1 (Verified, 2 plots: 4 timad = 1.0 ha, and 2 ha)
    const [f1] = await db
      .insert(farmers)
      .values({
        cityOfficeId: officeId,
        fullName: 'Dawit Bekele',
        localIdNumber: `LID-REG-01-${RUN_ID}`,
        kebeleId: kebele1Id,
        phoneNumber: `+251911${String(RUN_ID).slice(-6)}`,
        isVerified: true,
        preferredLanguage: 'am',
      })
      .returning()

    await db.insert(plots).values([
      {
        cityOfficeId: officeId,
        farmerId: f1!.id,
        name: 'Plot 1A',
        areaValue: '4', // 4 timad
        areaUnit: 'timad',
        hectaresPerUnitApplied: '0.25',
        centroidLatitude: '8.541',
        centroidLongitude: '39.271',
        gpsAccuracyMeters: '5',
        elevationMeters: 1720,
        agroZoneDerived: 'weyna_dega',
        agroZone: 'weyna_dega',
        kebeleId: kebele1Id,
        soilClass: 'koticha_vertisol',
        drainage: 'waterlogs',
        plannedCropId: cropTeffId,
        plannedSeasonYear: 2027,
        status: 'active',
      },
      {
        cityOfficeId: officeId,
        farmerId: f1!.id,
        name: 'Plot 1B',
        areaValue: '2', // 2 ha
        areaUnit: 'hectare',
        hectaresPerUnitApplied: '1.0',
        centroidLatitude: '8.542',
        centroidLongitude: '39.272',
        gpsAccuracyMeters: '5',
        elevationMeters: 1720,
        agroZoneDerived: 'weyna_dega',
        agroZone: 'weyna_dega',
        kebeleId: kebele1Id,
        soilClass: 'beda_nitisol',
        drainage: 'free_draining',
        plannedCropId: cropWheatId,
        plannedSeasonYear: 2027,
        status: 'active',
      },
    ])

    // Farmer 2 (Self-registered / Unverified, 1 plot: 10 kert = 2.0 ha with 0.2 factor)
    const [f2] = await db
      .insert(farmers)
      .values({
        cityOfficeId: officeId,
        fullName: 'Fatuma Mohammed',
        localIdNumber: `LID-REG-02-${RUN_ID}`,
        kebeleId: kebele2Id,
        phoneNumber: `+251922${String(RUN_ID).slice(-6)}`,
        isVerified: false,
        preferredLanguage: 'om',
      })
      .returning()

    await db.insert(plots).values({
      cityOfficeId: officeId,
      farmerId: f2!.id,
      name: 'Plot 2A',
      areaValue: '10', // 10 kert
      areaUnit: 'kert',
      hectaresPerUnitApplied: '0.20',
      centroidLatitude: '8.561',
      centroidLongitude: '39.291',
      gpsAccuracyMeters: '8',
      elevationMeters: 1680,
      agroZoneDerived: 'weyna_dega',
      agroZone: 'weyna_dega',
      kebeleId: kebele2Id,
      soilClass: 'sandy',
      drainage: 'free_draining',
      plannedCropId: cropTeffId,
      plannedSeasonYear: 2027,
    })
  })

  it('1. Officer queries master registry and receives summary metrics', async () => {
    const res = await req('GET', '/api/v1/office/registry/farmers', undefined, officerCookie)
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.data).toBeDefined()
    expect(body.data.length).toBe(2)
    expect(body.summary).toBeDefined()
    expect(body.summary.totalFarmers).toBe(2)
    expect(body.summary.verifiedFarmers).toBe(1)
    expect(body.summary.selfRegisteredFarmers).toBe(1)
    expect(body.summary.totalPlots).toBe(3)
    // Total ha: Farmer 1 (1.0 + 2.0 = 3.0) + Farmer 2 (2.0) = 5.0 ha
    expect(body.summary.totalCultivatedHectares).toBe(5.0)
  }, TEST_TIMEOUT)

  it('2. Customary unit switcher recomputes displayed land areas across Timad, Kert, and Hectares', async () => {
    // Timad: 5.0 ha / 0.25 = 20 Timad
    const resTimad = await req('GET', '/api/v1/office/registry/farmers?unit=timad', undefined, officerCookie)
    expect(resTimad.status).toBe(200)
    const bodyTimad = await resTimad.json()
    expect(bodyTimad.summary.displayUnit).toBe('timad')
    expect(bodyTimad.summary.totalCultivatedDisplay).toBe(20)

    // Kert: 5.0 ha / 0.20 = 25 Kert
    const resKert = await req('GET', '/api/v1/office/registry/farmers?unit=kert', undefined, officerCookie)
    expect(resKert.status).toBe(200)
    const bodyKert = await resKert.json()
    expect(bodyKert.summary.displayUnit).toBe('kert')
    expect(bodyKert.summary.totalCultivatedDisplay).toBe(25)
  }, TEST_TIMEOUT)

  it('3. Filters master directory by kebele, verification status, and crop', async () => {
    // Filter by kebele 1
    const resKb = await req(`GET`, `/api/v1/office/registry/farmers?kebeleId=${kebele1Id}`, undefined, officerCookie)
    const bodyKb = await resKb.json()
    expect(bodyKb.data.length).toBe(1)
    expect(bodyKb.data[0].fullName).toBe('Dawit Bekele')

    // Filter by isVerified = true
    const resVer = await req('GET', '/api/v1/office/registry/farmers?isVerified=true', undefined, officerCookie)
    const bodyVer = await resVer.json()
    expect(bodyVer.data.length).toBe(1)
    expect(bodyVer.data[0].isVerified).toBe(true)

    // Filter by isVerified = false
    const resUnver = await req('GET', '/api/v1/office/registry/farmers?isVerified=false', undefined, officerCookie)
    const bodyUnver = await resUnver.json()
    expect(bodyUnver.data.length).toBe(1)
    expect(bodyUnver.data[0].fullName).toBe('Fatuma Mohammed')
  }, TEST_TIMEOUT)

  it('4. Asynchronous registry export generates CSV and logs registry.export to audit_logs', async () => {
    const expRes = await req(
      'POST',
      '/api/v1/office/registry/exports',
      { format: 'csv', unit: 'hectare' },
      officerCookie
    )

    expect(expRes.status).toBe(201)
    const expBody = await expRes.json()
    expect(expBody.data.id).toBeDefined()
    expect(expBody.data.downloadUrl).toBeDefined()

    // Download export
    const dlRes = await req('GET', expBody.data.downloadUrl, undefined, officerCookie)
    expect(dlRes.status).toBe(200)
    const csvText = await dlRes.text()
    expect(csvText).toContain('Full Name')
    expect(csvText).toContain('Dawit Bekele')
    expect(csvText).toContain('Fatuma Mohammed')

    // Verify audit log
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.cityOfficeId, officeId), eq(auditLogs.action, 'registry.export')))
    expect(logs.length).toBeGreaterThan(0)
  }, TEST_TIMEOUT)

  it('5. RBAC enforcement: Farmers cannot access officer registry endpoints', async () => {
    const res = await req('GET', '/api/v1/office/registry/farmers', undefined, farmerCookie)
    expect(res.status).toBe(403)
  }, TEST_TIMEOUT)
})
