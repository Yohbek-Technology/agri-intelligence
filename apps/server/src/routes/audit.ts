import { Hono } from 'hono'
import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { sessionGuard, tenantGuard, requireAdminOrOfficer } from '@/middlewares/index.js'
import { db } from '@/config/db.js'
import { auditLogs } from '@/db/schemas/sync.js'
import { users } from '@/db/schemas/auth-schema.js'

export const auditRouter = new Hono()
auditRouter.use('*', sessionGuard, tenantGuard, requireAdminOrOfficer)

auditRouter.get('/', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) {
    return c.json({ error: { code: 'forbidden', message: 'No city office assigned.' } }, 403)
  }

  const action = c.req.query('action')
  const from   = c.req.query('from')
  const to     = c.req.query('to')
  const page   = Math.max(1, parseInt(c.req.query('page') ?? '1', 10))
  const limit  = Math.min(200, Math.max(1, parseInt(c.req.query('limit') ?? '50', 10)))
  const offset = (page - 1) * limit

  const conditions = [eq(auditLogs.cityOfficeId, user.cityOfficeId)]
  if (action) conditions.push(eq(auditLogs.action, action))
  if (from)   conditions.push(gte(auditLogs.createdAt, new Date(from)))
  if (to)     conditions.push(lte(auditLogs.createdAt, new Date(to)))

  const rows = await db
    .select({
      id:          auditLogs.id,
      cityOfficeId: auditLogs.cityOfficeId,
      actorUserId: auditLogs.actorUserId,
      actorName:   users.name,
      action:      auditLogs.action,
      entityType:  auditLogs.entityType,
      entityId:    auditLogs.entityId,
      changesJson: auditLogs.changesJson,
      createdAt:   auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .where(and(...conditions))
    .orderBy(desc(auditLogs.id))
    .limit(limit)
    .offset(offset)

  const mapped = rows.map((r) => ({
    id:          r.id,
    cityOfficeId: r.cityOfficeId,
    actorUserId: r.actorUserId,
    actorName:   r.actorName ?? null,
    action:      r.action,
    entityType:  r.entityType,
    entityId:    r.entityId,
    changesJson: r.changesJson,
    createdAt:   r.createdAt.toISOString(),
  }))

  return c.json({ data: mapped, meta: { page, limit } })
})
