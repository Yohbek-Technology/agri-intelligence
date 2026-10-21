import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { farmers } from '@/db/schemas/farmers.js'
import { cityOffices, kebeles } from '@/db/schemas/tenancy.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, isNull } from 'drizzle-orm'

const farmersRouter = new Hono()

// Helper to ensure a valid kebele exists for foreign key constraints
async function ensureValidKebele(cityOfficeId: string, preferredKebeleName: string): Promise<string> {
  const existing = await db
    .select({ id: kebeles.id })
    .from(kebeles)
    .where(and(eq(kebeles.cityOfficeId, cityOfficeId), isNull(kebeles.deletedAt)))
    .limit(1)

  if (existing.length && existing[0]) {
    return existing[0].id
  }

  // Insert a default kebele satisfying the database territoryCheck constraint
  const [created] = await db
    .insert(kebeles)
    .values({
      cityOfficeId,
      name: preferredKebeleName || 'Kebele 03 (Daawwee)',
      centroidLatitude: '8.540000',
      centroidLongitude: '39.270000',
      radiusMeters: 5000,
    })
    .returning({ id: kebeles.id })

  if (!created) {
    throw new Error('Failed to ensure kebele territory')
  }

  return created.id
}

// Helper to ensure an active city office
async function getActiveCityOfficeId(): Promise<string> {
  const existing = await db
    .select({ id: cityOffices.id })
    .from(cityOffices)
    .where(eq(cityOffices.isActive, true))
    .limit(1)

  if (existing.length && existing[0]) {
    return existing[0].id
  }

  const [created] = await db
    .insert(cityOffices)
    .values({
      name: 'Adama City Agriculture Office',
      defaultLanguage: 'am',
      isActive: true,
    })
    .returning({ id: cityOffices.id })

  return created!.id
}

/**
 * GET /api/v1/farmers/me
 * Returns the authenticated farmer's profile or null
 */
farmersRouter.get('/me', sessionGuard, async (c) => {
  const user = c.get('user')

  const existing = await db
    .select()
    .from(farmers)
    .where(and(eq(farmers.userId, user.id), isNull(farmers.deletedAt)))
    .limit(1)

  if (!existing.length || !existing[0]) {
    return c.json({ data: null })
  }

  return c.json({ data: existing[0] })
})

/**
 * PUT /api/v1/farmers/me
 * Saves or updates the farmer profile
 */
farmersRouter.put('/me', sessionGuard, async (c) => {
  return handleSaveFarmer(c)
})

farmersRouter.post('/me', sessionGuard, async (c) => {
  return handleSaveFarmer(c)
})

async function handleSaveFarmer(c: any) {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const {
    fullName,
    localIdNumber,
    district,
    kebeleId,
    preferredLanguage = 'am',
    consentAgreed = true,
  } = body

  if (!fullName || !localIdNumber) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Full name and local ID number are required.',
        },
      },
      400
    )
  }

  const cityOfficeId = user.cityOfficeId || (await getActiveCityOfficeId())
  const resolvedKebeleId = await ensureValidKebele(cityOfficeId, kebeleId || 'Kebele 03')

  // Check if farmer record already exists for this user
  const existing = await db
    .select()
    .from(farmers)
    .where(and(eq(farmers.userId, user.id), isNull(farmers.deletedAt)))
    .limit(1)

  let savedFarmer: any

  if (existing.length && existing[0]) {
    const [updated] = await db
      .update(farmers)
      .set({
        fullName: String(fullName).trim(),
        localIdNumber: String(localIdNumber).trim(),
        preferredLanguage: (preferredLanguage as any) || 'am',
        consentAgreed: Boolean(consentAgreed),
        updatedAt: new Date(),
      })
      .where(eq(farmers.id, existing[0].id))
      .returning()
    savedFarmer = updated
  } else {
    const [inserted] = await db
      .insert(farmers)
      .values({
        userId: user.id,
        cityOfficeId,
        fullName: String(fullName).trim(),
        phoneNumber: user.phoneNumber || null,
        hasNoPhone: !user.phoneNumber,
        localIdNumber: String(localIdNumber).trim(),
        kebeleId: resolvedKebeleId,
        preferredLanguage: (preferredLanguage as any) || 'am',
        consentAgreed: Boolean(consentAgreed),
        isVerified: false,
      })
      .returning()
    savedFarmer = inserted
  }

  return c.json({ data: savedFarmer })
}

/**
 * POST /api/v1/farmers/claim
 * Claims a profile pre-registered by a Development Agent in the field
 */
farmersRouter.post('/claim', sessionGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const { localIdNumber } = body

  if (!localIdNumber) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Local ID number is required to claim a profile.',
        },
      },
      400
    )
  }

  const cleanLocalId = String(localIdNumber).trim()

  // 1. Search for un-linked farmer record with matching local_id_number
  const match = await db
    .select()
    .from(farmers)
    .where(and(eq(farmers.localIdNumber, cleanLocalId), isNull(farmers.deletedAt)))
    .limit(1)

  if (match.length && match[0]) {
    const target = match[0]
    // If already owned by another user
    if (target.userId && target.userId !== user.id) {
      return c.json(
        {
          error: {
            code: 'already_claimed',
            message: 'This farmer ID has already been claimed by another account.',
          },
        },
        409
      )
    }

    const [claimed] = await db
      .update(farmers)
      .set({
        userId: user.id,
        phoneNumber: user.phoneNumber || target.phoneNumber,
        hasNoPhone: false,
        updatedAt: new Date(),
      })
      .where(eq(farmers.id, target.id))
      .returning()

    return c.json({ data: claimed })
  }

  // 2. If not found in pre-registry, create a fresh claim record
  const cityOfficeId = user.cityOfficeId || (await getActiveCityOfficeId())
  const resolvedKebeleId = await ensureValidKebele(cityOfficeId, 'Kebele 03')

  const [newFarmer] = await db
    .insert(farmers)
    .values({
      userId: user.id,
      cityOfficeId,
      fullName: user.name || 'Smallholder Farmer',
      phoneNumber: user.phoneNumber || null,
      hasNoPhone: !user.phoneNumber,
      localIdNumber: cleanLocalId,
      kebeleId: resolvedKebeleId,
      preferredLanguage: (user.preferredLanguage as any) || 'am',
      consentAgreed: true,
      isVerified: false,
    })
    .returning()

  return c.json({ data: newFarmer })
})

export { farmersRouter }
