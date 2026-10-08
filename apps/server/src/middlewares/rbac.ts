import { createMiddleware } from 'hono/factory'
import type { UserRole } from '@repo/shared'
import type { AuthVariables } from './session.js'

export function requireRoles(...allowedRoles: UserRole[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')
    const role = user?.role

    if (!role || !allowedRoles.includes(role)) {
      return c.json(
        {
          error: {
            code: 'forbidden',
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
            request_id: crypto.randomUUID(),
          },
        },
        403
      )
    }

    await next()
  })
}

export const requireFarmer        = requireRoles('farmer')
export const requireDa            = requireRoles('da')
export const requireOfficer       = requireRoles('officer')
export const requireSystemAdmin   = requireRoles('system_admin')
export const requireAdminOrOfficer = requireRoles('officer', 'system_admin')
export const requireFieldStaff    = requireRoles('farmer', 'da')
export const requireDeskStaff     = requireRoles('da', 'officer', 'system_admin')
