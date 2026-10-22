import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { auth } from '@/config/auth.js'
import { pool } from '@/config/db.js'
import { officeRouter } from '@/routes/office.js'
import { authExtraRouter } from '@/routes/auth-extra.js'

import { kebelesPublicRouter, officeKebeleRouter } from '@/routes/kebele.js'
import { staffRouter } from '@/routes/staff.js'
import { catalogPublicRouter, officeCatalogRouter } from '@/routes/catalog.js'
import { auditRouter } from '@/routes/audit.js'

const app = new Hono()

app.use('*', requestId())

app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Device-Id',
      'X-Client-Type',
      'X-App-Version',
      'Accept-Language',
      'Idempotency-Key',
    ],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

// Better Auth core handler fallback
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Extra auth utilities (check-phone availability for sign-up)
app.route('/api/v1/auth', authExtraRouter)

// ── Office ────────────────────────────────────────────────────────────────────
// GET /me, GET /me/config, PATCH /me
app.route('/api/v1/offices', officeRouter)

// ── Kebeles ───────────────────────────────────────────────────────────────────
// GET /api/v1/kebeles  (any authenticated user)
app.route('/api/v1/kebeles', kebelesPublicRouter)

// ── Office management (officer-only writes) ───────────────────────────────────
const officeManagementRouter = new Hono()

// POST/PATCH/DELETE /api/v1/office/kebeles
officeManagementRouter.route('/kebeles', officeKebeleRouter)

// GET/POST/PATCH /api/v1/office/users  +  POST /:id/deactivate  +  POST /:id/reactivate
officeManagementRouter.route('/users', staffRouter)

// GET/POST/PATCH /api/v1/office/catalog/crops|varieties|fertilizer-rates|pests|chemicals
officeManagementRouter.route('/catalog', officeCatalogRouter)

// GET /api/v1/office/audit-logs
officeManagementRouter.route('/audit-logs', auditRouter)

app.route('/api/v1/office', officeManagementRouter)

// ── Catalog public reads ──────────────────────────────────────────────────────
// GET /api/v1/catalog/crops|varieties|pests|chemicals|fertilizer-rates
app.route('/api/v1/catalog', catalogPublicRouter)

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/', (c) => c.text('Agricultural Intelligence API is operational'))

// ── Server ────────────────────────────────────────────────────────────────────
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[server] Running on http://localhost:${info.port}`)
})

async function shutdown(): Promise<void> {
  console.log('[server] Shutting down gracefully...')
  await pool.end()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
