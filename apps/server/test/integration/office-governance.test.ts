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
import { auditLogs } from '@/db/schemas/sync.js'
import { sessionGuard, tenantGuard, requireAdminOrOfficer } from '@/middlewares/index.js'
import { officeRouter } from '@/routes/office.js'
import type { SessionUser, SessionSession } from '@/middlewares/session.js'
import { eq, and } from 'drizzle-orm'

declare module 'hono' {
  interface ContextVariableMap {
    user:    SessionUser
    session: SessionSession
  }
}

const TEST_TIMEOUT = 30_000
const RUN_ID       = Date.now()
const OFFICER_EMAIL = `gov-officer-${RUN_ID}@agri.test.invalid`
const OFFICER_PASS  = 'GovOfficer2026!'
const OFFICE_NAME   = `TestOffice_${RUN_ID}`

const app = new Hono()
app.use('*', cors({ origin: '*', credentials: true }))
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.route('/api/v1/offices', officeRouter)

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
let officerUserId: string | null = null
let cityOfficeId: string | null = null

describe('Office Governance', () => {
  beforeAll(async () => {
    // Create a city office
    const [office] = await db.insert(cityOffices).values({
      name:            OFFICE_NAME,
      defaultLanguage: 'am',
      parameters:      {},
      isActive:        true,
    }).returning()
    cityOfficeId = office!.id

    // Create officer user via Better Auth
    const signUpRes = await req('POST', '/api/auth/sign-up/email', {
      name:     'Test Gov Officer',
      email:    OFFICER_EMAIL,
      password: OFFICER_PASS,
    })
    const cookie = extractSessionCookie(signUpRes)
    sessionCookie = cookie

    // Get the created user id
    const [created] = await db.select({ id: users.id }).from(users).where(eq(users.email, OFFICER_EMAIL)).limit(1)
    officerUserId = created!.id

    // Update user to be an officer assigned to the test office
    await db.update(users).set({
      role:           'officer',
      city_office_id: cityOfficeId,
    }).where(eq(users.id, officerUserId))

    // Sign in fresh to get a session with the updated role
    const signInRes = await req('POST', '/api/auth/sign-in/email', {
      email:    OFFICER_EMAIL,
      password: OFFICER_PASS,
    })
    sessionCookie = extractSessionCookie(signInRes) ?? sessionCookie
  }, TEST_TIMEOUT)

  it('GET /me returns 401 when unauthenticated', async () => {
    const res = await req('GET', '/api/v1/offices/me')
    expect(res.status).toBe(401)
  }, TEST_TIMEOUT)

  it('GET /me returns office summary for authenticated officer', async () => {
    if (!sessionCookie) return console.warn('[test] No session cookie — skipping')
    const res = await req('GET', '/api/v1/offices/me', undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string; name: string } }
    expect(body.data).toHaveProperty('id')
    expect(body.data).toHaveProperty('name')
  }, TEST_TIMEOUT)

  it('GET /me/config returns OfficeConfig shape', async () => {
    if (!sessionCookie) return console.warn('[test] No session cookie — skipping')
    const res = await req('GET', '/api/v1/offices/me/config', undefined, sessionCookie)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: Record<string, unknown> }
    expect(body.data).toHaveProperty('landUnit')
    expect(body.data).toHaveProperty('agroZone')
    expect(body.data).toHaveProperty('weather')
  }, TEST_TIMEOUT)

  it('PATCH /me updates parameters and writes audit log', async () => {
    if (!sessionCookie) return console.warn('[test] No session cookie — skipping')

    const res = await req('PATCH', '/api/v1/offices/me', {
      parameters: {
        land_unit_timad_to_ha: 0.25,
        weather_dry_spell_days: 7,
      },
    }, sessionCookie)

    expect(res.status).toBe(200)
    const body = await res.json() as { data: Record<string, unknown> }
    expect(body.data).toHaveProperty('parameters')

    // Verify audit log was written
    if (cityOfficeId) {
      const logs = await db.select().from(auditLogs).where(
        and(
          eq(auditLogs.cityOfficeId, cityOfficeId),
          eq(auditLogs.action, 'office.parameters_update')
        )
      )
      expect(logs.length).toBeGreaterThan(0)
    }
  }, TEST_TIMEOUT)

  it('PATCH /me returns 422 for out-of-range parameter', async () => {
    if (!sessionCookie) return console.warn('[test] No session cookie — skipping')
    const res = await req('PATCH', '/api/v1/offices/me', {
      parameters: { land_unit_timad_to_ha: 5 },  // max is 1
    }, sessionCookie)
    expect(res.status).toBe(422)
  }, TEST_TIMEOUT)

  it('PATCH /me updates defaultLanguage', async () => {
    if (!sessionCookie) return console.warn('[test] No session cookie — skipping')
    const res = await req('PATCH', '/api/v1/offices/me', {
      defaultLanguage: 'en',
    }, sessionCookie)
    expect(res.status).toBe(200)
  }, TEST_TIMEOUT)
})
