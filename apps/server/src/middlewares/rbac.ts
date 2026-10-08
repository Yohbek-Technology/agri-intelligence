import { createMiddleware } from 'hono/factory'
import type { AuthVariables } from './session.js'

type UserRole = 'farmer' | 'da' | 'officer' | 'system_admin'

export function requireRoles(...allowedRoles: UserRole[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const role = c.get('user')?.role as UserRole | undefined

    if (!role || !allowedRoles.includes(role)) {
      return c.json(
        {
          error: {
            code: 'forbidden',
            message: `Access denied. Required: ${allowedRoles.join(' or ')}.`,
            request_id: crypto.randomUUID(),
          },
        },
        403
      )
    }

    await next()
  })
}

export const requireFarmer         = requireRoles('farmer')
export const requireDa             = requireRoles('da')
export const requireOfficer        = requireRoles('officer')
export const requireSystemAdmin    = requireRoles('system_admin')
export const requireAdminOrOfficer = requireRoles('officer', 'system_admin')
export const requireFieldStaff     = requireRoles('farmer', 'da')
export const requireDeskStaff      = requireRoles('da', 'officer', 'system_admin')
