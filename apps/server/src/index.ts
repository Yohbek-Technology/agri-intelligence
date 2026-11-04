import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestId } from 'hono/request-id'
import { auth } from '@/config/auth.js'
import { pool } from '@/config/db.js'
import { authExtraRouter } from '@/routes/auth-extra.js'

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
