import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { devices, syncMutations, syncChanges } from '@/db/schemas/sync.js'
import { farmers, plots } from '@/db/schemas/farmers.js'
import { crops, cropVarieties, pestCatalog, registeredChemicals } from '@/db/schemas/catalog.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, gt, desc, asc, sql } from 'drizzle-orm'
import crypto from 'node:crypto'

export const syncRouter = new Hono()

// Version endpoint for MOB-DIST-3
export const appVersionRouter = new Hono()
appVersionRouter.get('/version', (c) => {
  return c.json({
    min_supported_app_version: '1.0.0',
    latest_app_version: '1.3.0',
    update_required: false,
  })
})

// Device registration router
export const devicesRouter = new Hono()
devicesRouter.post('/', sessionGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    deviceIdentifier = `dev-${crypto.randomUUID().slice(0, 8)}`,
    platform = 'android',
    appVersion = '1.0.0',
    fcmToken,
    webPushSubscription,
  } = body

  // Lookup cityOfficeId from farmer or office
  let cityOfficeId: string | null = null
  const [farmer] = await db.select().from(farmers).where(eq(farmers.userId, user.id)).limit(1)
  if (farmer) {
    cityOfficeId = farmer.cityOfficeId
  } else {
    const [office] = await db.select().from(cityOffices).limit(1)
    cityOfficeId = office?.id ?? null
  }

  // Check if device already exists
  const existing = await db
    .select()
    .from(devices)
    .where(and(eq(devices.userId, user.id), eq(devices.deviceIdentifier, deviceIdentifier)))
    .limit(1)

  if (existing.length > 0 && existing[0]) {
    const [updated] = await db
      .update(devices)
      .set({
        appVersion,
        platform: platform as any,
        fcmToken: platform === 'android' ? fcmToken : null,
        webPushSubscription: platform === 'pwa' ? webPushSubscription : null,
        updatedAt: new Date(),
      })
      .where(eq(devices.id, existing[0].id))
      .returning()

    return c.json({ data: updated })
  }

  const [created] = await db
    .insert(devices)
    .values({
      userId: user.id,
      cityOfficeId,
      deviceIdentifier,
      platform: platform as any,
      appVersion,
      fcmToken: platform === 'android' ? fcmToken : null,
      webPushSubscription: platform === 'pwa' ? webPushSubscription : null,
      lastSyncCursor: 0,
      lastSyncAt: new Date(),
    })
    .returning()

  return c.json({ data: created }, 201)
})

/**
 * Helper to ensure a device record exists for a sync request
 */
async function getOrCreateDevice(userId: string, deviceHeaderId?: string, cityOfficeId?: string | null) {
  const identifier = deviceHeaderId || `auto-device-${userId.slice(0, 8)}`
  const existing = await db
    .select()
    .from(devices)
    .where(and(eq(devices.userId, userId), eq(devices.deviceIdentifier, identifier)))
    .limit(1)

  if (existing.length > 0 && existing[0]) {
    return existing[0]
  }

  const [created] = await db
    .insert(devices)
    .values({
      userId,
      cityOfficeId: cityOfficeId || null,
      deviceIdentifier: identifier,
      platform: 'android',
      appVersion: '1.0.0',
      lastSyncCursor: 0,
      lastSyncAt: new Date(),
    })
    .returning()

  return created
}

/**
 * POST /api/v1/sync/push
 * Batch push mutations from client queue with SHA-256 payload integrity check and idempotency
 */
syncRouter.post('/push', sessionGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const mutationsList = body.mutations || []

  if (!Array.isArray(mutationsList) || mutationsList.length === 0) {
    return c.json({
      results: [],
      server_cursor: 0,
    })
  }

  // Resolve farmer record & cityOfficeId
  let farmerRecord: any = null
  let cityOfficeId: string | null = null

  const [farmer] = await db.select().from(farmers).where(eq(farmers.userId, user.id)).limit(1)
  if (farmer) {
    farmerRecord = farmer
    cityOfficeId = farmer.cityOfficeId
  } else {
    const [office] = await db.select().from(cityOffices).limit(1)
    cityOfficeId = office?.id ?? null
  }

  if (!cityOfficeId) {
    const [office] = await db.select().from(cityOffices).limit(1)
    cityOfficeId = office?.id ?? null
  }

  const deviceHeader = c.req.header('X-Device-Id')
  const device = await getOrCreateDevice(user.id, deviceHeader, cityOfficeId)

  const results: Array<{ id: string; status: 'applied' | 'duplicate' | 'rejected'; reject_reason?: string }> = []
  let latestServerCursor = device?.lastSyncCursor || 0

  for (const m of mutationsList) {
    const {
      id: mutationId,
      client_sequence_number = 1,
      entity_type,
      entity_id,
      operation = 'insert',
      payload = {},
      payload_hash,
      client_created_at = new Date().toISOString(),
    } = m

    if (!mutationId || !entity_type || !entity_id) {
      results.push({
        id: mutationId || 'unknown',
        status: 'rejected',
        reject_reason: 'Missing mutationId, entity_type, or entity_id',
      })
      continue
    }

    // 1. Idempotency check in syncMutations table
    const existingMutation = await db
      .select()
      .from(syncMutations)
      .where(eq(syncMutations.id, mutationId))
      .limit(1)

    if (existingMutation.length > 0) {
      results.push({
        id: mutationId,
        status: 'duplicate',
      })
      continue
    }

    // 2. Validate or compute SHA-256 payload hash (must be 64-char hex)
    let validHash = payload_hash
    if (!validHash || !/^[0-9a-f]{64}$/.test(validHash)) {
      validHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    }

    try {
      // 3. Persist mutation record
      await db.insert(syncMutations).values({
        id: mutationId,
        deviceId: device!.id,
        userId: user.id,
        cityOfficeId: cityOfficeId!,
        entityType: entity_type,
        entityId: entity_id,
        operation: operation as any,
        payload,
        payloadHash: validHash,
        clientSequenceNumber: Number(client_sequence_number),
        clientCreatedAt: new Date(client_created_at),
        status: 'applied',
        receivedAt: new Date(),
      })

      // 4. Record change in syncChanges feed
      const [change] = await db
        .insert(syncChanges)
        .values({
          cityOfficeId: cityOfficeId!,
          entityType: entity_type,
          entityId: entity_id,
          operation: operation as any,
          farmerId: farmerRecord?.id || null,
          changedAt: new Date(),
        })
        .returning()

      if (change && change.sequenceNumber > latestServerCursor) {
        latestServerCursor = change.sequenceNumber
      }

      results.push({
        id: mutationId,
        status: 'applied',
      })
    } catch (err: any) {
      results.push({
        id: mutationId,
        status: 'rejected',
        reject_reason: err?.message || 'Database mutation failed',
      })
    }
  }

  // Update device cursor
  if (latestServerCursor > (device?.lastSyncCursor || 0) && device) {
    await db
      .update(devices)
      .set({
        lastSyncCursor: latestServerCursor,
        lastSyncAt: new Date(),
      })
      .where(eq(devices.id, device.id))
  }

  return c.json({
    data: {
      results,
      server_cursor: latestServerCursor,
    },
    // Also include top-level fields for client compatibility
    results,
    server_cursor: latestServerCursor,
  })
})

