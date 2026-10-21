import { Hono } from 'hono'
import { db } from '@/config/db.js'
import {
  cropCycles,
  sowingLogs,
  fertilizerLogs,
  fieldOperations,
  harvestRecords,
  ledgerEntries,
} from '@/db/schemas/crop-cycles.js'
import { plots, farmers } from '@/db/schemas/farmers.js'
import { crops, cropVarieties } from '@/db/schemas/catalog.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, isNull, desc, sql } from 'drizzle-orm'

export const cropCyclesRouter = new Hono()

/**
 * GET /api/v1/cycles/:id
 * Retrieve detailed crop cycle with all logs, operations, harvest, and ledger summary
 */
cropCyclesRouter.get('/:id', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const cycle = await db
    .select()
    .from(cropCycles)
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .limit(1)

  if (!cycle.length || !cycle[0]) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  const cycleData = cycle[0]

  // Retrieve sowing log
  const sowing = await db
    .select()
    .from(sowingLogs)
    .where(and(eq(sowingLogs.cycleId, id), isNull(sowingLogs.deletedAt)))
    .limit(1)

  // Retrieve fertilizer logs
  const fert = await db
    .select()
    .from(fertilizerLogs)
    .where(and(eq(fertilizerLogs.cycleId, id), isNull(fertilizerLogs.deletedAt)))

  // Retrieve field operations
  const ops = await db
    .select()
    .from(fieldOperations)
    .where(and(eq(fieldOperations.cycleId, id), isNull(fieldOperations.deletedAt)))
    .orderBy(desc(fieldOperations.operationDate))

  // Retrieve harvest
  const harvest = await db
    .select()
    .from(harvestRecords)
    .where(and(eq(harvestRecords.cycleId, id), isNull(harvestRecords.deletedAt)))
    .limit(1)

  // Retrieve ledger entries & summary
  const ledger = await db
    .select()
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.cycleId, id), isNull(ledgerEntries.deletedAt)))
    .orderBy(desc(ledgerEntries.entryDate))

  let totalCost = 0
  let totalRevenue = 0
  for (const item of ledger) {
    const amt = parseFloat(item.amountEtb) || 0
    if (item.category === 'harvest_revenue') {
      totalRevenue += amt
    } else {
      totalCost += amt
    }
  }

  return c.json({
    data: {
      ...cycleData,
      sowing: sowing[0] || null,
      fertilizerLogs: fert,
      fieldOperations: ops,
      harvest: harvest[0] || null,
      ledger: {
        entries: ledger,
        summary: {
          totalCostEtb: totalCost,
          expectedRevenueEtb: totalRevenue,
          netMarginEtb: totalRevenue - totalCost,
        },
      },
    },
  })
})

/**
 * PUT /api/v1/cycles/:id/stage
 * Advances or audits the crop stage (CROP-3)
 */
cropCyclesRouter.put('/:id/stage', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const { stage } = body

  const validStages = [
    'land_preparation',
    'sowing',
    'vegetative',
    'flowering',
    'grain_filling',
    'harvest',
  ]
  if (!stage || !validStages.includes(stage)) {
    return c.json({ error: `Invalid stage. Must be one of: ${validStages.join(', ')}` }, 400)
  }

  const [updated] = await db
    .update(cropCycles)
    .set({
      stage,
      stageChangedAt: new Date(),
      stageChangedByUserId: user?.id || null,
      updatedAt: new Date(),
    })
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .returning()

  if (!updated) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  return c.json({ data: updated, message: 'Stage updated successfully' })
})

/**
 * PUT /api/v1/cycles/:id/sowing
 * Logs or updates sowing details (SRS CROP-2)
 */
