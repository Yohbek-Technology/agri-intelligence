import { serve } from '@hono/node-server'
import type { ServerType } from '@hono/node-server'
import type { Server as HttpServer } from 'http'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { auth } from '@/config/auth.js'
import { initSocket } from '@/config/socket.js'
import { officeRouter } from '@/routes/office.js'
import { authExtraRouter } from '@/routes/auth-extra.js'
import { mobileAuthRouter } from '@/routes/mobile-auth.js'
import { farmersRouter } from '@/routes/farmers.js'
import { plotsRouter } from '@/routes/plots.js'
import { cropCyclesRouter } from '@/routes/crop-cycles.js'
import { daTasksRouter } from '@/routes/da-tasks.js'
import { diagnosticsRouter } from '@/routes/diagnostics.js'
import { catalogRouter } from '@/routes/catalog.js'
import { yieldGapRouter } from '@/routes/yield-gap.js'
import { weatherRouter } from '@/routes/weather.js'
import { grievancesRouter } from '@/routes/grievances.js'
import { syncRouter, devicesRouter, appVersionRouter } from '@/routes/sync.js'
import { pool } from '@/config/db.js'

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
  })
)

// Mobile & OpenAPI Auth Router (handles /api/auth/sign-in/phone, verify-otp, etc. with MOB-3 guard)
app.route('/api/auth', mobileAuthRouter)

// Better Auth core handler fallback
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Domain v1 routes
app.route('/api/v1/offices', officeRouter)
app.route('/api/v1/auth', authExtraRouter)
app.route('/api/v1/farmers', farmersRouter)
app.route('/api/v1/plots', plotsRouter)
app.route('/api/v1/cycles', cropCyclesRouter)
app.route('/api/v1/da/tasks', daTasksRouter)
app.route('/api/v1/diagnoses', diagnosticsRouter)
app.route('/api/v1/catalog', catalogRouter)
app.route('/api/v1/yield-gap', yieldGapRouter)
app.route('/api/v1/weather', weatherRouter)
app.route('/api/v1/grievances', grievancesRouter)
app.route('/api/v1/sync', syncRouter)
app.route('/api/v1/devices', devicesRouter)
app.route('/api/v1/app', appVersionRouter)

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/', (c) => c.text('Agricultural Intelligence API is operational'))

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000

const httpServer: ServerType = serve({ fetch: app.fetch, port }, (info) => {
  initSocket(httpServer as HttpServer)
  console.log(`[server] Running on http://localhost:${info.port}`)
})

async function shutdown(): Promise<void> {
  console.log('[server] Shutting down gracefully...')
  await pool.end()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
