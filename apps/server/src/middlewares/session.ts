import { createMiddleware } from 'hono/factory'
import type { AuthUser, AuthSession } from '@repo/shared'
import { auth } from '@/config/auth.js'

export interface AuthVariables {
  user: AuthUser
  session: AuthSession
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
    session: AuthSession
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

  const rawUser = result.user as typeof result.user & {
    role?: string
    banned?: boolean
    ban_reason?: string | null
    ban_expires?: Date | null
    city_office_id?: string | null
    preferred_language?: string
    assigned_kebele_ids?: string
    deleted_at?: Date | null
    phone_number?: string | null
    phone_number_verified?: boolean
  }

  if (rawUser.banned) {
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

  if (rawUser.deleted_at) {
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

  const user: AuthUser = {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    emailVerified: rawUser.emailVerified,
    image: rawUser.image ?? null,
    phoneNumber: rawUser.phone_number ?? null,
    phoneNumberVerified: rawUser.phone_number_verified ?? false,
    role: (rawUser.role ?? 'farmer') as AuthUser['role'],
    banned: rawUser.banned ?? false,
    banReason: rawUser.ban_reason ?? null,
    banExpires: rawUser.ban_expires ?? null,
    cityOfficeId: rawUser.city_office_id ?? null,
    preferredLanguage: (rawUser.preferred_language ?? 'am') as AuthUser['preferredLanguage'],
    assignedKebeleIds: rawUser.assigned_kebele_ids ?? '{}',
    deletedAt: rawUser.deleted_at ?? null,
    createdAt: result.user.createdAt,
    updatedAt: result.user.updatedAt,
  }

  const session: AuthSession = {
    id: result.session.id,
    userId: result.session.userId,
    token: result.session.token,
    expiresAt: result.session.expiresAt,
    ipAddress: result.session.ipAddress ?? null,
    userAgent: result.session.userAgent ?? null,
    createdAt: result.session.createdAt,
    updatedAt: result.session.updatedAt,
  }

  c.set('user', user)
  c.set('session', session)

  await next()
})
