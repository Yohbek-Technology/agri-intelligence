import { Hono } from 'hono'
import { sessionGuard } from '@/middlewares/session.js'
import { tenantGuard } from '@/middlewares/tenant.js'
import { requireOfficer } from '@/middlewares/rbac.js'
import {
  registryFilterSchema,
  exportRegistrySchema,
  type AreaUnit,
} from '@repo/shared'
import {
  queryMunicipalRegistry,
  exportMunicipalRegistry,
} from '@/services/registry.js'
import { listFarmerPlots } from '@/services/plot.js'
import { db } from '@/config/db.js'
import { plots, farmers } from '@/db/schemas/farmers.js'
import { kebeles } from '@/db/schemas/tenancy.js'
import { crops } from '@/db/schemas/catalog.js'
import { eq, and, isNull, sql } from 'drizzle-orm'
import { rowToPlot } from '@/services/plot.js'

export const officeRegistryRouter = new Hono()
officeRegistryRouter.use('*', sessionGuard, tenantGuard, requireOfficer)

// In-memory export storage for generated registry exports
const activeExports = new Map<string, { id: string; format: 'csv' | 'xlsx'; data: string; totalRows: number; createdAt: string }>()

// GET /api/v1/office/registry/farmers — Master directory
officeRegistryRouter.get('/farmers', async (c) => {
  const user = c.get('user')
  const query = c.req.query()

  const parsed = registryFilterSchema.safeParse(query)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid registry query parameters.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const { paginated, summary } = await queryMunicipalRegistry(user.cityOfficeId!, parsed.data)

  return c.json({
    data: paginated.data,
    total: paginated.total,
    page: paginated.page,
    limit: paginated.limit,
    totalPages: paginated.totalPages,
    summary,
  })
})

// GET /api/v1/office/registry/plots — All office plots
officeRegistryRouter.get('/plots', async (c) => {
  const user = c.get('user')
  const query = c.req.query()
  const displayUnit = (query.unit as AreaUnit) ?? 'hectare'

  const conditions = [
    eq(plots.cityOfficeId, user.cityOfficeId!),
    isNull(plots.deletedAt),
  ]

  if (query.kebele_id) conditions.push(eq(plots.kebeleId, query.kebele_id))
  if (query.crop_id) conditions.push(eq(plots.plannedCropId, query.crop_id))
  if (query.soil_class) conditions.push(eq(plots.soilClass, query.soil_class as any))
  if (query.status && query.status !== 'all') conditions.push(eq(plots.status, query.status as any))

  const rows = await db
    .select({
      plot: plots,
      kebeleName: kebeles.name,
      cropName: crops.nameEn,
      farmerName: farmers.fullName,
    })
    .from(plots)
    .leftJoin(kebeles, eq(plots.kebeleId, kebeles.id))
    .leftJoin(crops, eq(plots.plannedCropId, crops.id))
    .leftJoin(farmers, eq(plots.farmerId, farmers.id))
    .where(and(...conditions))
    .orderBy(plots.createdAt)
    .limit(query.limit ? parseInt(query.limit) : 50)

  const items = rows.map((r) => {
    const plotRow = rowToPlot(r.plot, r.kebeleName, r.cropName ?? null, displayUnit)
    return {
      ...plotRow,
      farmerName: r.farmerName ?? 'Unknown',
    }
  })

  return c.json({ data: items })
})

// POST /api/v1/office/registry/exports — Start registry export
officeRegistryRouter.post('/exports', async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const parsed = exportRegistrySchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid export filter payload.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const exportResult = await exportMunicipalRegistry(user.cityOfficeId!, user.id, parsed.data)
  activeExports.set(exportResult.id, {
    ...exportResult,
    createdAt: new Date().toISOString(),
  })

  return c.json({
    data: {
      id: exportResult.id,
      status: 'completed',
      downloadUrl: `/api/v1/office/registry/exports/${exportResult.id}`,
      totalRows: exportResult.totalRows,
      format: exportResult.format,
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// GET /api/v1/office/registry/exports/:id — Retrieve export file
officeRegistryRouter.get('/exports/:id', async (c) => {
  const exportId = c.req.param('id')
  const item = activeExports.get(exportId)

  if (!item) {
    return c.json({ error: { code: 'not_found', message: 'Export not found or expired.' } }, 404)
  }

  c.header('Content-Type', 'text/csv; charset=utf-8')
  c.header('Content-Disposition', `attachment; filename="land_registry_${exportId}.csv"`)
  return c.text(item.data)
})
