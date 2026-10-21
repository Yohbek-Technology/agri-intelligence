import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { grievances, grievanceMessages } from '@/db/schemas/grievances.js'
import { farmers, plots } from '@/db/schemas/farmers.js'
import { users } from '@/db/schemas/auth-schema.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { getIO } from '@/config/socket.js'

export const grievancesRouter = new Hono()

// Helper to normalize grievance category
function normalizeCategory(category: string): 'input_shortage' | 'pest_outbreak' | 'water_conflict' | 'adulterated_inputs' {
  switch (category) {
    case 'input_shortage':
    case 'fertilizer_shortage':
    case 'seed_shortage':
      return 'input_shortage'
    case 'pest_outbreak':
    case 'disease_outbreak':
      return 'pest_outbreak'
    case 'water_conflict':
    case 'irrigation_conflict':
      return 'water_conflict'
    case 'adulterated_inputs':
    case 'fake_chemicals':
      return 'adulterated_inputs'
    default:
      return 'input_shortage'
  }
}

/**
 * POST /api/v1/grievances
 * Submit a new grievance ticket with voice note, text, or photos
 */
grievancesRouter.post('/', sessionGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    id: clientId,
    category = 'input_shortage',
    plotId,
    kebeleId,
    locationLatitude,
    locationLongitude,
    audioMediaId,
    textNote,
    pestId,
    priority = 'normal',
    photoMediaIds = [],
  } = body

  // Check content constraint: audio or text note required
  if (!audioMediaId && (!textNote || !textNote.trim())) {
    return c.json(
      { error: 'Grievance requires either an audio note (audioMediaId) or a text description (textNote).' },
      400
    )
  }

  // Check max 3 photos constraint
  if (Array.isArray(photoMediaIds) && photoMediaIds.length > 3) {
    return c.json({ error: 'Maximum 3 evidence photos allowed per grievance.' }, 400)
  }

  // If client provided an ID, check for idempotency
  if (clientId) {
    const existing = await db
      .select()
      .from(grievances)
      .where(eq(grievances.id, clientId))
      .limit(1)

    if (existing.length > 0 && existing[0]) {
      return c.json({ data: existing[0], idempotent: true }, 200)
    }
  }

  // Resolve farmer record & cityOfficeId
  let farmerRecord: any = null
  let cityOfficeId: string | null = null

  if (body.farmerId) {
    const found = await db.select().from(farmers).where(eq(farmers.id, body.farmerId)).limit(1)
    if (found.length > 0) farmerRecord = found[0]
  }

  if (!farmerRecord) {
    const found = await db.select().from(farmers).where(eq(farmers.userId, user.id)).limit(1)
    if (found.length > 0) farmerRecord = found[0]
  }

  if (farmerRecord) {
    cityOfficeId = farmerRecord.cityOfficeId
  } else {
    // If submitted by DA or system admin, retrieve first city office
    const office = await db.select().from(cityOffices).limit(1)
    cityOfficeId = office[0]?.id ?? null
  }

  if (!farmerRecord) {
    return c.json({ error: 'Associated farmer record not found for user.' }, 400)
  }

  if (!cityOfficeId) {
    return c.json({ error: 'City office could not be determined.' }, 400)
  }

  const grievanceId = clientId || crypto.randomUUID()
  const initialHistory = [
    {
      status: 'submitted',
      changed_by: user.id,
      timestamp: new Date().toISOString(),
      note: 'Grievance submitted by farmer',
    },
  ]

  const [newGrievance] = await db
    .insert(grievances)
    .values({
      id: grievanceId,
      cityOfficeId,
      farmerId: farmerRecord.id,
      submittedByUserId: user.id,
      category: normalizeCategory(category),
      plotId: plotId || null,
      kebeleId: kebeleId || farmerRecord.kebeleId || null,
      locationLatitude: locationLatitude ? String(locationLatitude) : null,
      locationLongitude: locationLongitude ? String(locationLongitude) : null,
      audioMediaId: audioMediaId || null,
      textNote: textNote ? textNote.trim() : null,
      pestId: pestId || null,
      status: 'submitted',
      priority: priority as any,
      photoMediaIds: photoMediaIds || [],
      statusHistory: initialHistory,
      submittedAt: new Date(),
    })
    .returning()

  // Insert initial thread message if content provided
  if (textNote || audioMediaId) {
    await db.insert(grievanceMessages).values({
      cityOfficeId,
      grievanceId: newGrievance!.id,
      senderUserId: user.id,
      messageType: audioMediaId ? 'audio' : 'text',
      textBody: textNote ? textNote.trim() : null,
      audioMediaId: audioMediaId || null,
    })
  }

  // Socket notification
  try {
    const io = getIO()
    if (io) {
      io.emit(`office:${cityOfficeId}:grievance:new`, { grievance: newGrievance })
    }
  } catch {
    // Non-fatal if socket not ready
  }

  return c.json({ data: newGrievance }, 201)
})

