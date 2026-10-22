import { Hono } from 'hono'
import { sessionGuard, tenantGuard, requireAdminOrOfficer, assertTenantMatch } from '@/middlewares/index.js'
import { listKebeles, createKebele, updateKebele, deleteKebele } from '@/services/kebele.js'
import { createKebeleSchema, updateKebeleSchema } from '@repo/shared'

// Public (any authenticated staff) — read-only
export const kebelesPublicRouter = new Hono()
kebelesPublicRouter.use('*', sessionGuard, tenantGuard)

kebelesPublicRouter.get('/', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }
  const list = await listKebeles(user.cityOfficeId)
  return c.json({ data: list })
})

// Officer-only writes
export const officeKebeleRouter = new Hono()
officeKebeleRouter.use('*', sessionGuard, tenantGuard, requireAdminOrOfficer)

officeKebeleRouter.post('/', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const body = await c.req.json().catch(() => null)
  const parsed = createKebeleSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({
      error: { code: 'validation_error', message: 'Invalid kebele data.', details: parsed.error.flatten() },
    }, 422)
  }

  try {
    const kebele = await createKebele(parsed.data, user.cityOfficeId)
    return c.json({ data: kebele }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('uq_kebeles_name_active')) {
      return c.json({ error: { code: 'conflict', message: 'A kebele with this name already exists.' } }, 409)
    }
    throw err
  }
})

officeKebeleRouter.patch('/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const parsed = updateKebeleSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({
      error: { code: 'validation_error', message: 'Invalid kebele data.', details: parsed.error.flatten() },
    }, 422)
  }

  const updated = await updateKebele(id, user.cityOfficeId, parsed.data)
  if (!updated) {
    return c.json({ error: { code: 'not_found', message: 'Kebele not found.' } }, 404)
  }

  if (!assertTenantMatch(c, updated.cityOfficeId)) {
    return c.json({ error: { code: 'forbidden', message: 'Tenant mismatch.' } }, 403)
  }

  return c.json({ data: updated })
})

officeKebeleRouter.delete('/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const id = c.req.param('id')
  const result = await deleteKebele(id, user.cityOfficeId)

  if ('error' in result) {
    if (result.error === 'has_farmers') {
      return c.json({ error: { code: 'conflict', message: 'Kebele has active farmers assigned.' } }, 409)
    }
  }

  return c.json({ data: { success: true } })
})
