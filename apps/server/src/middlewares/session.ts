import { createMiddleware } from 'hono/factory'
import type { Auth } from '@/config/auth.js'
import { auth } from '@/config/auth.js'

export type SessionUser    = Auth['$Infer']['Session']['user']
export type SessionSession = Auth['$Infer']['Session']['session']

export interface AuthVariables {
  user: SessionUser
  session: SessionSession
}

declare module 'hono' {
  interface ContextVariableMap {
    user: SessionUser
    session: SessionSession
  }
}

export const sessionGuard = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!result?.user || !result?.session) {
    return c.json(
      {
        error: {
          code: 'unauthenticated',
          message: 'A valid session is required.',
          request_id: crypto.randomUUID(),
        },
      },
      401
    )
  }

  const user = result.user as any
  if (user.status === 'SUSPENDED' || user.banned) {
    return c.json(
      {
        error: {
          code: 'forbidden',
          message: 'This account has been suspended.',
          request_id: crypto.randomUUID(),
        },
      },
      403
    )
  }

  if (user.status === 'REJECTED') {
    return c.json(
      {
        error: {
          code: 'forbidden',
          message: 'This registration has been rejected.',
          request_id: crypto.randomUUID(),
        },
      },
      403
    )
  }

  if (user.deletedAt) {
    return c.json(
      {
        error: {
          code: 'unauthenticated',
          message: 'This account no longer exists.',
          request_id: crypto.randomUUID(),
        },
      },
      401
    )
  }

  c.set('user', result.user)
  c.set('session', result.session)

  await next()
})
