import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { plots, farmers, plotCropHistory } from '@/db/schemas/farmers.js'
import { cropCycles } from '@/db/schemas/crop-cycles.js'
import { crops } from '@/db/schemas/catalog.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, isNull, desc, sql } from 'drizzle-orm'

export const plotsRouter = new Hono()

export function deriveAgroZone(elevationMeters: number): 'kolla' | 'weyna_dega' | 'dega' {
  if (elevationMeters < 1500) {
    return 'kolla'
  } else if (elevationMeters <= 2300) {
    return 'weyna_dega'
  } else {
    return 'dega'
  }
}

export function getConversionFactor(unit: string): string {
  switch (unit) {
    case 'timad':
      return '0.250000'
    case 'kert':
      return '0.125000'
    case 'hectare':
    default:
      return '1.000000'
  }
}

export async function ensureValidCrop(cityOfficeId: string, cropCode = 'teff'): Promise<string> {
  const existing = await db
    .select({ id: crops.id })
    .from(crops)
    .where(and(eq(crops.cityOfficeId, cityOfficeId), eq(crops.code, cropCode)))
    .limit(1)

  if (existing.length && existing[0]) {
    return existing[0].id
  }

  const [inserted] = await db
    .insert(crops)
    .values({
      cityOfficeId,
      code: cropCode,
      nameEn: 'Teff',
      nameAm: 'ጤፍ',
      nameOm: 'Xaafii',
      nameTi: 'ጣፍ',
    })
    .onConflictDoNothing()
    .returning({ id: crops.id })

  if (inserted) return inserted.id

  const fallback = await db
    .select({ id: crops.id })
    .from(crops)
    .where(eq(crops.cityOfficeId, cityOfficeId))
    .limit(1)

  return fallback[0]!.id
}

/**
 * GET /api/v1/plots/geo/resolve
 * Resolves elevation, agro-zone, and default topography for given coordinates
 */
plotsRouter.get('/geo/resolve', async (c) => {
  const latStr = c.req.query('lat')
  const lngStr = c.req.query('lng')

  if (!latStr || !lngStr) {
    return c.json({ error: 'lat and lng query parameters required' }, 400)
  }

  const lat = parseFloat(latStr)
  const lng = parseFloat(lngStr)

  if (isNaN(lat) || isNaN(lng)) {
    return c.json({ error: 'Invalid coordinate numbers' }, 400)
  }

  // Model elevation for central Rift Valley / Ethiopian highlands (Adama / Bishoftu default ~1710m)
  // In production this interfaces with an SRTM DEM raster or local lookup table
  let elevationMeters = 1710
  if (lat >= 8.4 && lat <= 8.7 && lng >= 39.1 && lng <= 39.4) {
    elevationMeters = 1710 // Adama / Bishoftu plain
  } else if (lat > 13.0 && lat < 14.5) {
    elevationMeters = 2080 // Tigray highlands
  } else if (lat >= 11.0 && lat <= 12.5) {
    elevationMeters = 2450 // Amhara highlands (Dega)
  }

  const zone = deriveAgroZone(elevationMeters)

  return c.json({
    data: {
      latitude: lat,
      longitude: lng,
      elevationMeters,
      agroZoneDerived: zone,
      recommendedZone: zone,
      accuracyThresholdMeters: 10,
    },
  })
})

/**
 * GET /api/v1/plots
 * List plots (supports ?farmerId=...&status=...)
 */
plotsRouter.get('/', sessionGuard, async (c) => {
  const farmerId = c.req.query('farmerId')
  const status = c.req.query('status') || 'active'

  const conditions = [isNull(plots.deletedAt)]
  if (farmerId) {
    conditions.push(eq(plots.farmerId, farmerId))
  }
  if (status && (status === 'active' || status === 'archived')) {
    conditions.push(eq(plots.status, status))
  }

  const result = await db
    .select()
    .from(plots)
    .where(and(...conditions))
    .orderBy(desc(plots.createdAt))

  return c.json({ data: result })
})

/**
 * GET /api/v1/plots/:id
 * Retrieve detailed plot profile, active crop cycle, and rotation history
 */
plotsRouter.get('/:id', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const plotResult = await db
    .select()
    .from(plots)
    .where(and(eq(plots.id, id), isNull(plots.deletedAt)))
    .limit(1)

  if (!plotResult.length || !plotResult[0]) {
    return c.json({ error: 'Plot not found' }, 404)
  }

  const plot = plotResult[0]

  // Retrieve active crop cycle if present
  const activeCycle = await db
    .select()
    .from(cropCycles)
    .where(and(eq(cropCycles.plotId, id), eq(cropCycles.status, 'active'), isNull(cropCycles.deletedAt)))
    .limit(1)

  // Retrieve rotation history count
  const history = await db
    .select()
    .from(plotCropHistory)
    .where(and(eq(plotCropHistory.plotId, id), isNull(plotCropHistory.deletedAt)))
    .orderBy(desc(plotCropHistory.seasonYear))
    .limit(5)

  return c.json({
    data: {
      ...plot,
      activeCycle: activeCycle[0] || null,
      cropHistory: history,
    },
  })
})

