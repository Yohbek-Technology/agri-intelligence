import type { Server as HttpServer } from 'http'
import type { Server as HttpsServer } from 'https'
import { Server, Socket } from 'socket.io'

export type { Server, Socket }

let io: Server | undefined

// Initialise Socket.IO and attach all room handlers
export function initSocket(httpServer: HttpServer | HttpsServer): Server {
  io = new Server(httpServer, {
    path: '/socket.io/',
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN ?? '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.on('connection', (socket: Socket) => {

    // City office — announcements, demand updates, analytics (ADM-1, COMM-1)
    socket.on('join-city-office', (officeId: string) => socket.join(`office:${officeId}`))
    socket.on('leave-city-office', (officeId: string) => socket.leave(`office:${officeId}`))

    // Kebele — localized broadcasts and outbreak alerts (COMM-2, AGENT-5)
    socket.on('join-kebele', (id: string) => socket.join(`kebele:${id}`))
    socket.on('leave-kebele', (id: string) => socket.leave(`kebele:${id}`))

    // Depot — stock movement and demand updates (REG-6, REG-7)
    socket.on('join-depot', (id: string) => socket.join(`depot:${id}`))
    socket.on('leave-depot', (id: string) => socket.leave(`depot:${id}`))

    // Farmer — personal notifications: sync status, yield-gap ready, diagnosis done (SYNC-8, YIELD-8)
    socket.on('join-farmer', (id: string) => socket.join(`farmer:${id}`))
    socket.on('leave-farmer', (id: string) => socket.leave(`farmer:${id}`))

    // Grievance — real-time two-way threaded conversation (GRIEV-6, TRG-4)
    socket.on('join-grievance', (id: string) => socket.join(`grievance:${id}`))
    socket.on('leave-grievance', (id: string) => socket.leave(`grievance:${id}`))

    // Outbreak cluster — alert delivery to nearby farmers and DAs (AGENT-5, TRG-5, TRG-6)
    socket.on('join-outbreak', (clusterId: string) => socket.join(`outbreak:${clusterId}`))
    socket.on('leave-outbreak', (clusterId: string) => socket.leave(`outbreak:${clusterId}`))

    // DA — task assignments and per-farmer sync notifications (AGENT-1, DA tasks)
    socket.on('join-da', (daId: string) => socket.join(`da:${daId}`))
    socket.on('leave-da', (daId: string) => socket.leave(`da:${daId}`))

    // Announcement — live delivery and acknowledgement tracking (COMM-3, COMM-7)
    socket.on('join-announcement', (announcementId: string) => socket.join(`announcement:${announcementId}`))
    socket.on('leave-announcement', (announcementId: string) => socket.leave(`announcement:${announcementId}`))
  })

  console.log('[socket] Socket.IO initialised successfully')
  return io
}

// Return the singleton instance or throw if not yet initialised
export function getIO(): Server {
  if (!io) {
    throw new Error('[socket] Call initSocket(httpServer) before getIO().')
  }
  return io
}