cropCyclesRouter.put('/:id/sowing', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    plantingDate,
    seedVarietyId,
    seedVarietyOther,
    seedSource = 'certified_improved',
    seedQuantityKg,
    seedRateKgPerHa,
  } = body

  if (!plantingDate || !seedQuantityKg || (!seedVarietyId && !seedVarietyOther)) {
    return c.json(
      {
        error:
          'plantingDate, seedQuantityKg, and either seedVarietyId or seedVarietyOther are required',
      },
      400
    )
  }

  const cycle = await db
    .select()
    .from(cropCycles)
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .limit(1)

  if (!cycle.length || !cycle[0]) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  const cycleData = cycle[0]

  // Upsert sowing log
  const existing = await db
    .select({ id: sowingLogs.id })
    .from(sowingLogs)
    .where(and(eq(sowingLogs.cycleId, id), isNull(sowingLogs.deletedAt)))
    .limit(1)

  let result
  if (existing.length && existing[0]) {
    const [updated] = await db
      .update(sowingLogs)
      .set({
        plantingDate,
        seedVarietyId: seedVarietyId || null,
        seedVarietyOther: seedVarietyOther || null,
        seedSource,
        seedQuantityKg: String(seedQuantityKg),
        seedRateKgPerHa: seedRateKgPerHa ? String(seedRateKgPerHa) : null,
        updatedAt: new Date(),
      })
      .where(eq(sowingLogs.id, existing[0].id))
      .returning()
    result = updated
  } else {
    const [created] = await db
      .insert(sowingLogs)
      .values({
        cityOfficeId: cycleData.cityOfficeId,
        farmerId: cycleData.farmerId,
        cycleId: id,
        plantingDate,
        seedVarietyId: seedVarietyId || null,
        seedVarietyOther: seedVarietyOther || null,
        seedSource,
        seedQuantityKg: String(seedQuantityKg),
        seedRateKgPerHa: seedRateKgPerHa ? String(seedRateKgPerHa) : null,
        createdByUserId: user?.id || null,
      })
      .returning()
    result = created
  }

  // Also advance cycle stage to sowing/vegetative if currently land_preparation
  if (cycleData.stage === 'land_preparation') {
    await db
      .update(cropCycles)
      .set({ stage: 'sowing', stageChangedAt: new Date(), updatedAt: new Date() })
      .where(eq(cropCycles.id, id))
  }

  return c.json({ data: result, message: 'Sowing event logged' })
})

/**
 * GET /api/v1/cycles/:id/fertilizer-logs
 * List all 3 split fertilizer slots for this cycle
 */
cropCyclesRouter.get('/:id/fertilizer-logs', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const logs = await db
    .select()
    .from(fertilizerLogs)
    .where(and(eq(fertilizerLogs.cycleId, id), isNull(fertilizerLogs.deletedAt)))

  return c.json({ data: logs })
})

/**
 * PUT /api/v1/cycles/:id/fertilizer-logs/:type
 * Logs or skips fertilizer application for 'basal' | 'urea_1' | 'urea_2'
 * Enforces business logic:
 * - Basal: product must be 'nps' or 'nps_zinc'
 * - Urea 1 & Urea 2: product must be 'urea'
 * - Urea 2 validation: cannot be logged if Urea 1 is neither logged nor skipped!
 */
cropCyclesRouter.put('/:id/fertilizer-logs/:type', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const type = c.req.param('type') as 'basal' | 'urea_1' | 'urea_2'
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const validTypes = ['basal', 'urea_1', 'urea_2']
  if (!validTypes.includes(type)) {
    return c.json({ error: 'Invalid fertilizer type. Must be basal, urea_1, or urea_2' }, 400)
  }

  const cycle = await db
    .select()
    .from(cropCycles)
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .limit(1)

  if (!cycle.length || !cycle[0]) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  const cycleData = cycle[0]

  // Enforce urea_2_not_after_urea_1 constraint
  if (type === 'urea_2') {
    const urea1 = await db
      .select({ id: fertilizerLogs.id })
      .from(fertilizerLogs)
      .where(
        and(
          eq(fertilizerLogs.cycleId, id),
          eq(fertilizerLogs.applicationType, 'urea_1'),
          isNull(fertilizerLogs.deletedAt)
        )
      )
      .limit(1)

    if (!urea1.length) {
      return c.json(
        {
          error:
            'Constraint violation: 2nd Urea cannot be logged before 1st Urea is logged or marked skipped.',
        },
        400
      )
    }
  }

  const {
    applied = true,
    skipReason,
    quantityKg,
    applicationDate = new Date().toISOString().split('T')[0],
    growthStageAtApplication = 'vegetative',
    rateKgPerHa,
    daysAfterSowing,
  } = body

  // Check product matching constraint
  let product: 'nps' | 'nps_zinc' | 'urea' = 'urea'
  if (type === 'basal') {
    product = body.fertilizerProduct === 'nps_zinc' ? 'nps_zinc' : 'nps'
  }

  if (applied && (!quantityKg || parseFloat(quantityKg) <= 0)) {
    return c.json({ error: 'quantityKg must be greater than 0 when applied is true' }, 400)
  }
  if (!applied && !skipReason) {
    return c.json({ error: 'skipReason is required when applied is false' }, 400)
  }

  // Check for existing slot entry
  const existing = await db
    .select({ id: fertilizerLogs.id })
    .from(fertilizerLogs)
    .where(
      and(
        eq(fertilizerLogs.cycleId, id),
        eq(fertilizerLogs.applicationType, type),
        isNull(fertilizerLogs.deletedAt)
      )
    )
    .limit(1)

  let result
  if (existing.length && existing[0]) {
    const [updated] = await db
      .update(fertilizerLogs)
      .set({
        fertilizerProduct: product,
        applied: Boolean(applied),
        skipReason: applied ? null : skipReason,
        quantityKg: applied ? String(quantityKg) : null,
        applicationDate: applied ? applicationDate : null,
        growthStageAtApplication: applied ? growthStageAtApplication : null,
        rateKgPerHa: applied && rateKgPerHa ? String(rateKgPerHa) : null,
        daysAfterSowing: daysAfterSowing || null,
        updatedAt: new Date(),
      })
      .where(eq(fertilizerLogs.id, existing[0].id))
      .returning()
    result = updated
  } else {
    const [created] = await db
      .insert(fertilizerLogs)
      .values({
        cityOfficeId: cycleData.cityOfficeId,
        farmerId: cycleData.farmerId,
        cycleId: id,
        applicationType: type,
        fertilizerProduct: product,
        applied: Boolean(applied),
        skipReason: applied ? null : skipReason,
        quantityKg: applied ? String(quantityKg) : null,
        applicationDate: applied ? applicationDate : null,
        growthStageAtApplication: applied ? growthStageAtApplication : null,
        rateKgPerHa: applied && rateKgPerHa ? String(rateKgPerHa) : null,
        daysAfterSowing: daysAfterSowing || null,
        createdByUserId: user?.id || null,
      })
      .returning()
    result = created
  }

  return c.json({ data: result, message: `${type} log recorded` })
})

