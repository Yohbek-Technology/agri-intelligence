import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { daTasks } from '@/db/schemas/grievances.js'
import { farmers, plots } from '@/db/schemas/farmers.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, desc } from 'drizzle-orm'

import { cityOffices } from '@/db/schemas/tenancy.js'

export const daTasksRouter = new Hono()

/**
 * GET /api/v1/da/tasks
 * List tasks assigned to the DA or matching filter query
 */
daTasksRouter.get('/', sessionGuard, async (c) => {
  const user = c.get('user')
  const status = c.req.query('status')
  const taskType = c.req.query('taskType')

  const conditions = []
  if (user?.role === 'da') {
    conditions.push(eq(daTasks.assigneeUserId, user.id))
  }
  if (status) {
    conditions.push(eq(daTasks.status, status as any))
  }
  if (taskType) {
    conditions.push(eq(daTasks.taskType, taskType as any))
  }

  const query = conditions.length > 0
    ? db.select().from(daTasks).where(and(...conditions)).orderBy(desc(daTasks.createdAt))
    : db.select().from(daTasks).orderBy(desc(daTasks.createdAt))

  const tasks = await query

  return c.json({ data: tasks })
})

/**
 * GET /api/v1/da/tasks/:id
 * Retrieve specific DA task with farmer and plot info
 */
daTasksRouter.get('/:id', sessionGuard, async (c) => {
  const id = c.req.param('id')

  const task = await db
    .select()
    .from(daTasks)
    .where(eq(daTasks.id, id))
    .limit(1)

  if (!task.length || !task[0]) {
    return c.json({ error: 'Task not found' }, 404)
  }

  const taskData = task[0]
  let farmerInfo = null
  let plotInfo = null

  if (taskData.farmerId) {
    const f = await db.select().from(farmers).where(eq(farmers.id, taskData.farmerId)).limit(1)
    if (f.length) farmerInfo = f[0]
  }

  if (taskData.plotId) {
    const p = await db.select().from(plots).where(eq(plots.id, taskData.plotId)).limit(1)
    if (p.length) plotInfo = p[0]
  }

  return c.json({
    data: {
      ...taskData,
      farmer: farmerInfo,
      plot: plotInfo,
    },
  })
})

/**
 * PATCH /api/v1/da/tasks/:id
 * Update task status, checklist, or mark completed
 */
daTasksRouter.patch('/:id', sessionGuard, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))

  const existing = await db
    .select()
    .from(daTasks)
    .where(eq(daTasks.id, id))
    .limit(1)

  if (!existing.length || !existing[0]) {
    return c.json({ error: 'Task not found' }, 404)
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  }

  if (body.status) {
    updates.status = body.status
    if (body.status === 'done' && !existing[0].completedAt) {
      updates.completedAt = new Date()
    }
  }

  if (body.checklist !== undefined) {
    updates.checklist = body.checklist
  }

  const [updated] = await db
    .update(daTasks)
    .set(updates)
    .where(eq(daTasks.id, id))
    .returning()

  return c.json({ data: updated, message: 'Task updated' })
})

/**
 * POST /api/v1/da/tasks
 * Create a new DA task
 */
daTasksRouter.post('/', sessionGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))

  const {
    cityOfficeId,
    assigneeUserId,
    taskType = 'field_visit',
    title,
    checklist,
    farmerId,
    plotId,
    dueOn,
  } = body

  if (!title) {
    return c.json({ error: 'title is required' }, 400)
  }

  let targetOfficeId = cityOfficeId || user?.cityOfficeId
  let targetFarmerId = farmerId || null
  let targetAssignee = assigneeUserId

  if (plotId && (!targetOfficeId || !targetFarmerId)) {
    const p = await db.select().from(plots).where(eq(plots.id, plotId)).limit(1)
    if (p.length && p[0].farmerId) {
      targetFarmerId = p[0].farmerId
    }
  }

  if (targetFarmerId && !targetOfficeId) {
    const f = await db.select().from(farmers).where(eq(farmers.id, targetFarmerId)).limit(1)
    if (f.length) {
      targetOfficeId = f[0].cityOfficeId
      if (!targetAssignee && f[0].assignedDaUserId) {
        targetAssignee = f[0].assignedDaUserId
      }
    }
  }

  if (!targetOfficeId) {
    const off = await db.select({ id: cityOffices.id }).from(cityOffices).limit(1)
    if (off.length) {
      targetOfficeId = off[0].id
    }
  }

  if (!targetAssignee) {
    targetAssignee = user?.id
  }

  if (!targetOfficeId || !targetAssignee) {
    return c.json({ error: 'cityOfficeId and assigneeUserId are required' }, 400)
  }

  const [created] = await db
    .insert(daTasks)
    .values({
      cityOfficeId: targetOfficeId,
      assigneeUserId: targetAssignee,
      createdByUserId: user?.id || null,
      taskType,
      status: 'open',
      title: title.trim(),
      checklist: checklist || [],
      farmerId: farmerId || null,
      plotId: plotId || null,
      dueOn: dueOn || null,
    })
    .returning()

  return c.json({ data: created, message: 'Task created' }, 201)
})