/**
 * GET /api/v1/grievances
 * List grievances with filter criteria
 */
grievancesRouter.get('/', sessionGuard, async (c) => {
  const user = c.get('user')
  const status = c.req.query('status')
  const category = c.req.query('category')
  const farmerIdQuery = c.req.query('farmerId')

  const conditions = []

  // If user is a farmer, strictly scope to their grievances
  if (user?.role === 'farmer') {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.userId, user.id)).limit(1)
    if (farmer) {
      conditions.push(eq(grievances.farmerId, farmer.id))
    }
  } else if (farmerIdQuery) {
    conditions.push(eq(grievances.farmerId, farmerIdQuery))
  }

  if (status) {
    conditions.push(eq(grievances.status, status as any))
  }

  if (category) {
    conditions.push(eq(grievances.category, normalizeCategory(category)))
  }

  const query = conditions.length > 0
    ? db.select().from(grievances).where(and(...conditions)).orderBy(desc(grievances.submittedAt))
    : db.select().from(grievances).orderBy(desc(grievances.submittedAt))

  const records = await query

  // Populate plot summary
  const enriched = await Promise.all(
    records.map(async (g) => {
      let plotName = null
      if (g.plotId) {
        const [plot] = await db.select().from(plots).where(eq(plots.id, g.plotId)).limit(1)
        if (plot) plotName = plot.name
      }
      return {
        ...g,
        plotName,
      }
    })
  )

  return c.json({ data: enriched })
})

/**
 * GET /api/v1/grievances/:id
 * Retrieve specific grievance with full status history and plot metadata
 */
grievancesRouter.get('/:id', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const [grievance] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, id))
    .limit(1)

  if (!grievance) {
    return c.json({ error: 'Grievance ticket not found' }, 404)
  }

  // Fetch plot metadata
  let plotDetails = null
  if (grievance.plotId) {
    const [plot] = await db.select().from(plots).where(eq(plots.id, grievance.plotId)).limit(1)
    if (plot) {
      plotDetails = {
        id: plot.id,
        name: plot.name,
        soilClass: plot.soilClass,
        estimatedArea: plot.areaHectares ? `${plot.areaHectares} ha` : `${plot.areaValue} ${plot.areaUnit}`,
      }
    }
  }

  // Fetch farmer name
  let farmerName = null
  const [farmer] = await db.select().from(farmers).where(eq(farmers.id, grievance.farmerId)).limit(1)
  if (farmer) {
    farmerName = farmer.fullName
  }

  return c.json({
    data: {
      ...grievance,
      plot: plotDetails,
      farmerName,
    },
  })
})

/**
 * GET /api/v1/grievances/:id/messages
 * List chronological threaded chat messages
 */
grievancesRouter.get('/:id/messages', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const messages = await db
    .select({
      id: grievanceMessages.id,
      cityOfficeId: grievanceMessages.cityOfficeId,
      grievanceId: grievanceMessages.grievanceId,
      senderUserId: grievanceMessages.senderUserId,
      senderName: users.name,
      senderRole: users.role,
      messageType: grievanceMessages.messageType,
      textBody: grievanceMessages.textBody,
      audioMediaId: grievanceMessages.audioMediaId,
      readAt: grievanceMessages.readAt,
      createdAt: grievanceMessages.createdAt,
    })
    .from(grievanceMessages)
    .leftJoin(users, eq(grievanceMessages.senderUserId, users.id))
    .where(eq(grievanceMessages.grievanceId, id))
    .orderBy(asc(grievanceMessages.createdAt))

  return c.json({ data: messages })
})

/**
 * POST /api/v1/grievances/:id/messages
 * Post follow-up voice or text message into thread
 */
