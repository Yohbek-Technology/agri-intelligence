export interface AfroMessageResponse {
  acknowledge: 'success' | 'error'
  response?: {
    message?: string
    messageId?: string
    schedId?: string | null
    errors?: string[]
  }
}

export interface ATRecipient {
  statusCode: number
  number: string
  status: string
  cost: string
  messageId: string
}

export interface ATSendResponse {
  SMSMessageData: {
    Message: string
    Recipients: ATRecipient[]
  }
}

export interface ATSendOptions {
  to: string | string[]
  message: string
  from?: string
  enqueue?: boolean
}

export interface ATSmsClient {
  send: (opts: ATSendOptions) => Promise<ATSendResponse>
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
