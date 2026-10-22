import { describe, it, expect, beforeAll, vi } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true, messageId: 'mock-id', number: '+251911000001', status: 'Success', cost: '0',
  }),
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
import { farmers } from '@/db/schemas/farmers.js'
import { auditLogs } from '@/db/schemas/sync.js'
import { farmerRouter, officeFarmerRouter } from '@/routes/farmer.js'
import { eq, and } from 'drizzle-orm'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser
    session: SessionSession
  }
}

const RUN_ID = Date.now()
const OFFICE_NAME = `FarmerTestOffice_${RUN_ID}`
const OTHER_OFFICE_NAME = `OtherOffice_${RUN_ID}`
const TEST_TIMEOUT = 25_000

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/farmers', farmerRouter)

const officeManagementRouter = new Hono()
officeManagementRouter.route('/farmers', officeFarmerRouter)
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

describe('Phase 2: Farmer Onboarding, Claiming & Identity Tests', () => {
  let officeId: string
  let otherOfficeId: string
  let kebeleId: string
  let otherKebeleId: string

  const randPhone = () => `+2519${Math.floor(10000000 + Math.random() * 90000000)}`
  let farmerCookie: string
  let farmerUserId: string
  const farmerPhone = randPhone()
  const farmerPass = 'FarmerPass2026!'

  let daCookie: string
  let daUserId: string
  const daPhone = randPhone()
  const daPass = 'DaPassword2026!'

  let claimerCookie: string
  let claimerUserId: string
  const claimerPhone = randPhone()
  const claimerPass = 'ClaimerPass2026!'

  const localIdSelf = `LID-${RUN_ID}-SELF`
  const localIdProxy = `LID-${RUN_ID}-PROXY`
  let proxyFarmerId: string

  beforeAll(async () => {
    // 1. Create main city office and kebele
    const [office] = await db
      .insert(cityOffices)
      .values({
        name: OFFICE_NAME,
        defaultLanguage: 'am',
        parameters: { 'land_unit.timad_to_ha': 0.25 },
        isActive: true,
      })
      .returning()
    officeId = office!.id

    const [kb] = await db
      .insert(kebeles)
      .values({
        cityOfficeId: officeId,
        name: `Kebele_${RUN_ID}`,
        centroidLatitude: '8.540000',
        centroidLongitude: '39.270000',
        radiusMeters: 5000,
      })
      .returning()
    kebeleId = kb!.id

    // 2. Create second office for tenant isolation tests
    const [otherOffice] = await db
      .insert(cityOffices)
      .values({
        name: OTHER_OFFICE_NAME,
        defaultLanguage: 'om',
        parameters: {},
        isActive: true,
      })
      .returning()
    otherOfficeId = otherOffice!.id

    const [otherKb] = await db
      .insert(kebeles)
      .values({
        cityOfficeId: otherOfficeId,
        name: `OtherKebele_${RUN_ID}`,
        centroidLatitude: '9.000000',
        centroidLongitude: '38.700000',
        radiusMeters: 3000,
      })
      .returning()
    otherKebeleId = otherKb!.id

    // 3. Create and sign in farmer user
    const farmerEmail = `farmer-${RUN_ID}@agri.test.invalid`
    const farmerSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Initial Self Farmer',
      email: farmerEmail,
      password: farmerPass,
      phoneNumber: farmerPhone,
    })
    const [createdFarmerUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, farmerEmail))
      .limit(1)
    farmerUserId = createdFarmerUser!.id

    await db
      .update(users)
      .set({
        phone_number: farmerPhone,
        phone_number_verified: true,
        role: 'farmer',
      })
      .where(eq(users.id, farmerUserId))

    const farmerLoginRes = await req('POST', '/api/auth/sign-in/email', {
      email: farmerEmail,
      password: farmerPass,
    })
    farmerCookie = extractSessionCookie(farmerLoginRes) ?? extractSessionCookie(farmerSignUp)!

    // 4. Create and sign in DA user
    const daEmail = `da-${RUN_ID}@agri.test.invalid`
    const daSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Extension DA User',
      email: daEmail,
      password: daPass,
      phoneNumber: daPhone,
    })
    const [createdDaUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, daEmail))
      .limit(1)
    daUserId = createdDaUser!.id

    await db
      .update(users)
      .set({
        role: 'da',
        city_office_id: officeId,
        phone_number: daPhone,
        phone_number_verified: true,
        assigned_kebele_ids: [kebeleId],
      })
      .where(eq(users.id, daUserId))

    const daLoginRes = await req('POST', '/api/auth/sign-in/email', {
      email: daEmail,
      password: daPass,
    })
    daCookie = extractSessionCookie(daLoginRes) ?? extractSessionCookie(daSignUp)!

    // 5. Create claimer user
    const claimerEmail = `claimer-${RUN_ID}@agri.test.invalid`
    const claimerSignUp = await req('POST', '/api/auth/sign-up/email', {
      name: 'Claiming Farmer',
      email: claimerEmail,
      password: claimerPass,
      phoneNumber: claimerPhone,
    })
    const [createdClaimerUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, claimerEmail))
      .limit(1)
    claimerUserId = createdClaimerUser!.id

    await db
      .update(users)
      .set({
        phone_number: claimerPhone,
        phone_number_verified: true,
        role: 'farmer',
      })
      .where(eq(users.id, claimerUserId))

    const claimerLoginRes = await req('POST', '/api/auth/sign-in/email', {
      email: claimerEmail,
      password: claimerPass,
    })
    claimerCookie = extractSessionCookie(claimerLoginRes) ?? extractSessionCookie(claimerSignUp)!
  })

  it('1. Farmer self-onboarding creates profile with is_verified = false and consent timestamp', async () => {
    const res = await req(
      'POST',
      '/api/v1/farmers/me',
      {
        fullName: 'Abebe Bikila',
        localIdNumber: localIdSelf,
        kebeleId: kebeleId,
        preferredLanguage: 'am',
        consentAgreed: true,
      },
      farmerCookie
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.fullName).toBe('Abebe Bikila')
    expect(body.data.localIdNumber).toBe(localIdSelf)
    expect(body.data.isVerified).toBe(false)
    expect(body.data.consentAgreed).toBe(true)
    expect(body.data.consentAgreedAt).not.toBeNull()
    expect(body.data.cityOfficeId).toBe(officeId)

    // Verify user record was assigned to the city office
    const [u] = await db.select().from(users).where(eq(users.id, farmerUserId))
    expect(u?.city_office_id).toBe(officeId)
  }, TEST_TIMEOUT)

  it('2. Farmer can retrieve own profile via GET /api/v1/farmers/me', async () => {
    const res = await req('GET', '/api/v1/farmers/me', undefined, farmerCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.localIdNumber).toBe(localIdSelf)
    expect(body.data.isVerified).toBe(false)
  }, TEST_TIMEOUT)

  it('3. DA proxy onboarding creates farmer with has_no_phone = true and auto is_verified = true', async () => {
    const res = await req(
      'POST',
      '/api/v1/farmers',
      {
        fullName: 'Chala Gemechu',
        localIdNumber: localIdProxy,
        kebeleId: kebeleId,
        hasNoPhone: true,
        preferredLanguage: 'om',
        consentAgreed: true,
      },
      daCookie
    )

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.fullName).toBe('Chala Gemechu')
    expect(body.data.hasNoPhone).toBe(true)
    expect(body.data.phoneNumber).toBeNull()
    expect(body.data.isVerified).toBe(true)
    expect(body.data.assignedDaUserId).toBe(daUserId)
    proxyFarmerId = body.data.id
  }, TEST_TIMEOUT)

  it('4. Farmer profile claiming links proxy record to authenticated user and updates phone', async () => {
    const res = await req(
      'POST',
      '/api/v1/farmers/claim',
      { localIdNumber: localIdProxy },
      claimerCookie
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(proxyFarmerId)
    expect(body.data.userId).toBe(claimerUserId)
    expect(body.data.phoneNumber).toBe(claimerPhone)
    expect(body.data.hasNoPhone).toBe(false)

    // Audit log should record farmer.claim
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, proxyFarmerId), eq(auditLogs.action, 'farmer.claim')))
    expect(logs.length).toBeGreaterThan(0)
  }, TEST_TIMEOUT)

  it('5. Field verification by DA updates is_verified = true and writes farmer.verify audit log', async () => {
    // Get self-registered farmer ID
    const own = await req('GET', '/api/v1/farmers/me', undefined, farmerCookie)
    const ownData = await own.json()
    const selfFarmerId = ownData.data.id

    const res = await req('PATCH', `/api/v1/farmers/${selfFarmerId}/verify`, {}, daCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.isVerified).toBe(true)

    // Audit log verification
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, selfFarmerId), eq(auditLogs.action, 'farmer.verify')))
    expect(logs.length).toBeGreaterThan(0)
  }, TEST_TIMEOUT)

  it('6. Strict tenant isolation: DA cannot view or verify farmers from another office', async () => {
    // Create farmer in other office
    const [foreignFarmer] = await db
      .insert(farmers)
      .values({
        cityOfficeId: otherOfficeId,
        fullName: 'Foreign Farmer',
        localIdNumber: `LID-${RUN_ID}-FOREIGN`,
        kebeleId: otherKebeleId,
        isVerified: false,
        hasNoPhone: true,
        preferredLanguage: 'om',
      })
      .returning()

    const res = await req('PATCH', `/api/v1/farmers/${foreignFarmer!.id}/verify`, {}, daCookie)
    expect([403, 404]).toContain(res.status)
  }, TEST_TIMEOUT)
})
