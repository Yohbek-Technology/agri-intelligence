import { Hono } from 'hono'
import { sessionGuard, tenantGuard } from '@/middlewares/index.js'
import { getOfficeSummary, getOfficeConfig } from '@/services/office.js'

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

export { officeRouter }