/**
 * POST /api/v1/cycles/fertilizer-logs/bulk
 * DA bulk fertilizer logger for up to 20 farmers
 */
cropCyclesRouter.post('/fertilizer-logs/bulk', sessionGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const { entries } = body

  if (!Array.isArray(entries) || entries.length === 0) {
    return c.json({ error: 'entries array is required' }, 400)
  }
  if (entries.length > 20) {
    return c.json({ error: 'Bulk logging limited to maximum 20 entries per request' }, 400)
  }

  const results = []
  for (const item of entries) {
    const { cycleId, type, quantityKg, applicationDate } = item
    if (!cycleId || !type || !quantityKg) continue

    const cycle = await db
      .select({ cityOfficeId: cropCycles.cityOfficeId, farmerId: cropCycles.farmerId })
      .from(cropCycles)
      .where(eq(cropCycles.id, cycleId))
      .limit(1)

    if (!cycle.length || !cycle[0]) continue

    const product = type === 'basal' ? 'nps' : 'urea'
    const [created] = await db
      .insert(fertilizerLogs)
      .values({
        cityOfficeId: cycle[0].cityOfficeId,
        farmerId: cycle[0].farmerId,
        cycleId,
        applicationType: type,
        fertilizerProduct: product,
        applied: true,
        quantityKg: String(quantityKg),
        applicationDate: applicationDate || new Date().toISOString().split('T')[0],
        createdByUserId: user?.id || null,
      })
      .onConflictDoNothing()
      .returning()

    if (created) results.push(created)
  }

  return c.json({ data: results, count: results.length, message: 'Bulk fertilizer logged' }, 201)
})

/**
 * POST /api/v1/cycles/:id/operations
 * Logs field operations (plowing, weeding, spraying, irrigation)
 */
cropCyclesRouter.post('/:id/operations', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    operationType: opType,
    operationDate = new Date().toISOString().split('T')[0],
    sequenceNumber = 1,
    chemicalId,
    productApplicationRate,
    rateUnit,
    irrigationMethod: irrMethod,
    durationMinutes,
  } = body

  const validOps = ['plowing', 'weeding', 'spraying', 'irrigation']
  if (!opType || !validOps.includes(opType)) {
    return c.json({ error: `operationType must be one of: ${validOps.join(', ')}` }, 400)
  }

  const cycle = await db
    .select({ cityOfficeId: cropCycles.cityOfficeId, farmerId: cropCycles.farmerId })
    .from(cropCycles)
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .limit(1)

  if (!cycle.length || !cycle[0]) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  const [created] = await db
    .insert(fieldOperations)
    .values({
      cityOfficeId: cycle[0].cityOfficeId,
      farmerId: cycle[0].farmerId,
      cycleId: id,
      operationType: opType,
      operationDate,
      sequenceNumber: sequenceNumber ? parseInt(String(sequenceNumber), 10) : null,
      chemicalId: chemicalId || null,
      productApplicationRate: productApplicationRate ? String(productApplicationRate) : null,
      rateUnit: rateUnit || null,
      irrigationMethod: irrMethod || null,
      durationMinutes: durationMinutes ? parseInt(String(durationMinutes), 10) : null,
      createdByUserId: user?.id || null,
    })
    .returning()

  return c.json({ data: created, message: 'Field operation logged' }, 201)
})

