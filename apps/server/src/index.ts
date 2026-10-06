import { serve } from '@hono/node-server'
import type { ServerType } from '@hono/node-server'
import type { Server as HttpServer } from 'http'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from '@/config/auth.js'
import { initSocket } from '@/config/socket.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
)

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.get('/', (c) => {
  return c.text('Agricultural Intelligence API is operational')
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000

// serve() returns the underlying http.Server — attach Socket.IO to the same instance
const httpServer: ServerType = serve({ fetch: app.fetch, port }, (info) => {
  initSocket(httpServer as HttpServer)
  console.log(`Server is running on http://localhost:${info.port}`)
})
