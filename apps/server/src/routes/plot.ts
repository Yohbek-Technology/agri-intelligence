import { Hono } from 'hono'
import { sessionGuard } from '@/middlewares/session.js'
import { tenantGuard } from '@/middlewares/tenant.js'
import { requireRoles } from '@/middlewares/rbac.js'
import {
  createPlotSchema,
  updatePlotSchema,
  agroZoneOverrideSchema,
  plotCropHistorySchema,
  geoResolveQuerySchema,
  type AreaUnit,
} from '@repo/shared'
import {
  resolveGeo,
  listFarmerPlots,
  getPlotById,
  createPlot,
  updatePlot,
  archivePlot,
  restorePlot,
  overrideAgroZone,
  listPlotCropHistory,
  upsertPlotCropHistory,
} from '@/services/plot.js'
import { getFarmerProfileByUserId, getFarmerById } from '@/services/farmer.js'

// ── Geo Resolve Router ────────────────────────────────────────────────────────
export const geoRouter = new Hono()
geoRouter.use('*', sessionGuard, tenantGuard)

geoRouter.get('/resolve', async (c) => {
  const user = c.get('user')
  const query = c.req.query()

  const parsed = geoResolveQuerySchema.safeParse(query)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid coordinate parameters.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await resolveGeo(user.cityOfficeId!, parsed.data.lat, parsed.data.lng, parsed.data.unit)
  return c.json({ data: result })
})

// ── Farmer Plots Nested Router ────────────────────────────────────────────────
export const farmerPlotsRouter = new Hono()

// Helper to assert access to a farmer
async function assertFarmerAccess(c: any, farmerId: string): Promise<boolean> {
  const user = c.get('user')
  if (user.role === 'officer' || user.role === 'system_admin') return true

  if (user.role === 'farmer') {
    const ownProfile = await getFarmerProfileByUserId(user.id)
    return ownProfile?.id === farmerId
  }

  if (user.role === 'da') {
    const farmer = await getFarmerById(farmerId, user.cityOfficeId!)
    return farmer !== null
  }

  return false
}

// GET /api/v1/farmers/:farmerId/plots — List plots
farmerPlotsRouter.get('/:farmerId/plots', tenantGuard, async (c) => {
  const user = c.get('user')
  const farmerId = c.req.param('farmerId')
  const query = c.req.query()

  const hasAccess = await assertFarmerAccess(c, farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied to this farmer’s plots.' } }, 403)
  }

  const plotsList = await listFarmerPlots(farmerId, user.cityOfficeId!, {
    status: (query.status as any) ?? 'active',
    displayUnit: query.unit as AreaUnit | undefined,
  })

  return c.json({ data: plotsList })
})

// POST /api/v1/farmers/:farmerId/plots — Create plot
farmerPlotsRouter.post('/:farmerId/plots', tenantGuard, async (c) => {
  const user = c.get('user')
  const farmerId = c.req.param('farmerId')
  const body = await c.req.json().catch(() => null)

  const hasAccess = await assertFarmerAccess(c, farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied to register plots for this farmer.' } }, 403)
  }

  const parsed = createPlotSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid plot creation payload.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await createPlot(farmerId, user.cityOfficeId!, user.id, parsed.data)
  if (result.error) {
    const status = result.error === 'coordinates_outside_jurisdiction' ? 422 : 400
    return c.json({ error: { code: result.error, message: result.message } }, status)
  }

  return c.json({ data: result.row }, 201)
})

// ── Direct Plots Router ───────────────────────────────────────────────────────
export const plotRouter = new Hono()
plotRouter.use('*', sessionGuard, tenantGuard)

// GET /api/v1/plots/:id — Get plot detail
plotRouter.get('/:id', async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')
  const query = c.req.query()

  const plot = await getPlotById(plotId, user.cityOfficeId!, query.unit as AreaUnit | undefined)
  if (!plot) {
    return c.json({ error: { code: 'not_found', message: 'Plot not found.' } }, 404)
  }

  const hasAccess = await assertFarmerAccess(c, plot.farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied to this plot.' } }, 403)
  }

  return c.json({ data: plot })
})

