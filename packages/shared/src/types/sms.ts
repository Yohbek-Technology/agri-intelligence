// SMS delivery result types shared across server and web

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