grievancesRouter.post('/:id/messages', sessionGuard, async (c) => {
  const user = c.get('user')
  const grievanceId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))

  const {
    id: clientId,
    messageType = 'text',
    textBody,
    audioMediaId,
  } = body

  const [grievance] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, grievanceId))
    .limit(1)

  if (!grievance) {
    return c.json({ error: 'Grievance ticket not found' }, 404)
  }

  if (messageType === 'text' && (!textBody || !textBody.trim())) {
    return c.json({ error: 'textBody is required for text messages.' }, 400)
  }

  if (messageType === 'audio' && !audioMediaId) {
    return c.json({ error: 'audioMediaId is required for audio messages.' }, 400)
  }

  const messageId = clientId || crypto.randomUUID()

  // Idempotency check
  if (clientId) {
    const existing = await db
      .select()
      .from(grievanceMessages)
      .where(eq(grievanceMessages.id, clientId))
      .limit(1)
    if (existing.length > 0 && existing[0]) {
      return c.json({ data: existing[0], idempotent: true })
    }
  }

  const [message] = await db
    .insert(grievanceMessages)
    .values({
      id: messageId,
      cityOfficeId: grievance.cityOfficeId,
      grievanceId,
      senderUserId: user.id,
      messageType: messageType as any,
      textBody: textBody ? textBody.trim() : null,
      audioMediaId: audioMediaId || null,
    })
    .returning()

  // If submitted status and sender is DA/officer, auto-update to in_progress
  if (grievance.status === 'submitted' && user.role !== 'farmer') {
    const updatedHistory = [
      ...(Array.isArray(grievance.statusHistory) ? grievance.statusHistory : []),
      {
        status: 'in_progress',
        changed_by: user.id,
        timestamp: new Date().toISOString(),
        note: 'Response sent by extension desk',
      },
    ]

    await db
      .update(grievances)
      .set({
        status: 'in_progress',
        assigneeUserId: grievance.assigneeUserId || user.id,
        statusHistory: updatedHistory,
        receivedAt: grievance.receivedAt || new Date(),
        updatedAt: new Date(),
      })
      .where(eq(grievances.id, grievanceId))
  }

  // Socket broadcast
  try {
    const io = getIO()
    if (io) {
      io.emit(`grievance:${grievanceId}:message:new`, { message })
    }
  } catch {
    // Non-fatal
  }

  return c.json({ data: message }, 201)
})

/**
 * POST /api/v1/grievances/:id/confirm
 * Farmer confirms resolution of the grievance
 */
grievancesRouter.post('/:id/confirm', sessionGuard, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const [grievance] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, id))
    .limit(1)

  if (!grievance) {
    return c.json({ error: 'Grievance ticket not found' }, 404)
  }

  const updatedHistory = [
    ...(Array.isArray(grievance.statusHistory) ? grievance.statusHistory : []),
    {
      status: 'resolved',
      changed_by: user.id,
      timestamp: new Date().toISOString(),
      note: 'Farmer confirmed resolution',
    },
  ]

  const [resolved] = await db
    .update(grievances)
    .set({
      status: 'resolved',
      resolvedAt: new Date(),
      statusHistory: updatedHistory,
      updatedAt: new Date(),
    })
    .where(eq(grievances.id, id))
    .returning()

  return c.json({ data: resolved })
})

/**
 * POST /api/v1/grievances/:id/reopen
 * Farmer reopens ticket within 7 days of resolution
 */
grievancesRouter.post('/:id/reopen', sessionGuard, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))

  const [grievance] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, id))
    .limit(1)

  if (!grievance) {
    return c.json({ error: 'Grievance ticket not found' }, 404)
  }

  // 7-day cutoff validation if resolvedAt is set
  if (grievance.resolvedAt) {
    const elapsedDays = (Date.now() - new Date(grievance.resolvedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (elapsedDays > 7) {
      return c.json({ error: 'Cannot reopen ticket. 7-day cutoff window has expired.' }, 400)
    }
  }

  const updatedHistory = [
    ...(Array.isArray(grievance.statusHistory) ? grievance.statusHistory : []),
    {
      status: 'reopened',
      changed_by: user.id,
      timestamp: new Date().toISOString(),
      note: body.reason || 'Farmer requested case reopening',
    },
  ]

  const [reopened] = await db
    .update(grievances)
    .set({
      status: 'reopened',
      resolvedAt: null,
      statusHistory: updatedHistory,
      updatedAt: new Date(),
    })
    .where(eq(grievances.id, id))
    .returning()

  return c.json({ data: reopened })
})

/**
 * PATCH /api/v1/grievances/:id/status
 * DA / Officer updates status and assignee
 */
grievancesRouter.patch('/:id/status', sessionGuard, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))

  const { status, note, assigneeUserId } = body

  if (!status) {
    return c.json({ error: 'status is required.' }, 400)
  }

  const [grievance] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, id))
    .limit(1)

  if (!grievance) {
    return c.json({ error: 'Grievance ticket not found' }, 404)
  }

  const updatedHistory = [
    ...(Array.isArray(grievance.statusHistory) ? grievance.statusHistory : []),
    {
      status,
      changed_by: user.id,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
    },
  ]

  const updateFields: any = {
    status,
    statusHistory: updatedHistory,
    updatedAt: new Date(),
  }

  if (status === 'resolved') {
    updateFields.resolvedAt = new Date()
  }

  if (status === 'in_progress' && !grievance.receivedAt) {
    updateFields.receivedAt = new Date()
  }

  if (status === 'assigned' || status === 'in_progress') {
    updateFields.assigneeUserId = assigneeUserId || grievance.assigneeUserId || user.id
  } else if (assigneeUserId) {
    updateFields.assigneeUserId = assigneeUserId
  }

  const [updated] = await db
    .update(grievances)
    .set(updateFields)
    .where(eq(grievances.id, id))
    .returning()

  return c.json({ data: updated })
})