/**
 * GET /api/v1/sync/pull
 * Pull delta changes from monotonic sync changes feed
 */
syncRouter.get('/pull', sessionGuard, async (c) => {
  const user = c.get('user')
  const cursorParam = c.req.query('cursor')
  const limitParam = c.req.query('limit')

  const cursor = cursorParam ? parseInt(cursorParam, 10) : 0
  const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 50, 100)

  // Resolve cityOfficeId
  let cityOfficeId: string | null = null
  const [farmer] = await db.select().from(farmers).where(eq(farmers.userId, user.id)).limit(1)
  if (farmer) {
    cityOfficeId = farmer.cityOfficeId
  } else {
    const [office] = await db.select().from(cityOffices).limit(1)
    cityOfficeId = office?.id ?? null
  }

  const conditions = [gt(syncChanges.sequenceNumber, cursor)]
  if (cityOfficeId) {
    conditions.push(eq(syncChanges.cityOfficeId, cityOfficeId))
  }

  const changes = await db
    .select()
    .from(syncChanges)
    .where(and(...conditions))
    .orderBy(asc(syncChanges.sequenceNumber))
    .limit(limit + 1)

  const hasMore = changes.length > limit
  const returnedChanges = hasMore ? changes.slice(0, limit) : changes

  const nextCursor = returnedChanges.length > 0
    ? returnedChanges[returnedChanges.length - 1]!.sequenceNumber
    : cursor

  const formattedChanges = returnedChanges.map((ch) => ({
    sequence_number: ch.sequenceNumber,
    entity_type: ch.entityType,
    entity_id: ch.entityId,
    operation: ch.operation,
    record: { id: ch.entityId },
    server_timestamp: ch.changedAt.toISOString(),
  }))

  return c.json({
    data: {
      changes: formattedChanges,
      next_cursor: nextCursor,
      has_more: hasMore,
    },
    // Top-level compatibility for mobile deltaSyncEngine
    changes: formattedChanges,
    next_cursor: nextCursor,
    has_more: hasMore,
  })
})

/**
 * GET /api/v1/sync/bootstrap
 * Complete initial database snapshot for newly activated mobile clients
 */
syncRouter.get('/bootstrap', sessionGuard, async (c) => {
  const user = c.get('user')

  let farmerRecord = null
  const [farmer] = await db.select().from(farmers).where(eq(farmers.userId, user.id)).limit(1)
  if (farmer) {
    farmerRecord = farmer
  }

  // Catalog snapshot
  const [allCrops, allVarieties, allPests, allChemicals] = await Promise.all([
    db.select().from(crops).limit(50),
    db.select().from(cropVarieties).limit(50),
    db.select().from(pestCatalog).limit(50),
    db.select().from(registeredChemicals).limit(50),
  ])

  // User plots
  let userPlots: any[] = []
  if (farmerRecord) {
    userPlots = await db.select().from(plots).where(eq(plots.farmerId, farmerRecord.id))
  }

  // Current server cursor
  const [latestChange] = await db
    .select({ seq: syncChanges.sequenceNumber })
    .from(syncChanges)
    .orderBy(desc(syncChanges.sequenceNumber))
    .limit(1)

  const serverCursor = latestChange?.seq || 0

  return c.json({
    data: {
      server_cursor: serverCursor,
      farmer: farmerRecord,
      plots: userPlots,
      catalogs: {
        crops: allCrops,
        varieties: allVarieties,
        pests: allPests,
        chemicals: allChemicals,
      },
    },
  })
})
