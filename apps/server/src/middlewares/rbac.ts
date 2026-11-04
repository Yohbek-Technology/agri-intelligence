import { createMiddleware } from 'hono/factory'
import type { AuthVariables } from './session.js'

export type UserRole =
  | 'FARMER'
  | 'DA'
  | 'CITY_ADMIN'
  | 'SUPER_ADMIN'
  | 'farmer'
  | 'da'
  | 'city_admin'
  | 'super_admin'

export function requireRoles(...allowedRoles: (UserRole | string)[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const rawRole = c.get('user')?.role as string | undefined

    if (!rawRole) {
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

    const normalizedUserRole = rawRole.toUpperCase()
    const matches = allowedRoles.some((r) => r.toUpperCase() === normalizedUserRole)

    if (!matches) {
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

export const requireFarmer         = requireRoles('FARMER', 'farmer')
export const requireDa             = requireRoles('DA', 'da')
export const requireCityAdmin      = requireRoles('CITY_ADMIN', 'city_admin')
export const requireSuperAdmin     = requireRoles('SUPER_ADMIN', 'super_admin')
export const requireAdminOrOfficer = requireRoles('CITY_ADMIN', 'SUPER_ADMIN', 'city_admin', 'super_admin')
export const requireFieldStaff     = requireRoles('FARMER', 'DA', 'farmer', 'da')
export const requireDeskStaff      = requireRoles('DA', 'CITY_ADMIN', 'SUPER_ADMIN', 'da', 'city_admin', 'super_admin')

