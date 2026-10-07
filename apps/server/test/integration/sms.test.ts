import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import { sendSms, sendBulkSms, onPhoneVerified } from '../../src/services/sms.js'

beforeAll(() => {
  if (!process.env.AT_SANDBOX_API_KEY)
    throw new Error('AT_SANDBOX_API_KEY must be set in .env before running SMS integration tests')
})

describe('sendSms — input validation', () => {
  it('throws on invalid Ethiopian phone number', async () => {
    await expect(sendSms('0800000000', 'test')).rejects.toThrow('Invalid phone number')
  })

  it('throws on non-Ethiopian E.164 number', async () => {
    await expect(sendSms('+254711000000', 'test')).rejects.toThrow('Invalid phone number')
  })

  it('throws on empty body', async () => {
    await expect(sendSms('+251902348881', '')).rejects.toThrow('Message body must not be empty')
  })

  it('throws on whitespace-only body', async () => {
    await expect(sendSms('+251902348881', '   ')).rejects.toThrow('Message body must not be empty')
  })
})

describe('sendSms — real AT sandbox', () => {
  it('sends a single SMS and returns a valid SmsResult', async () => {
    const result = await sendSms('+251902348881', 'AgriIntelligence test OTP: 123456')
    expect(result.messageId).toBeTruthy()
    expect(result.number).toBe('+251902348881')
    expect(typeof result.status).toBe('string')
    expect(typeof result.cost).toBe('string')
    expect(result.success).toBe(true)
  }, 30000)

  it('normalizes a 0-prefix number and sends successfully', async () => {
    const result = await sendSms('0902348881', 'AgriIntelligence test message')
    expect(result.number).toBe('+251902348881')
    expect(result.success).toBe(true)
  }, 30000)

  it('sends an Amharic message successfully', async () => {
    const result = await sendSms('+251902348881', 'ሰላም ገበሬ — የእርስዎ OTP ኮድ: 123456')
    expect(result.success).toBe(true)
    expect(result.messageId).toBeTruthy()
  }, 30000)
})

describe('sendBulkSms — input validation', () => {
  it('throws on empty recipients array', async () => {
    await expect(sendBulkSms([], 'test')).rejects.toThrow('recipients array must not be empty')
  })

  it('throws on invalid phone in recipients', async () => {
    await expect(sendBulkSms(['+251902348881', 'bad'], 'test')).rejects.toThrow('Invalid phone number')
  })

  it('throws on empty body', async () => {
    await expect(sendBulkSms(['+251902348881'], '')).rejects.toThrow('Message body must not be empty')
  })
})

describe('sendBulkSms — real AT sandbox', () => {
  it('sends to multiple recipients and returns sent/failed split', async () => {
    const result = await sendBulkSms(['+251902348881', '+251902348881'], 'AgriIntelligence bulk test')
    expect(Array.isArray(result.sent)).toBe(true)
    expect(Array.isArray(result.failed)).toBe(true)
    // AT sandbox deduplicates identical numbers — at least 1 recipient is returned
    expect(result.sent.length + result.failed.length).toBeGreaterThanOrEqual(1)
    for (const r of result.sent) {
      expect(r.messageId).toBeTruthy()
      expect(r.success).toBe(true)
    }
  }, 30000)

  it('normalizes 0-prefix numbers in bulk list', async () => {
    const result = await sendBulkSms(['0902348881', '0902348881'], 'AgriIntelligence bulk normalization test')
    const numbers = [...result.sent, ...result.failed].map((r) => r.number)
    expect(numbers.every((n) => n === '+251902348881')).toBe(true)
  }, 30000)
})

describe('onPhoneVerified', () => {
  it('resolves without throwing', async () => {
    await expect(onPhoneVerified('user-uuid-123')).resolves.toBeUndefined()
  })
})
