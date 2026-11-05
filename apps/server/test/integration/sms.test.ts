import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import { sendSms, sendBulkSms, onPhoneVerified } from '../../src/services/sms.js'

const hasAfroMessage = Boolean(process.env.AFROMESSAGE_TOKEN?.trim())

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

describe.skipIf(!hasAfroMessage)('sendSms — real AfroMessage API', () => {
  it('sends a single SMS and returns a valid SmsResult', async () => {
    const result = await sendSms('+251911000000', 'AgriIntelligence test OTP: 123456')
    expect(result.messageId).toBeTruthy()
    expect(result.number).toBe('+251911000000')
    expect(typeof result.status).toBe('string')
    expect(result.success).toBe(true)
  }, 30000)

  it('normalizes a 0-prefix number and sends successfully', async () => {
    const result = await sendSms('0911000000', 'AgriIntelligence test message')
    expect(result.number).toBe('+251911000000')
    expect(result.success).toBe(true)
  }, 30000)

  it('sends an Amharic message successfully', async () => {
    const result = await sendSms('+251911000000', 'ሰላም ገበሬ — የእርስዎ OTP ኮድ: 123456')
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

describe('onPhoneVerified', () => {
  it('logs pending farmer profile creation without throwing', async () => {
    await expect(onPhoneVerified('test-user-id')).resolves.toBeUndefined()
  })
})
