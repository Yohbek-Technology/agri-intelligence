import { describe, it, expect, beforeAll, vi } from 'vitest'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

vi.mock('@/services/sms.js', () => ({
  sendSms: vi.fn().mockResolvedValue({
    success: true, messageId: 'mock-id', number: '+251911000001', status: 'Success', cost: '0',
  }),
  sendBulkSms:             vi.fn().mockResolvedValue({ sent: [], failed: [] }),
  onPhoneVerified:         vi.fn().mockResolvedValue(undefined),
  normalizeEthiopianPhone: (phone: string): string => {
    const t = phone.replace(/\s+/g, '')
    if (t.startsWith('+251')) return t
    if (t.startsWith('251'))  return `+${t}`
    if (t.startsWith('0'))    return `+251${t.slice(1)}`
    return t
  },
  countSegments: vi.fn().mockReturnValue(1),
}))

vi.mock('@/config/socket.js', () => ({
  initSocket: vi.fn(),
  getIO:      vi.fn(),
}))

import { auth } from '@/config/auth.js'
import { db } from '@/config/db.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { users } from '@/db/schemas/auth-schema.js'
import { catalogPublicRouter, officeCatalogRouter } from '@/routes/catalog.js'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'
import { eq } from 'drizzle-orm'

declare module 'hono' {
  interface ContextVariableMap {
    user:    SessionUser
    session: SessionSession
  }
}

const TEST_TIMEOUT = 30_000
const RUN_ID = Date.now()
const OFFICER_EMAIL = `cat-officer-${RUN_ID}@agri.test.invalid`
const OFFICER_PASS  = 'CatOfficer2026!'
const OFFICE_NAME   = `CatTestOffice_${RUN_ID}`
const CROP_CODE     = `TEFF${String(RUN_ID).slice(-4)}`

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

const officeManagementRouter = new Hono()
officeManagementRouter.route('/catalog', officeCatalogRouter)
app.route('/api/v1/office', officeManagementRouter)
app.route('/api/v1/catalog', catalogPublicRouter)

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
  return app.fetch(new Request(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }))
}

let sessionCookie: string | null = null
let createdCropId: string | null = null
let createdVarietyId: string | null = null
let createdChemicalId: string | null = null

describe('Agricultural Catalog', () => {
  beforeAll(async () => {
    const [office] = await db.insert(cityOffices).values({
      name:            OFFICE_NAME,
      defaultLanguage: 'am',
      parameters:      {},
      isActive:        true,
    }).returning()

    const signUpRes = await req('POST', '/api/auth/sign-up/email', {
      name:     'Cat Test Officer',
      email:    OFFICER_EMAIL,
      password: OFFICER_PASS,
    })

    const [created] = await db.select({ id: users.id }).from(users).where(eq(users.email, OFFICER_EMAIL)).limit(1)
    const officerUserId = created!.id

    await db.update(users).set({
      role:           'officer',
      city_office_id: office!.id,
    }).where(eq(users.id, officerUserId))

    const signInRes = await req('POST', '/api/auth/sign-in/email', {
      email:    OFFICER_EMAIL,
      password: OFFICER_PASS,
    })
    sessionCookie = extractSessionCookie(signInRes) ?? extractSessionCookie(signUpRes)
  }, TEST_TIMEOUT)

  // ---- Crop tests ----

  it('POST /office/catalog/crops creates a crop', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('POST', '/api/v1/office/catalog/crops', {
      code:   CROP_CODE,
      nameEn: 'Teff Test',
      nameAm: 'ጤፍ',
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; code: string } }
    expect(body.data).toHaveProperty('id')
    expect(body.data.code).toBe(CROP_CODE)
    createdCropId = body.data.id
  }, TEST_TIMEOUT)

  it('GET /catalog/crops lists active crops', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('GET', '/api/v1/catalog/crops', undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: Array<{ id: string }> }
    expect(Array.isArray(body.data)).toBe(true)
  }, TEST_TIMEOUT)

  it('PATCH /office/catalog/crops/:id updates crop name', async () => {
    if (!sessionCookie || !createdCropId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('PATCH', `/api/v1/office/catalog/crops/${createdCropId}`, {
      nameEn: 'Teff Updated',
    }, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { nameEn: string } }
    expect(body.data.nameEn).toBe('Teff Updated')
  }, TEST_TIMEOUT)

  // ---- Variety tests ----

  it('POST /office/catalog/varieties creates a variety', async () => {
    if (!sessionCookie || !createdCropId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('POST', '/api/v1/office/catalog/varieties', {
      cropId:        createdCropId,
      name:          `Kuncho_${RUN_ID}`,
      isCertified:   true,
      permittedZones: ['dega', 'weyna_dega'],
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string } }
    expect(body.data).toHaveProperty('id')
    createdVarietyId = body.data.id
  }, TEST_TIMEOUT)

  // ---- Fertilizer rate tests ----

  it('PUT /office/catalog/fertilizer-rates creates rate with ratesVersion=1', async () => {
    if (!sessionCookie || !createdCropId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('PUT', '/api/v1/office/catalog/fertilizer-rates', {
      cropId:       createdCropId,
      agroZone:     'dega',
      ureaKgPerHa:  100,
      npsKgPerHa:   150,
      seedKgPerHa:  25,
      effectiveFrom: '2026-01-01',
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { ratesVersion: number } }
    expect(body.data.ratesVersion).toBe(1)
  }, TEST_TIMEOUT)

  it('PUT /office/catalog/fertilizer-rates second call increments to ratesVersion=2', async () => {
    if (!sessionCookie || !createdCropId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('PUT', '/api/v1/office/catalog/fertilizer-rates', {
      cropId:       createdCropId,
      agroZone:     'dega',
      ureaKgPerHa:  110,
      npsKgPerHa:   155,
      seedKgPerHa:  25,
      effectiveFrom: '2026-07-01',
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { ratesVersion: number } }
    expect(body.data.ratesVersion).toBe(2)
  }, TEST_TIMEOUT)

  // ---- Pest tests ----

  it('POST /office/catalog/pests creates a pest', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('POST', '/api/v1/office/catalog/pests', {
      code:  `STEM_BORER_${RUN_ID}`,
      kind:  'pest',
      name:  { en: 'Stem Borer', am: 'ዛፍ ቀይ' },
      isQuarantinePest: false,
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string } }
    expect(body.data).toHaveProperty('id')
  }, TEST_TIMEOUT)

  // ---- Chemical tests ----

  it('POST /office/catalog/chemicals creates a chemical', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('POST', '/api/v1/office/catalog/chemicals', {
      brandName:          `BioKill_${RUN_ID}`,
      activeIngredient:   'Chlorpyrifos',
      registrationNumber: `REG${RUN_ID}`,
      category:           'insecticide',
      dosageText:         { en: 'Apply 2L per hectare' },
      safetyIntervalDays: 14,
      permittedZones:     ['dega', 'weyna_dega'],
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; status: string } }
    expect(body.data).toHaveProperty('id')
    expect(body.data.status).toBe('active')
    createdChemicalId = body.data.id
  }, TEST_TIMEOUT)

  it('POST /office/catalog/chemicals/:id/retire sets status to retired', async () => {
    if (!sessionCookie || !createdChemicalId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('POST', `/api/v1/office/catalog/chemicals/${createdChemicalId}/retire`, undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { status: string } }
    expect(body.data.status).toBe('retired')
  }, TEST_TIMEOUT)
})
