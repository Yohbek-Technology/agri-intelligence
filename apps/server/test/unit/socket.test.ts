import 'dotenv/config'
import { describe, it, expect, afterAll } from 'vitest'
import { createServer } from 'http'
import { io as SocketClient } from 'socket.io-client'
import { initSocket, getIO } from '../../src/config/socket.js'

// Real Socket.IO server bound to a random free port — no mocks

const httpServer = createServer()
let port: number

async function startServer(): Promise<void> {
  return new Promise((resolve) => {
    httpServer.listen(0, () => {
      port = (httpServer.address() as { port: number }).port
      initSocket(httpServer)
      resolve()
    })
  })
}

async function connectClient(): Promise<ReturnType<typeof SocketClient>> {
  return new Promise((resolve) => {
    const client = SocketClient(`http://localhost:${port}`, {
      path: '/socket.io/',
      transports: ['websocket'],
    })
    client.on('connect', () => resolve(client))
  })
}

await startServer()

afterAll(() => {
  getIO().close()
  httpServer.close()
})

describe('getIO', () => {
  it('returns the Socket.IO server instance after initSocket', () => {
    const io = getIO()
    expect(io).toBeDefined()
  })
})

describe('Socket.IO room events — real server', () => {
  it('client connects successfully', async () => {
    const client = await connectClient()
    expect(client.connected).toBe(true)
    client.disconnect()
  })

  const rooms = [
    { event: 'join-city-office',  prefix: 'office'       },
    { event: 'join-kebele',       prefix: 'kebele'       },
    { event: 'join-depot',        prefix: 'depot'        },
    { event: 'join-farmer',       prefix: 'farmer'       },
    { event: 'join-grievance',    prefix: 'grievance'    },
    { event: 'join-outbreak',     prefix: 'outbreak'     },
    { event: 'join-da',           prefix: 'da'           },
    { event: 'join-announcement', prefix: 'announcement' },
  ]

  for (const { event, prefix } of rooms) {
    it(`joins room via "${event}" and server reflects it`, async () => {
      const client = await connectClient()
      const testId = 'test-id-123'

      client.emit(event, testId)
      await new Promise((r) => setTimeout(r, 50))

      const sockets = await getIO().fetchSockets()
      const serverSocket = sockets.find((s) => s.id === client.id)

      expect(serverSocket).toBeDefined()
      expect(serverSocket?.rooms.has(`${prefix}:${testId}`)).toBe(true)

      client.disconnect()
    })
  }

  it('leaves a room correctly', async () => {
    const client = await connectClient()
    const testId = 'leave-test-id'

    client.emit('join-farmer', testId)
    await new Promise((r) => setTimeout(r, 50))

    client.emit('leave-farmer', testId)
    await new Promise((r) => setTimeout(r, 50))

    const sockets = await getIO().fetchSockets()
    const serverSocket = sockets.find((s) => s.id === client.id)

    expect(serverSocket?.rooms.has(`farmer:${testId}`)).toBe(false)

    client.disconnect()
  })

  it('server broadcasts to a room and only that client receives it', async () => {
    const clientA = await connectClient()
    const clientB = await connectClient()
    const roomId = 'broadcast-test'

    clientA.emit('join-farmer', roomId)
    await new Promise((r) => setTimeout(r, 50))

    const received: string[] = []
    clientA.on('test:event', (data: string) => received.push(`A:${data}`))
    clientB.on('test:event', (data: string) => received.push(`B:${data}`))

    getIO().to(`farmer:${roomId}`).emit('test:event', 'hello')
    await new Promise((r) => setTimeout(r, 100))

    expect(received).toContain('A:hello')
    expect(received).not.toContain('B:hello')

    clientA.disconnect()
    clientB.disconnect()
  })
})
