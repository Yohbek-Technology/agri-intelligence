import 'dotenv/config'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SmsResult } from '@repo/shared'

// ── Mock the AT config before importing the service ──────────────────────────

const mockSend = vi.fn()

vi.mock('../../src/config/sms.js', () => ({
  smsClient:  { send: mockSend },
  senderId:   'AGRI',
  AT_SUCCESS: 101,
}))

import {
  sendSms,
  sendBulkSms,
  countSegments,
  normalizeEthiopianPhone,
  onPhoneVerified,
} from '../../src/services/sms.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRecipient(overrides: Partial<{
  statusCode: number
  number: string
  status: string
  cost: string
  messageId: string
}> = {}) {
  return {
    statusCode: 101,
    number:     '+251911000000',
    status:     'Success',
    cost:       'ETB 0.8000',
    messageId:  'msg-001',
    ...overrides,
  }
}

function makeResponse(recipients: ReturnType<typeof makeRecipient>[]) {
  return { SMSMessageData: { Message: 'Sent', Recipients: recipients } }
}

beforeEach(() => mockSend.mockReset())

// ── normalizeEthiopianPhone ───────────────────────────────────────────────────

describe('normalizeEthiopianPhone', () => {
  it('leaves E.164 unchanged', () => {
    expect(normalizeEthiopianPhone('+251911000000')).toBe('+251911000000')
  })

  it('converts 0-prefix to E.164', () => {
    expect(normalizeEthiopianPhone('0911000000')).toBe('+251911000000')
  })

  it('converts 251-prefix to E.164', () => {
    expect(normalizeEthiopianPhone('251911000000')).toBe('+251911000000')
  })

  it('strips whitespace before normalizing', () => {
    expect(normalizeEthiopianPhone(' 0911 000 000 ')).toBe('+251911000000')
  })
})

// ── countSegments ─────────────────────────────────────────────────────────────

describe('countSegments', () => {
  it('counts 1 segment for short Latin text', () => {
    expect(countSegments('Hello farmer.')).toBe(1)
  })

  it('counts 2 segments for Latin text over 160 chars', () => {
    expect(countSegments('A'.repeat(161))).toBe(2)
  })

  it('counts 1 segment for short Amharic (Ge\'ez) text', () => {
    expect(countSegments('ሰላም')).toBe(1)
  })

  it('counts 2 segments for Amharic text over 70 chars', () => {
    expect(countSegments('ሀ'.repeat(71))).toBe(2)
  })
})

// ── sendSms — validation ──────────────────────────────────────────────────────

describe('sendSms — input validation', () => {
  it('throws on invalid phone number', async () => {
    await expect(sendSms('0800000000', 'test')).rejects.toThrow('Invalid phone number')
  })

  it('throws on non-Ethiopian E.164 number', async () => {
    await expect(sendSms('+254711000000', 'test')).rejects.toThrow('Invalid phone number')
  })

  it('throws on empty body', async () => {
    await expect(sendSms('+251911000000', '')).rejects.toThrow('Message body must not be empty')
  })

  it('throws on whitespace-only body', async () => {
    await expect(sendSms('+251911000000', '   ')).rejects.toThrow('Message body must not be empty')
  })

  it('accepts a 0-prefix number by normalizing it', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([makeRecipient()]))
    await expect(sendSms('0911000000', 'test')).resolves.toBeDefined()
  })
})

// ── sendSms — success ─────────────────────────────────────────────────────────

describe('sendSms — success', () => {
  it('returns SmsResult on successful delivery', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([makeRecipient()]))

    const result = await sendSms('+251911000000', 'Your OTP is 123456')

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('msg-001')
    expect(result.number).toBe('+251911000000')
    expect(result.status).toBe('Success')
  })

  it('passes senderId to the AT client when set', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([makeRecipient()]))
    await sendSms('+251911000000', 'test')
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ from: 'AGRI' }))
  })

  it('uses enqueue: false for single SMS', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([makeRecipient()]))
    await sendSms('+251911000000', 'test')
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ enqueue: false }))
  })
})

// ── sendSms — failure handling ────────────────────────────────────────────────

describe('sendSms — failure handling', () => {
  it('throws when AT returns non-success statusCode', async () => {
    mockSend.mockResolvedValueOnce(
      makeResponse([makeRecipient({ statusCode: 403, status: 'InvalidPhoneNumber' })])
    )
    await expect(sendSms('+251911000000', 'test')).rejects.toThrow('Delivery failed')
  })

  it('throws when recipients array is empty in response', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([]))
    await expect(sendSms('+251911000000', 'test')).rejects.toThrow('Empty recipients')
  })

  it('retries on network failure and succeeds on second attempt', async () => {
    mockSend
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(makeResponse([makeRecipient()]))

    const result = await sendSms('+251911000000', 'test')

    expect(result.success).toBe(true)
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('throws after all retries are exhausted', async () => {
    mockSend.mockRejectedValue(new Error('Gateway timeout'))
    await expect(sendSms('+251911000000', 'test')).rejects.toThrow('Gateway timeout')
    expect(mockSend).toHaveBeenCalledTimes(3)
  })
})

// ── sendBulkSms — validation ──────────────────────────────────────────────────

describe('sendBulkSms — input validation', () => {
  it('throws on empty recipients array', async () => {
    await expect(sendBulkSms([], 'test')).rejects.toThrow('recipients array must not be empty')
  })

  it('throws on invalid phone in recipients', async () => {
    await expect(sendBulkSms(['+251911000000', 'bad'], 'test')).rejects.toThrow('Invalid phone number')
  })

  it('throws on empty body', async () => {
    await expect(sendBulkSms(['+251911000000'], '')).rejects.toThrow('Message body must not be empty')
  })
})

// ── sendBulkSms — success ─────────────────────────────────────────────────────

describe('sendBulkSms — success', () => {
  it('returns correct sent/failed split', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([
      makeRecipient({ number: '+251911000001', statusCode: 101, status: 'Success' }),
      makeRecipient({ number: '+251911000002', statusCode: 403, status: 'InvalidPhoneNumber' }),
    ]))

    const result = await sendBulkSms(['+251911000001', '+251911000002'], 'Alert')

    expect(result.sent).toHaveLength(1)
    expect(result.sent[0].number).toBe('+251911000001')
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].number).toBe('+251911000002')
  })

  it('uses enqueue: true for bulk', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([makeRecipient()]))
    await sendBulkSms(['+251911000000'], 'test')
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ enqueue: true }))
  })

  it('returns all in sent when all succeed', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([
      makeRecipient({ number: '+251911000001' }),
      makeRecipient({ number: '+251911000002' }),
    ]))

    const result = await sendBulkSms(['+251911000001', '+251911000002'], 'test')

    expect(result.sent).toHaveLength(2)
    expect(result.failed).toHaveLength(0)
  })

  it('normalizes 0-prefix numbers before sending', async () => {
    mockSend.mockResolvedValueOnce(makeResponse([makeRecipient({ number: '+251911000000' })]))
    await sendBulkSms(['0911000000'], 'test')
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['+251911000000'] })
    )
  })
})

// ── onPhoneVerified ───────────────────────────────────────────────────────────

describe('onPhoneVerified', () => {
  it('resolves without throwing', async () => {
    await expect(onPhoneVerified('user-uuid-123')).resolves.toBeUndefined()
  })
})
