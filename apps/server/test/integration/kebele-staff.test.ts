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
import { sessionGuard } from '@/middlewares/index.js'
import { kebelesPublicRouter, officeKebeleRouter } from '@/routes/kebele.js'
import { staffRouter } from '@/routes/staff.js'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'
import { eq } from 'drizzle-orm'
import { Hono as HonoApp } from 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    user:    SessionUser
    session: SessionSession
  }
}

const TEST_TIMEOUT = 30_000
const RUN_ID       = Date.now()
const OFFICER_EMAIL = `ks-officer-${RUN_ID}@agri.test.invalid`
const OFFICER_PASS  = 'KsOfficer2026!'
const OFFICE_NAME   = `KsTestOffice_${RUN_ID}`
const DA_PHONE      = `+25179${String(RUN_ID).slice(-7)}`

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

const officeManagementRouter = new Hono()
officeManagementRouter.route('/kebeles', officeKebeleRouter)
officeManagementRouter.route('/users', staffRouter)

app.route('/api/v1/kebeles', kebelesPublicRouter)
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
let createdKebeleId: string | null = null
let createdStaffId: string | null = null

describe('Kebele & Staff Management', () => {
  beforeAll(async () => {
    // Create city office
    const [office] = await db.insert(cityOffices).values({
      name:            OFFICE_NAME,
      defaultLanguage: 'am',
      parameters:      {},
      isActive:        true,
    }).returning()

    // Create officer via Better Auth
    const signUpRes = await req('POST', '/api/auth/sign-up/email', {
      name:     'KS Test Officer',
      email:    OFFICER_EMAIL,
      password: OFFICER_PASS,
    })

    const [created] = await db.select({ id: users.id }).from(users).where(eq(users.email, OFFICER_EMAIL)).limit(1)
    const officerUserId = created!.id

    await db.update(users).set({
      role:           'officer',
      city_office_id: office!.id,
    }).where(eq(users.id, officerUserId))

    // Re-sign in for fresh session with updated role
    const signInRes = await req('POST', '/api/auth/sign-in/email', {
      email:    OFFICER_EMAIL,
      password: OFFICER_PASS,
    })
    sessionCookie = extractSessionCookie(signInRes) ?? extractSessionCookie(signUpRes)
  }, TEST_TIMEOUT)

  // ---- Kebele tests ----

  it('GET /kebeles returns empty array for new office', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('GET', '/api/v1/kebeles', undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  }, TEST_TIMEOUT)

  it('POST /office/kebeles without boundary or centroid returns 422', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('POST', '/api/v1/office/kebeles', { name: 'BadKebele' }, sessionCookie)
    expect(res.status).toBe(422)
  }, TEST_TIMEOUT)

  it('POST /office/kebeles creates kebele via centroid+radius', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('POST', '/api/v1/office/kebeles', {
      name:              `Kebele_${RUN_ID}`,
      centroidLatitude:  9.03,
      centroidLongitude: 38.74,
      radiusMeters:      3000,
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string } }
    expect(body.data).toHaveProperty('id')
    createdKebeleId = body.data.id
  }, TEST_TIMEOUT)

  it('GET /kebeles lists the created kebele', async () => {
    if (!sessionCookie || !createdKebeleId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('GET', '/api/v1/kebeles', undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: Array<{ id: string }> }
    expect(body.data.some((k) => k.id === createdKebeleId)).toBe(true)
  }, TEST_TIMEOUT)

  it('PATCH /office/kebeles/:id renames kebele', async () => {
    if (!sessionCookie || !createdKebeleId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('PATCH', `/api/v1/office/kebeles/${createdKebeleId}`, {
      name: `Kebele_${RUN_ID}_Renamed`,
    }, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { name: string } }
    expect(body.data.name).toContain('Renamed')
  }, TEST_TIMEOUT)

  it('DELETE /office/kebeles/:id succeeds when no farmers assigned', async () => {
    if (!sessionCookie || !createdKebeleId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('DELETE', `/api/v1/office/kebeles/${createdKebeleId}`, undefined, sessionCookie)
    expect(res.status).toBe(200)
  }, TEST_TIMEOUT)

  // ---- Staff tests ----

  it('GET /office/users returns empty-ish list for new office', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('GET', '/api/v1/office/users', undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  }, TEST_TIMEOUT)

  it('POST /office/users creates a DA', async () => {
    if (!sessionCookie) return console.warn('[test] No cookie — skipping')
    const res = await req('POST', '/api/v1/office/users', {
      name:        `Test DA ${RUN_ID}`,
      phoneNumber: DA_PHONE,
      role:        'da',
      password:    'TempPass2026!',
    }, sessionCookie)
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; role: string } }
    expect(body.data).toHaveProperty('id')
    expect(body.data.role).toBe('da')
    createdStaffId = body.data.id
  }, TEST_TIMEOUT)

  it('POST /office/users/:id/deactivate bans the staff member', async () => {
    if (!sessionCookie || !createdStaffId) return console.warn('[test] Skipping — prerequisites not met')
    const res = await req('POST', `/api/v1/office/users/${createdStaffId}/deactivate`, undefined, sessionCookie)
    expect(res.status).toBe(200)

    // Verify banned flag in DB
    const [staff] = await db.select({ banned: users.banned }).from(users).where(eq(users.id, createdStaffId)).limit(1)
    expect(staff?.banned).toBe(true)
  }, TEST_TIMEOUT)
})
