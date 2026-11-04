import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import type { AuthVariables } from './session.js'

export const tenantGuard = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get('user') as any

  if (user.role === 'SUPER_ADMIN' || user.role === 'super_admin') {
    await next()
    return
  }

  const userCityId = user.cityId || user.cityOfficeId
  if (!userCityId) {
    return c.json(
      {
        error: {
          code: 'forbidden',
          message: 'Account is not assigned to a city office.',
          request_id: crypto.randomUUID(),
        },
      },
      403
    )
  }

  await next()
})

export function assertTenantMatch(c: Context, resourceCityId: string): boolean {
  const user = c.get('user') as any
  if (!user) return false
  if (user.role === 'SUPER_ADMIN' || user.role === 'super_admin') return true
  const userCityId = user.cityId || user.cityOfficeId
  return userCityId === resourceCityId
}
