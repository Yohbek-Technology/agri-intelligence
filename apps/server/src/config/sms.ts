import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Environment validation ────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== 'production'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`[sms] Environment variable ${key} is required`)
  return value
}

const username = isDev ? 'sandbox' : requireEnv('AT_USERNAME')
const apiKey   = isDev ? requireEnv('AT_SANDBOX_API_KEY') : requireEnv('AT_API_KEY')

// ── Initialise client (CommonJS SDK inside ESM project) ───────────────────────

const AT = require('africastalking')({ apiKey, username })

export const smsClient    = AT.SMS as ATSmsClient
export const senderId     = process.env.AT_SENDER_ID ?? ''
export const AT_SUCCESS   = 101

console.log(`[sms] Africa's Talking initialised — ${isDev ? 'sandbox' : 'production'} (username: ${username})`)
