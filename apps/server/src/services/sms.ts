import { smsClient, senderId, AT_SUCCESS } from '@/config/sms.js'
import type { ATRecipient } from '@/config/sms.js'
import type { SmsResult, SmsBulkResult } from '@repo/shared'

export type { SmsResult, SmsBulkResult }

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_RETRIES    = 2
const RETRY_DELAY_MS = 1000
const MAX_BULK_BATCH = 1000

// Ge'ez script segments at 70 chars, Latin at 160 (SRS COMM-4)
const GEEZ_REGEX     = /[\u1200-\u137F]/
const SEGMENT_LATIN  = 160
const SEGMENT_GEEZ   = 70

const ET_PHONE_REGEX = /^\+251[79][0-9]{8}$/

// ── Helpers ───────────────────────────────────────────────────────────────────

function validatePhoneNumber(phone: string): void {
  if (!ET_PHONE_REGEX.test(phone)) {
    throw new Error(`[sms] Invalid phone number: "${phone}". Expected Ethiopian E.164 +251[79]XXXXXXXX`)
  }
}

function validateBody(body: string): void {
  if (!body?.trim()) throw new Error('[sms] Message body must not be empty')
}

export function countSegments(body: string): number {
  const limit = GEEZ_REGEX.test(body) ? SEGMENT_GEEZ : SEGMENT_LATIN
  return Math.ceil(body.length / limit)
}

export function normalizeEthiopianPhone(phone: string): string {
  const t = phone.replace(/\s+/g, '')
  if (t.startsWith('+251')) return t
  if (t.startsWith('251'))  return `+${t}`
  if (t.startsWith('0'))    return `+251${t.slice(1)}`
  return t
}

function mapRecipient(r: ATRecipient): SmsResult {
  return {
    messageId: r.messageId,
    number:    r.number,
    status:    r.status,
    cost:      r.cost,
    success:   r.statusCode === AT_SUCCESS,
  }
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
      }
    }
  }
  throw lastError
}

// ── Public API ────────────────────────────────────────────────────────────────

// Send a single SMS — OTP delivery, grievance notices, emergency fallback (SRS 5.2, COMM-5)
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const normalized = normalizeEthiopianPhone(to)
  validatePhoneNumber(normalized)
  validateBody(body)

  const response = await withRetry(() =>
    smsClient.send({
      to: normalized,
      message: body,
      from: senderId || undefined,
      enqueue: false,
    })
  )

  const recipient = response.SMSMessageData.Recipients?.[0]
  if (!recipient) throw new Error(`[sms] Empty recipients in response for ${normalized}`)

  const result = mapRecipient(recipient)
  if (!result.success) {
    throw new Error(`[sms] Delivery failed for ${normalized}: ${result.status} (messageId: ${result.messageId})`)
  }

  return result
}

// Send to multiple recipients — broadcast fan-out (COMM-4, COMM-5)
// Returns both sent and failed so callers can log and schedule retries
export async function sendBulkSms(
  recipients: string[],
  body: string
): Promise<SmsBulkResult> {
  if (!recipients.length) throw new Error('[sms] recipients array must not be empty')
  validateBody(body)

  const normalized = recipients.map(normalizeEthiopianPhone)
  normalized.forEach(validatePhoneNumber)

  const sent: SmsResult[]   = []
  const failed: SmsResult[] = []

  for (let i = 0; i < normalized.length; i += MAX_BULK_BATCH) {
    const batch = normalized.slice(i, i + MAX_BULK_BATCH)

    const response = await withRetry(() =>
      smsClient.send({
        to: batch,
        message: body,
        from: senderId || undefined,
        enqueue: true,
      })
    )

    for (const r of response.SMSMessageData.Recipients) {
      const result = mapRecipient(r)
      result.success ? sent.push(result) : failed.push(result)
    }
  }

  if (failed.length) {
    console.warn(
      `[sms] ${failed.length}/${normalized.length} messages failed:`,
      failed.map((r) => `${r.number} (${r.status})`).join(', ')
    )
  }

  return { sent, failed }
}

// Called after phone OTP verification — triggers farmer profile creation flow (SRS PLOT-1, PLOT-3)
export async function onPhoneVerified(userId: string): Promise<void> {
  console.log(`[sms] phone verified — farmer profile creation pending for user: ${userId}`)
}
