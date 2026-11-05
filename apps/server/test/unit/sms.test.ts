import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import { countSegments, normalizeEthiopianPhone } from '../../src/services/sms.js'

describe('normalizeEthiopianPhone', () => {
  it('leaves valid E.164 unchanged', () => {
    expect(normalizeEthiopianPhone('+251911000000')).toBe('+251911000000')
    expect(normalizeEthiopianPhone('+251711000000')).toBe('+251711000000')
  })

  it('converts 0-prefix to E.164', () => {
    expect(normalizeEthiopianPhone('0911000000')).toBe('+251911000000')
    expect(normalizeEthiopianPhone('0711000000')).toBe('+251711000000')
  })

  it('converts 251-prefix to E.164', () => {
    expect(normalizeEthiopianPhone('251911000000')).toBe('+251911000000')
  })

  it('strips whitespace before normalizing', () => {
    expect(normalizeEthiopianPhone(' 0911 000 000 ')).toBe('+251911000000')
    expect(normalizeEthiopianPhone('+251 911 000 000')).toBe('+251911000000')
  })

  it('returns unrecognized formats as-is', () => {
    expect(normalizeEthiopianPhone('abc')).toBe('abc')
  })
})

describe('countSegments', () => {
  it('counts 1 segment for short Latin text', () => {
    expect(countSegments('Hello farmer.')).toBe(1)
  })

  it('counts 1 segment for exactly 160 Latin chars', () => {
    expect(countSegments('A'.repeat(160))).toBe(1)
  })

  it('counts 2 segments for 161 Latin chars', () => {
    expect(countSegments('A'.repeat(161))).toBe(2)
  })

  it('counts 3 segments for 321 Latin chars', () => {
    expect(countSegments('A'.repeat(321))).toBe(3)
  })

  it('counts 1 segment for short Amharic text', () => {
    expect(countSegments('ሰላም')).toBe(1)
  })

  it('counts 1 segment for exactly 70 Amharic chars', () => {
    expect(countSegments('ሀ'.repeat(70))).toBe(1)
  })

  it('counts 2 segments for 71 Amharic chars', () => {
    expect(countSegments('ሀ'.repeat(71))).toBe(2)
  })

  it('detects Ge\'ez in mixed text and uses 70-char limit', () => {
    expect(countSegments('Hello ሰላም')).toBe(1)
    expect(countSegments(`Hello ${'ሀ'.repeat(70)}`)).toBe(2)
  })
})
