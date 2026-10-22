import { Hono } from 'hono'
import { sessionGuard, tenantGuard, requireAdminOrOfficer, assertTenantMatch } from '@/middlewares/index.js'
import { listStaff, createStaff, updateStaff, deactivateStaff } from '@/services/staff.js'
import { createStaffSchema, updateStaffSchema } from '@repo/shared'

export const staffRouter = new Hono()
staffRouter.use('*', sessionGuard, tenantGuard, requireAdminOrOfficer)

staffRouter.get('/', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }
  const staff = await listStaff(user.cityOfficeId)
  return c.json({ data: staff })
})

staffRouter.post('/', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = createStaffSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({
      error: { code: 'validation_error', message: 'Invalid staff data.', details: parsed.error.flatten() },
    }, 422)
  }

  const result = await createStaff(parsed.data, user.cityOfficeId)

  if ('invalidKebeleIds' in result && result.invalidKebeleIds) {
    return c.json({
      error: {
        code: 'validation_error',
        message: 'Some kebele IDs do not belong to this office.',
        invalidKebeleIds: result.invalidKebeleIds,
      },
    }, 422)
  }

  return c.json({ data: result.row }, 201)
})

staffRouter.patch('/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const id = c.req.param('id')

  const body = await c.req.json().catch(() => null)
  const parsed = updateStaffSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({
      error: { code: 'validation_error', message: 'Invalid staff data.', details: parsed.error.flatten() },
    }, 422)
  }

  const result = await updateStaff(id, user.cityOfficeId, parsed.data)

  if ('error' in result) {
    if (result.error === 'not_found') {
      return c.json({ error: { code: 'not_found', message: 'Staff member not found.' } }, 404)
    }
    if (result.error === 'invalid_kebeles') {
      return c.json({
        error: {
          code: 'validation_error',
          message: 'Some kebele IDs do not belong to this office.',
          invalidKebeleIds: (result as { error: 'invalid_kebeles'; ids: string[] }).ids,
        },
      }, 422)
    }
  }

  return c.json({ data: result })
})

staffRouter.post('/:id/deactivate', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const id = c.req.param('id')
  const result = await deactivateStaff(id, user.cityOfficeId)

  if ('error' in result) {
    return c.json({ error: { code: 'not_found', message: 'Staff member not found.' } }, 404)
  }

  return c.json({ data: { success: true } })
})
