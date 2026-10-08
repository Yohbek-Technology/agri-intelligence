import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import type { AuthVariables } from './session.js'

export const tenantGuard = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get('user')

  if (user.role === 'system_admin') {
    await next()
    return
  }

  if (!user.cityOfficeId) {
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

export function assertTenantMatch(c: Context, resourceOfficeId: string): boolean {
  const user = c.get('user')
  if (!user) return false
  if (user.role === 'system_admin') return true
  return user.cityOfficeId === resourceOfficeId
}
