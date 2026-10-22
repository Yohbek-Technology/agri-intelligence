import { Hono } from 'hono'
import { sessionGuard } from '@/middlewares/session.js'
import { tenantGuard } from '@/middlewares/tenant.js'
import { requireRoles, requireOfficer } from '@/middlewares/rbac.js'
import {
  farmerOnboardingSchema,
  proxyFarmerOnboardingSchema,
  updateFarmerProfileSchema,
  claimFarmerProfileSchema,
  verifyFarmerSchema,
  reassignDaSchema,
  bulkReassignDaSchema,
} from '@repo/shared'
import {
  getFarmerProfileByUserId,
  getFarmerById,
  createSelfFarmerProfile,
  createProxyFarmerProfile,
  claimFarmerProfile,
  updateFarmerProfile,
  verifyFarmer,
  assignFarmerToDa,
  bulkAssignFarmersToDa,
  listFarmers,
} from '@/services/farmer.js'
import { farmerPlotsRouter } from './plot.js'

export const farmerRouter = new Hono()

// Apply sessionGuard to all farmer routes
farmerRouter.use('*', sessionGuard)

// Mount nested plots router (/api/v1/farmers/:farmerId/plots)
farmerRouter.route('/', farmerPlotsRouter)

// ── Farmer Self-Service ───────────────────────────────────────────────────────

// POST /api/v1/farmers/me — Self-onboard after phone OTP
farmerRouter.post('/me', async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => null)

  const parsed = farmerOnboardingSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid farmer onboarding input.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await createSelfFarmerProfile(user.id, parsed.data)
  if (result.error) {
    const status = result.error === 'duplicate_local_id' ? 409 : 400
    return c.json({ error: { code: result.error, message: result.message } }, status)
  }

  return c.json({ data: result.row }, 201)
})

// GET /api/v1/farmers/me — Get own profile
farmerRouter.get('/me', async (c) => {
  const user = c.get('user')
  const profile = await getFarmerProfileByUserId(user.id)

  if (!profile) {
    return c.json(
      { error: { code: 'profile_not_found', message: 'No farmer profile found for this account.' } },
      404
    )
  }

  return c.json({ data: profile })
})

// PATCH /api/v1/farmers/me — Update own profile
farmerRouter.patch('/me', async (c) => {
  const user = c.get('user')
  const profile = await getFarmerProfileByUserId(user.id)

  if (!profile) {
    return c.json(
      { error: { code: 'profile_not_found', message: 'No farmer profile found for this account.' } },
      404
    )
  }

  const body = await c.req.json().catch(() => null)
  const parsed = updateFarmerProfileSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid update input.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await updateFarmerProfile(profile.id, parsed.data, user.id)
  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 400)
  }

  return c.json({ data: result.row })
})

// POST /api/v1/farmers/claim — Claim an unlinked proxy profile
farmerRouter.post('/claim', async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => null)

  const parsed = claimFarmerProfileSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid claim input.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await claimFarmerProfile(user.id, parsed.data)
  if (result.error) {
    const status = result.error === 'profile_not_found' ? 404 : 400
    return c.json({ error: { code: result.error, message: result.message } }, status)
  }

  return c.json({ data: result.row })
})

// ── Extension Staff & Officer Routes ──────────────────────────────────────────

// POST /api/v1/farmers — DA / Officer proxy onboarding
farmerRouter.post('/', tenantGuard, requireRoles('da', 'officer'), async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => null)

  const parsed = proxyFarmerOnboardingSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid proxy farmer input.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await createProxyFarmerProfile(user.id, user.cityOfficeId!, parsed.data)
  if (result.error) {
    const status = result.error === 'duplicate_local_id' ? 409 : 400
    return c.json({ error: { code: result.error, message: result.message } }, status)
  }

  return c.json({ data: result.row }, 201)
})

// GET /api/v1/farmers — Search and filter farmers
farmerRouter.get('/', tenantGuard, requireRoles('da', 'officer', 'system_admin'), async (c) => {
  const user = c.get('user')
  const query = c.req.query()

  // If user is DA, restrict to assigned farmers unless specific filter requested within their rights
  const assignedDaFilter =
    user.role === 'da' ? user.id : query.assigned_da_user_id

  const res = await listFarmers(user.cityOfficeId!, {
    q: query.q,
    kebeleId: query.kebele_id,
    assignedDaUserId: assignedDaFilter,
    isVerified: query.is_verified as 'all' | 'true' | 'false' | undefined,
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? parseInt(query.limit) : 50,
  })

  return c.json(res)
})

// GET /api/v1/farmers/:id — Get farmer detail
farmerRouter.get('/:id', tenantGuard, requireRoles('da', 'officer', 'system_admin'), async (c) => {
  const user = c.get('user')
  const farmerId = c.req.param('id')

  const farmer = await getFarmerById(farmerId, user.cityOfficeId!)
  if (!farmer) {
    return c.json({ error: { code: 'not_found', message: 'Farmer not found.' } }, 404)
  }

  // DAs may only inspect farmers in their jurisdiction / assigned
  if (user.role === 'da' && farmer.assignedDaUserId && farmer.assignedDaUserId !== user.id) {
    return c.json({ error: { code: 'forbidden', message: 'Access limited to assigned farmers.' } }, 403)
  }

  return c.json({ data: farmer })
})

// PATCH /api/v1/farmers/:id — Update farmer detail
farmerRouter.patch('/:id', tenantGuard, requireRoles('da', 'officer'), async (c) => {
  const user = c.get('user')
  const farmerId = c.req.param('id')

  const body = await c.req.json().catch(() => null)
  const parsed = updateFarmerProfileSchema.safeParse(body)
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

  const result = await updateFarmerProfile(farmerId, parsed.data, user.id)
  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 400)
  }

  return c.json({ data: result.row })
})

// PATCH /api/v1/farmers/:id/verify — Field verification
farmerRouter.patch('/:id/verify', tenantGuard, requireRoles('da', 'officer'), async (c) => {
  const user = c.get('user')
  const farmerId = c.req.param('id')

  const result = await verifyFarmer(farmerId, user.cityOfficeId!, user.id)
  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 404)
  }

  return c.json({ data: result.row })
})

// ── Officer Reassignment Endpoints ────────────────────────────────────────────

export const officeFarmerRouter = new Hono()
officeFarmerRouter.use('*', sessionGuard, tenantGuard, requireOfficer)

// PATCH /api/v1/office/farmers/:id/assign-da — Assign DA
officeFarmerRouter.patch('/:id/assign-da', async (c) => {
  const user = c.get('user')
  const farmerId = c.req.param('id')
  const body = await c.req.json().catch(() => null)

  const parsed = reassignDaSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid assignment input.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await assignFarmerToDa(farmerId, user.cityOfficeId!, parsed.data.assignedDaUserId, user.id)
  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 400)
  }

  return c.json({ data: result.row })
})

// POST /api/v1/office/farmers/reassign — Bulk reassign
officeFarmerRouter.post('/reassign', async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => null)

  const parsed = bulkReassignDaSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: 'validation_error',
          message: 'Invalid bulk assignment payload.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      422
    )
  }

  const result = await bulkAssignFarmersToDa(
    parsed.data.farmerIds,
    user.cityOfficeId!,
    parsed.data.assignedDaUserId,
    user.id
  )

  if (result.error) {
    return c.json({ error: { code: result.error, message: result.message } }, 400)
  }

  return c.json({ data: { updatedCount: result.updatedCount } })
})