/**
 * POST /api/v1/plots
 * Register a new plot
 */
plotsRouter.post('/', sessionGuard, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const {
    farmerId,
    name,
    areaValue,
    areaUnit = 'timad',
    centroidLatitude,
    centroidLongitude,
    gpsAccuracyMeters = 8.5,
    elevationMeters = 1710,
    agroZone,
    soilClass,
    drainage,
    plannedCropId,
    plannedSeasonYear,
  } = body

  if (!farmerId || !name || areaValue === undefined || !centroidLatitude || !centroidLongitude) {
    return c.json(
      {
        error:
          'farmerId, name, areaValue, centroidLatitude, and centroidLongitude are required fields',
      },
      400
    )
  }

  // Ensure farmer exists
  const farmerRecord = await db
    .select({ id: farmers.id, cityOfficeId: farmers.cityOfficeId, kebeleId: farmers.kebeleId })
    .from(farmers)
    .where(and(eq(farmers.id, farmerId), isNull(farmers.deletedAt)))
    .limit(1)

  if (!farmerRecord.length || !farmerRecord[0]) {
    return c.json({ error: 'Specified farmer does not exist' }, 404)
  }

  const cityOfficeId = farmerRecord[0].cityOfficeId
  const kebeleId = farmerRecord[0].kebeleId
  const numericArea = parseFloat(areaValue)
  if (isNaN(numericArea) || numericArea <= 0 || numericArea > 1000) {
    return c.json({ error: 'areaValue must be a positive number up to 1000' }, 400)
  }

  const appliedFactor = getConversionFactor(areaUnit)
  const elev = parseInt(String(elevationMeters), 10) || 1710
  const derivedZone = deriveAgroZone(elev)
  const finalAgroZone = (agroZone as 'kolla' | 'weyna_dega' | 'dega') || derivedZone

  // Handle planned crop constraints: (planned_crop_id is null) = (planned_season_year is null)
  let cleanCropId = plannedCropId || null
  let cleanSeasonYear = plannedSeasonYear ? parseInt(String(plannedSeasonYear), 10) : null
  if (cleanCropId && !cleanSeasonYear) {
    cleanSeasonYear = new Date().getFullYear()
  } else if (!cleanCropId) {
    cleanCropId = null
    cleanSeasonYear = null
  }

  const [createdPlot] = await db
    .insert(plots)
    .values({
      cityOfficeId,
      farmerId,
      name: name.trim(),
      areaValue: String(numericArea),
      areaUnit: areaUnit as 'timad' | 'kert' | 'hectare',
      hectaresPerUnitApplied: appliedFactor,
      centroidLatitude: String(centroidLatitude),
      centroidLongitude: String(centroidLongitude),
      gpsAccuracyMeters: String(gpsAccuracyMeters),
      elevationMeters: elev,
      agroZoneDerived: derivedZone,
      agroZone: finalAgroZone,
      soilClass: soilClass || 'koticha_vertisol',
      drainage: drainage || 'waterlogs',
      kebeleId,
      plannedCropId: cleanCropId,
      plannedSeasonYear: cleanSeasonYear,
      status: 'active',
    })
    .returning()

  return c.json({ data: createdPlot, message: 'Plot registered successfully' }, 201)
})

/**
 * PATCH /api/v1/plots/:id
 * Update plot attributes
 */
plotsRouter.patch('/:id', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))

  const existing = await db
    .select()
    .from(plots)
    .where(and(eq(plots.id, id), isNull(plots.deletedAt)))
    .limit(1)

  if (!existing.length || !existing[0]) {
    return c.json({ error: 'Plot not found' }, 404)
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  }

  if (body.name) updates.name = body.name.trim()
  if (body.soilClass) updates.soilClass = body.soilClass
  if (body.drainage) updates.drainage = body.drainage
  if (body.areaValue !== undefined) {
    const val = parseFloat(body.areaValue)
    if (!isNaN(val) && val > 0) {
      updates.areaValue = String(val)
      if (body.areaUnit) {
        updates.areaUnit = body.areaUnit
        updates.hectaresPerUnitApplied = getConversionFactor(body.areaUnit)
      }
    }
  }

  const [updated] = await db
    .update(plots)
    .set(updates)
    .where(eq(plots.id, id))
    .returning()

  return c.json({ data: updated })
})

/**
 * POST /api/v1/plots/:id/archive
 * Soft-archive a plot
 */