/**
 * PUT /api/v1/cycles/:id/harvest
 * Logs harvest yield volume and triggers plausibility checks (CROP-9)
 */
cropCyclesRouter.put('/:id/harvest', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    harvestDate = new Date().toISOString().split('T')[0],
    enteredVolume,
    enteredUnit = 'quintal',
    yieldQtPerHa,
    plausibilityConfirmed = false,
  } = body

  if (!enteredVolume || parseFloat(enteredVolume) <= 0) {
    return c.json({ error: 'enteredVolume must be greater than 0' }, 400)
  }

  const cycle = await db
    .select({
      cityOfficeId: cropCycles.cityOfficeId,
      farmerId: cropCycles.farmerId,
      plotId: cropCycles.plotId,
    })
    .from(cropCycles)
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .limit(1)

  if (!cycle.length || !cycle[0]) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  const numericYield = yieldQtPerHa ? parseFloat(yieldQtPerHa) : 0

  // If yield > 80 qt/ha, require plausibility confirmation (acceptance criteria)
  if (numericYield > 80 && !plausibilityConfirmed) {
    return c.json(
      {
        error:
          'High yield warning: Yield exceeds 80 Qt/Ha plausibility threshold. Plausibility confirmation is required.',
        requiresConfirmation: true,
      },
      422
    )
  }

  const [harvest] = await db
    .insert(harvestRecords)
    .values({
      cityOfficeId: cycle[0].cityOfficeId,
      farmerId: cycle[0].farmerId,
      cycleId: id,
      harvestDate,
      enteredVolume: String(enteredVolume),
      enteredUnit: enteredUnit as 'quintal' | 'kg',
      yieldQtPerHa: numericYield ? String(numericYield) : null,
      plausibilityConfirmed: Boolean(plausibilityConfirmed),
      createdByUserId: user?.id || null,
    })
    .returning()

  // Mark cycle as closed
  await db
    .update(cropCycles)
    .set({
      stage: 'harvest',
      status: 'closed',
      closedOn: harvestDate,
      updatedAt: new Date(),
    })
    .where(eq(cropCycles.id, id))

  return c.json({ data: harvest, message: 'Harvest recorded and cycle closed' })
})

/**
 * GET /api/v1/cycles/:id/ledger
 * List ledger records
 */
cropCyclesRouter.get('/:id/ledger', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const entries = await db
    .select()
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.cycleId, id), isNull(ledgerEntries.deletedAt)))
    .orderBy(desc(ledgerEntries.entryDate))

  return c.json({ data: entries })
})

/**
 * POST /api/v1/cycles/:id/ledger
 * Adds a cost or revenue entry to the crop cash ledger
 */
cropCyclesRouter.post('/:id/ledger', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    category,
    amountEtb,
    entryDate = new Date().toISOString().split('T')[0],
  } = body

  if (!category || !amountEtb || parseFloat(amountEtb) <= 0) {
    return c.json({ error: 'category and positive amountEtb are required' }, 400)
  }

  const cycle = await db
    .select({ cityOfficeId: cropCycles.cityOfficeId, farmerId: cropCycles.farmerId })
    .from(cropCycles)
    .where(and(eq(cropCycles.id, id), isNull(cropCycles.deletedAt)))
    .limit(1)

  if (!cycle.length || !cycle[0]) {
    return c.json({ error: 'Crop cycle not found' }, 404)
  }

  const [entry] = await db
    .insert(ledgerEntries)
    .values({
      cityOfficeId: cycle[0].cityOfficeId,
      farmerId: cycle[0].farmerId,
      cycleId: id,
      category,
      amountEtb: String(amountEtb),
      entryDate,
      createdByUserId: user?.id || null,
    })
    .returning()

  return c.json({ data: entry, message: 'Ledger entry added' }, 201)
})
