import { Hono } from 'hono'
import { sessionGuard, tenantGuard, requireAdminOrOfficer } from '@/middlewares/index.js'
import { getOfficeSummary, getOfficeConfig, updateOfficeParameters } from '@/services/office.js'
import { officeParametersUpdateSchema } from '@repo/shared'

const officeRouter = new Hono()

officeRouter.use('*', sessionGuard, tenantGuard)

officeRouter.get('/me', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'not_found', message: 'User has no assigned city office.' } }, 404)
  }
  const isOfficer = user.role === 'officer' || user.role === 'system_admin'

  const office = await getOfficeSummary(user.cityOfficeId, isOfficer)

  if (!office) {
    return c.json({ error: { code: 'not_found', message: 'City office not found.' } }, 404)
  }

  return c.json({ data: office })
})

officeRouter.get('/me/config', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'not_found', message: 'User has no assigned city office.' } }, 404)
  }

  const config = await getOfficeConfig(user.cityOfficeId)

  if (!config) {
    return c.json({ error: { code: 'not_found', message: 'City office not found.' } }, 404)
  }

  return c.json({ data: config })
})

officeRouter.patch('/me', requireAdminOrOfficer, async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'not_found', message: 'User has no assigned city office.' } }, 404)
  }

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return c.json({ error: { code: 'bad_request', message: 'Request body required.' } }, 400)
  }

  const { defaultLanguage, parameters } = body as Record<string, unknown>

  // Validate defaultLanguage if provided
  const validLanguages = ['am', 'om', 'ti', 'en'] as const
  type AppLang = typeof validLanguages[number]
  let validatedLang: AppLang | undefined

  if (defaultLanguage !== undefined) {
    if (!validLanguages.includes(defaultLanguage as AppLang)) {
      return c.json({ error: { code: 'validation_error', message: `defaultLanguage must be one of: ${validLanguages.join(', ')}` } }, 422)
    }
    validatedLang = defaultLanguage as AppLang
  }

  // Validate parameters if provided
  let parsedParams = {}
  if (parameters !== undefined) {
    const parsed = officeParametersUpdateSchema.safeParse(parameters)
    if (!parsed.success) {
      return c.json({
        error: {
          code: 'validation_error',
          message: 'Invalid parameters.',
          details: parsed.error.flatten(),
        },
      }, 422)
    }
    parsedParams = parsed.data
  }

  const updated = await updateOfficeParameters(
    user.cityOfficeId,
    user.id,
    parsedParams,
    validatedLang
  )

  if (!updated) {
    return c.json({ error: { code: 'not_found', message: 'City office not found.' } }, 404)
  }

  return c.json({ data: updated })
})

export { officeRouter }