plotsRouter.post('/:id/archive', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const [archived] = await db
    .update(plots)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(and(eq(plots.id, id), isNull(plots.deletedAt)))
    .returning()

  if (!archived) {
    return c.json({ error: 'Plot not found' }, 404)
  }

  return c.json({ data: archived, message: 'Plot archived successfully' })
})

/**
 * POST /api/v1/plots/:id/restore
 * Restore an archived plot
 */
plotsRouter.post('/:id/restore', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const [restored] = await db
    .update(plots)
    .set({ status: 'active', updatedAt: new Date() })
    .where(and(eq(plots.id, id), isNull(plots.deletedAt)))
    .returning()

  if (!restored) {
    return c.json({ error: 'Plot not found' }, 404)
  }

  return c.json({ data: restored, message: 'Plot restored successfully' })
})

/**
 * GET /api/v1/plots/:id/crop-history
 * Retrieve rotation history records
 */
plotsRouter.get('/:id/crop-history', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const records = await db
    .select()
    .from(plotCropHistory)
    .where(and(eq(plotCropHistory.plotId, id), isNull(plotCropHistory.deletedAt)))
    .orderBy(desc(plotCropHistory.seasonYear))

  return c.json({ data: records })
})

/**
 * POST /api/v1/plots/:id/crop-history
 * Add past season crop history record
 */
plotsRouter.post('/:id/crop-history', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const { seasonYear, cropId, fallow = false } = body
  if (!seasonYear) {
    return c.json({ error: 'seasonYear is required' }, 400)
  }

  const plotRecord = await db
    .select({ cityOfficeId: plots.cityOfficeId, farmerId: plots.farmerId })
    .from(plots)
    .where(and(eq(plots.id, id), isNull(plots.deletedAt)))
    .limit(1)

  if (!plotRecord.length || !plotRecord[0]) {
    return c.json({ error: 'Plot not found' }, 404)
  }

  const isFallow = Boolean(fallow || !cropId)
  const [created] = await db
    .insert(plotCropHistory)
    .values({
      cityOfficeId: plotRecord[0].cityOfficeId,
      farmerId: plotRecord[0].farmerId,
      plotId: id,
      seasonYear: parseInt(String(seasonYear), 10),
      cropId: isFallow ? null : cropId,
      fallow: isFallow,
      createdByUserId: user?.id || null,
    })
    .returning()

  return c.json({ data: created, message: 'Crop history recorded' }, 201)
})

/**
 * GET /api/v1/plots/:id/cycles
 * List all crop cycles for a plot
 */
plotsRouter.get('/:id/cycles', sessionGuard, async (c) => {
  const plotId = c.req.param('id')

  const cycles = await db
    .select()
    .from(cropCycles)
    .where(and(eq(cropCycles.plotId, plotId), isNull(cropCycles.deletedAt)))
    .orderBy(desc(cropCycles.seasonYear))

  return c.json({ data: cycles })
})

/**
 * POST /api/v1/plots/:id/cycles
 * Create a new cropping cycle for a plot (enforcing 1 active cycle per plot)
 */
plotsRouter.post('/:id/cycles', sessionGuard, async (c) => {
  const plotId = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    cropId,
    varietyId,
    seasonYear = 2024,
    startedOn = new Date().toISOString().split('T')[0],
  } = body

  const plotRecord = await db
    .select()
    .from(plots)
    .where(and(eq(plots.id, plotId), isNull(plots.deletedAt)))
    .limit(1)

  if (!plotRecord.length || !plotRecord[0]) {
    return c.json({ error: 'Plot not found' }, 404)
  }

  // Check 1 active cycle constraint (uq_crop_cycles_one_active)
  const existingActive = await db
    .select({ id: cropCycles.id })
    .from(cropCycles)
    .where(
      and(
        eq(cropCycles.plotId, plotId),
        eq(cropCycles.status, 'active'),
        isNull(cropCycles.deletedAt)
      )
    )
    .limit(1)

  if (existingActive.length && existingActive[0]) {
    return c.json(
      {
        error:
          'Conflict: An active crop cycle already exists for this plot. Complete or archive the active cycle before initiating a new one.',
      },
      409
    )
  }

  const resolvedCropId = cropId || (await ensureValidCrop(plotRecord[0].cityOfficeId, 'teff'))

  const [created] = await db
    .insert(cropCycles)
    .values({
      cityOfficeId: plotRecord[0].cityOfficeId,
      farmerId: plotRecord[0].farmerId,
      plotId,
      cropId: resolvedCropId,
      varietyId: varietyId || null,
      seasonYear: parseInt(String(seasonYear), 10),
      stage: 'land_preparation',
      status: 'active',
      startedOn,
      createdByUserId: user?.id || null,
    })
    .returning()

  return c.json({ data: created, message: 'Crop cycle initiated' }, 201)
})
