import { apiRequest } from './client'
import { API_ENDPOINTS } from '@/config/env'
import { syncQueue } from '@/database/sync/sync-queue'

export interface GrievanceRecord {
  id: string
  cityOfficeId: string
  farmerId: string
  farmerName?: string
  category: 'input_shortage' | 'pest_outbreak' | 'water_conflict' | 'adulterated_inputs'
  plotId?: string | null
  plotName?: string | null
  plot?: {
    id: string
    name: string
    soilClass?: string
    estimatedArea?: string
  } | null
  locationLatitude?: string | null
  locationLongitude?: string | null
  audioMediaId?: string | null
  textNote?: string | null
  status: 'submitted' | 'received' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'reopened'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  photoMediaIds: string[]
  statusHistory: Array<{
    status: string
    changed_by: string
    timestamp: string
    note?: string
  }>
  submittedAt: string
  receivedAt?: string | null
  resolvedAt?: string | null
}

export interface GrievanceMessageItem {
  id: string
  cityOfficeId?: string
  grievanceId: string
  senderUserId: string
  senderName?: string | null
  senderRole?: string | null
  messageType: 'text' | 'audio'
  textBody?: string | null
  audioMediaId?: string | null
  audioDurationSec?: number
  audioWaveform?: number[]
  readAt?: string | null
  createdAt: string
  isLocalPending?: boolean
}

// Offline fallback mock data matching Stitch screen 831c249691814e80b921226f5c3e54c2
const MOCK_GRIEVANCE: GrievanceRecord = {
  id: 'g-409-mock-uuid',
  cityOfficeId: 'office-adama-uuid',
  farmerId: 'farmer-alemayehu-uuid',
  farmerName: 'Farmer Alemayehu',
  category: 'input_shortage',
  plotId: 'plot-lower-field-uuid',
  plotName: 'Lower Field (Teff - Koticha Soil) • Adama Woreda',
  plot: {
    id: 'plot-lower-field-uuid',
    name: 'Lower Field (Teff - Koticha Soil)',
    soilClass: 'koticha_vertisol',
    estimatedArea: '1.2 ha',
  },
  audioMediaId: 'audio-farmer-voice-note-uuid',
  textNote: 'Urea Depot 2 out of stock / የዩሪያ አቅርቦት በመጋዘን 2 አልቋል',
  status: 'in_progress',
  priority: 'urgent',
  photoMediaIds: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600'],
  statusHistory: [
    {
      status: 'submitted',
      changed_by: 'farmer-alemayehu-uuid',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      note: 'Grievance submitted by farmer',
    },
    {
      status: 'in_progress',
      changed_by: 'officer-sisay-uuid',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      note: 'Status updated to In Progress by Officer Sisay',
    },
  ],
  submittedAt: new Date(Date.now() - 86400000).toISOString(),
}

