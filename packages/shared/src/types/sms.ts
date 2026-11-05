export interface AfroMessageResponse {
  acknowledge: 'success' | 'error'
  response?: {
    message?: string
    messageId?: string
    schedId?: string | null
    errors?: string[]
  }
}

export interface SmsResult {
  messageId: string
  number: string
  status: string
  cost: string
  success: boolean
}

export interface SmsBulkResult {
  sent: SmsResult[]
  failed: SmsResult[]
}
