import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { users } from '@/db/index.js'
import { eq } from 'drizzle-orm'
import { normalizeEthiopianPhone } from '@/services/sms.js'

const authExtraRouter = new Hono()

authExtraRouter.get('/check-phone', async (c) => {
  const raw = c.req.query('phone')?.trim()
  if (!raw) return c.json({ exists: false })
  const normalized = normalizeEthiopianPhone(raw)
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone_number, normalized))
    .limit(1)
  return c.json({ exists: rows.length > 0 })
})

export { authExtraRouter }