const MOCK_MESSAGES: GrievanceMessageItem[] = [
  {
    id: 'msg-farmer-initial',
    grievanceId: 'g-409-mock-uuid',
    senderUserId: 'farmer-alemayehu-uuid',
    senderName: 'You (Farmer Alemayehu)',
    senderRole: 'farmer',
    messageType: 'audio',
    textBody: 'Audio Note: Urea Depot 2 out of stock / የዩሪያ አቅርቦት በመጋዘን 2 አልቋል',
    audioMediaId: 'audio-note-depot-stock',
    audioDurationSec: 105,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'msg-da-desk-reply',
    grievanceId: 'g-409-mock-uuid',
    senderUserId: 'da-kebede-uuid',
    senderName: 'DA Kebede Tadesse',
    senderRole: 'da',
    messageType: 'audio',
    textBody: 'A new truck delivery of 400 quintals NPS & Urea will reach Depot 2 by Thursday morning. We have reserved your 25kg allotment. Bring your farmer green booklet.',
    audioMediaId: 'audio-da-response',
    audioDurationSec: 70,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const grievanceService = {
  /**
   * Submit a new grievance ticket with voice recording, photos, and location
   */
  async submitGrievance(data: {
    id?: string
    category: string
    plotId?: string
    kebeleId?: string
    audioMediaId?: string
    textNote?: string
    photoMediaIds?: string[]
    priority?: string
    locationLatitude?: number
    locationLongitude?: number
  }): Promise<{ success: boolean; data?: GrievanceRecord; error?: string }> {
    const grievanceId = data.id || crypto.randomUUID()

    const res = await apiRequest<{ data: GrievanceRecord }>(API_ENDPOINTS.grievances.submit, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        id: grievanceId,
      }),
    })

    if (res.success && res.data) {
      return { success: true, data: res.data.data }
    }

    // Offline queuing fallback
    await syncQueue.enqueue('grievance', grievanceId, 'insert', {
      ...data,
      id: grievanceId,
    })

    const offlineGrievance: GrievanceRecord = {
      id: grievanceId,
      cityOfficeId: 'local-offline-office',
      farmerId: 'me',
      category: data.category as any,
      plotId: data.plotId,
      audioMediaId: data.audioMediaId,
      textNote: data.textNote,
      status: 'submitted',
      priority: (data.priority as any) || 'normal',
      photoMediaIds: data.photoMediaIds || [],
      statusHistory: [
        {
          status: 'submitted',
          changed_by: 'me',
          timestamp: new Date().toISOString(),
          note: 'Queued locally in offline box',
        },
      ],
      submittedAt: new Date().toISOString(),
    }

    return { success: true, data: offlineGrievance }
  },

  /**
   * List all grievances for farmer
   */
  async fetchGrievances(filters?: { status?: string; category?: string }): Promise<GrievanceRecord[]> {
    let url = API_ENDPOINTS.grievances.list
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.category) params.append('category', filters.category)
    if (params.toString()) url += `?${params.toString()}`

    const res = await apiRequest<{ data: GrievanceRecord[] }>(url, { method: 'GET' })
    if (res.success && res.data?.data) {
      return res.data.data
    }
    return [MOCK_GRIEVANCE]
  },

  /**
   * Fetch specific grievance by ID
   */
  async fetchGrievanceDetail(id: string): Promise<GrievanceRecord> {
    const res = await apiRequest<{ data: GrievanceRecord }>(API_ENDPOINTS.grievances.detail(id), {
      method: 'GET',
    })
    if (res.success && res.data?.data) {
      return res.data.data
    }
    return { ...MOCK_GRIEVANCE, id }
  },

  /**
   * Fetch message thread for a grievance ticket
   */
  async fetchMessages(grievanceId: string): Promise<GrievanceMessageItem[]> {
    const res = await apiRequest<{ data: GrievanceMessageItem[] }>(
      API_ENDPOINTS.grievances.messages(grievanceId),
      { method: 'GET' }
    )
    if (res.success && res.data?.data) {
      return res.data.data
    }
    return MOCK_MESSAGES
  },

  /**
   * Send a follow-up voice note or typed message
   */
  async sendMessage(
    grievanceId: string,
    message: {
      id?: string
      messageType: 'text' | 'audio'
      textBody?: string
      audioMediaId?: string
      audioDurationSec?: number
    }
  ): Promise<GrievanceMessageItem> {
    const messageId = message.id || crypto.randomUUID()

    const res = await apiRequest<{ data: GrievanceMessageItem }>(
      API_ENDPOINTS.grievances.messages(grievanceId),
      {
        method: 'POST',
        body: JSON.stringify({
          ...message,
          id: messageId,
        }),
      }
    )

    if (res.success && res.data?.data) {
      return res.data.data
    }

    // Offline queuing fallback
    await syncQueue.enqueue('grievance_message', messageId, 'insert', {
      ...message,
      id: messageId,
      grievanceId,
    })

    return {
      id: messageId,
      grievanceId,
      senderUserId: 'me',
      senderName: 'You (Farmer)',
      senderRole: 'farmer',
      messageType: message.messageType,
      textBody: message.textBody,
      audioMediaId: message.audioMediaId,
      audioDurationSec: message.audioDurationSec,
      createdAt: new Date().toISOString(),
      isLocalPending: true,
    }
  },

  /**
   * Confirm resolution of grievance
   */
  async confirmResolution(id: string): Promise<GrievanceRecord> {
    const res = await apiRequest<{ data: GrievanceRecord }>(API_ENDPOINTS.grievances.confirm(id), {
      method: 'POST',
    })
    if (res.success && res.data?.data) {
      return res.data.data
    }
    return {
      ...MOCK_GRIEVANCE,
      id,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    }
  },

  /**
   * Reopen ticket within 7-day cutoff window
   */
  async reopenGrievance(id: string, reason?: string): Promise<GrievanceRecord> {
    const res = await apiRequest<{ data: GrievanceRecord }>(API_ENDPOINTS.grievances.reopen(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    if (res.success && res.data?.data) {
      return res.data.data
    }
    return {
      ...MOCK_GRIEVANCE,
      id,
      status: 'reopened',
      resolvedAt: null,
    }
  },
}