// PATCH /api/v1/plots/:id — Update plot
plotRouter.patch('/:id', async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')
  const body = await c.req.json().catch(() => null)

  const plot = await getPlotById(plotId, user.cityOfficeId!)
  if (!plot) {
    return c.json({ error: { code: 'not_found', message: 'Plot not found.' } }, 404)
  }

  const hasAccess = await assertFarmerAccess(c, plot.farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied to update this plot.' } }, 403)
  }

  const parsed = updatePlotSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid update payload.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await updatePlot(plotId, user.cityOfficeId!, user.id, parsed.data)
  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 400)
  }

  return c.json({ data: result.row })
})

// POST /api/v1/plots/:id/archive — Archive plot
plotRouter.post('/:id/archive', async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')

  const plot = await getPlotById(plotId, user.cityOfficeId!)
  if (!plot) {
    return c.json({ error: { code: 'not_found', message: 'Plot not found.' } }, 404)
  }

  const hasAccess = await assertFarmerAccess(c, plot.farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied.' } }, 403)
  }

  const result = await archivePlot(plotId, user.cityOfficeId!, user.id)
  return c.json({ data: result.row })
})

// POST /api/v1/plots/:id/restore — Restore plot
plotRouter.post('/:id/restore', async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')

  const plot = await getPlotById(plotId, user.cityOfficeId!)
  if (!plot) {
    return c.json({ error: { code: 'not_found', message: 'Plot not found.' } }, 404)
  }

  const hasAccess = await assertFarmerAccess(c, plot.farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied.' } }, 403)
  }

  const result = await restorePlot(plotId, user.cityOfficeId!, user.id)
  return c.json({ data: result.row })
})

// PUT /api/v1/plots/:id/agro-zone — DA/Officer zone override
plotRouter.put('/:id/agro-zone', requireRoles('da', 'officer'), async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')
  const body = await c.req.json().catch(() => null)

  const parsed = agroZoneOverrideSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid agro-zone override input.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await overrideAgroZone(plotId, user.cityOfficeId!, user.id, parsed.data)
  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 404)
  }

  return c.json({ data: result.row })
})

// GET /api/v1/plots/:id/crop-history — Get history
plotRouter.get('/:id/crop-history', async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')

  const plot = await getPlotById(plotId, user.cityOfficeId!)
  if (!plot) {
    return c.json({ error: { code: 'not_found', message: 'Plot not found.' } }, 404)
  }

  const hasAccess = await assertFarmerAccess(c, plot.farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied.' } }, 403)
  }

  const history = await listPlotCropHistory(plotId, user.cityOfficeId!)
  return c.json({ data: history })
})

// PUT /api/v1/plots/:id/crop-history/:season_year — Upsert history
plotRouter.put('/:id/crop-history/:season_year', async (c) => {
  const user = c.get('user')
  const plotId = c.req.param('id')
  const seasonYear = parseInt(c.req.param('season_year'), 10)

  if (isNaN(seasonYear) || seasonYear < 2000 || seasonYear > 2100) {
    return c.json({ error: { code: 'invalid_season', message: 'Season year must be between 2000 and 2100.' } }, 400)
  }

  const plot = await getPlotById(plotId, user.cityOfficeId!)
  if (!plot) {
    return c.json({ error: { code: 'not_found', message: 'Plot not found.' } }, 404)
  }

  const hasAccess = await assertFarmerAccess(c, plot.farmerId)
  if (!hasAccess) {
    return c.json({ error: { code: 'forbidden', message: 'Access denied.' } }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = plotCropHistorySchema.safeParse({ ...body, seasonYear })
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid crop history payload.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await upsertPlotCropHistory(
    plotId,
    user.cityOfficeId!,
    seasonYear,
    user.id,
    parsed.data
  )

  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 400)
  }

  return c.json({ data: result.row })
})
