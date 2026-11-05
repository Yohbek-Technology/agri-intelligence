import { getAfroMessageConfig } from '@/config/sms.js'
import type { SmsResult, SmsBulkResult, AfroMessageResponse } from '@repo/shared'

export type { SmsResult, SmsBulkResult }

const MAX_RETRIES    = 2
const RETRY_DELAY_MS = 1000
const GEEZ_REGEX     = /[\u1200-\u137F]/
const SEGMENT_LATIN  = 160
const SEGMENT_GEEZ   = 70
const ET_PHONE_REGEX = /^\+251[79][0-9]{8}$/

function validatePhoneNumber(phone: string): void {
  if (!ET_PHONE_REGEX.test(phone))
    throw new Error(`[sms] Invalid phone number: "${phone}". Expected Ethiopian E.164 +251[79]XXXXXXXX`)
}

function validateBody(body: string): void {
  if (!body?.trim()) throw new Error('[sms] Message body must not be empty')
}

// Returns segment count based on script — Ge'ez uses 70-char limit, Latin uses 160 (SRS COMM-4)
export function countSegments(body: string): number {
  const limit = GEEZ_REGEX.test(body) ? SEGMENT_GEEZ : SEGMENT_LATIN
  return Math.ceil(body.length / limit)
}

// Normalizes Ethiopian shorthand numbers (0-prefix, 251-prefix) to E.164
export function normalizeEthiopianPhone(phone: string): string {
  const t = phone.replace(/\s+/g, '')
  if (t.startsWith('+251')) return t
  if (t.startsWith('251'))  return `+${t}`
  if (t.startsWith('0'))    return `+251${t.slice(1)}`
  return t
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      if (attempt < MAX_RETRIES)
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
    }
  }
  throw lastError
}

interface AfroApiError extends Error {
  isUnverified?: boolean
}

async function callAfroMessage(
  phone: string,
  body: string,
  config: ReturnType<typeof getAfroMessageConfig>
): Promise<AfroMessageResponse> {
  const url = new URL(config.apiUrl)
  url.searchParams.set('to', phone)
  url.searchParams.set('message', body)
  if (config.sender) url.searchParams.set('sender', config.sender)
  if (config.identifierId) url.searchParams.set('from', config.identifierId)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = (await response.json().catch(() => null)) as AfroMessageResponse | null

  if (!response.ok || !data || data.acknowledge === 'error') {
    const errorMsg =
      data?.response?.errors?.join(', ') ||
      data?.response?.message ||
      `HTTP status ${response.status}`
    const err = new Error(`[sms] AfroMessage delivery failed for ${phone}: ${errorMsg}`) as AfroApiError
    err.isUnverified = errorMsg.toLowerCase().includes('unverified')
    throw err
  }

  return data
}

// Sends a single SMS via AfroMessage Gateway (OTP delivery, alerts, notices)
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const normalized = normalizeEthiopianPhone(to)
  validatePhoneNumber(normalized)
  validateBody(body)

  const config = getAfroMessageConfig()

  // Safe mock mode when AfroMessage token is not set (e.g. CI / local dev without credentials)
  if (!config.isConfigured) {
    console.log(`[sms:mock] (No AFROMESSAGE_TOKEN set) To: ${normalized}, Body: "${body.slice(0, 40)}..."`)
    return {
      messageId: `mock_${Date.now()}`,
      number: normalized,
      status: 'Sent (Mock)',
      cost: '0 ETB',
      success: true,
    }
  }

  return await withRetry(async () => {
    // Try multiple formats in case the user registered their contact in AfroMessage as 09... or 2519...:
    // 1. E.164: +251902348881
    // 2. Local 0-prefix: 0902348881
    // 3. Country code without plus: 251902348881
    const localZero = `0${normalized.slice(4)}`
    const countryWithoutPlus = normalized.slice(1)
    const phoneVariants = [normalized, localZero, countryWithoutPlus]

    let lastError: any = null

    for (const variant of phoneVariants) {
      try {
        const data = await callAfroMessage(variant, body, config)
        const messageId = data?.response?.messageId || data?.response?.schedId || `afro_${Date.now()}`
        console.log(`[sms] Real SMS successfully sent via AfroMessage to ${variant} (Message ID: ${messageId})`)
        return {
          messageId: String(messageId),
          number: normalized,
          status: data?.response?.message || 'Queued',
          cost: '0.20 ETB',
          success: true,
        }
      } catch (err: any) {
        lastError = err
        // If AfroMessage specifically complains that this format is unverified, attempt the alternative representations
        if (err?.isUnverified) {
          continue
        }
        throw err
      }
    }

    throw lastError
  })
}

// Sends to multiple recipients in concurrent batches via AfroMessage
export async function sendBulkSms(recipients: string[], body: string): Promise<SmsBulkResult> {
  if (!recipients.length) throw new Error('[sms] recipients array must not be empty')
  validateBody(body)

  const normalized = recipients.map(normalizeEthiopianPhone)
  normalized.forEach(validatePhoneNumber)

  const sent: SmsResult[] = []
  const failed: SmsResult[] = []

  // Dispatch in controlled concurrent batches of 10 to respect rate limits
  const BATCH_SIZE = 10
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const chunk = normalized.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      chunk.map((phone) => sendSms(phone, body))
    )

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        sent.push(res.value)
      } else {
        failed.push({
          messageId: `failed_${Date.now()}_${idx}`,
          number: chunk[idx]!,
          status: res.reason?.message || 'Delivery Failed',
          cost: '0 ETB',
          success: false,
        })
      }
    })
  }

  if (failed.length) {
    console.warn(`[sms] ${failed.length}/${normalized.length} failed:`, failed.map((r) => `${r.number} (${r.status})`).join(', '))
  }

  return { sent, failed }
}

// Called after OTP verification — placeholder for farmer profile creation (SRS PLOT-1, PLOT-3)
export async function onPhoneVerified(userId: string): Promise<void> {
  console.log(`[sms] phone verified — farmer profile creation pending for user: ${userId}`)
}
