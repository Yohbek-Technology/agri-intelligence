import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import { synthesize } from '../../src/services/tts.js'

beforeAll(() => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY must be set in .env before running tests')
  }
})

// ── Input validation (no network) ──

describe('synthesize — input validation', () => {
  it('throws on empty text', async () => {
    await expect(synthesize('', 'en')).rejects.toThrow('[tts] text is required')
  })

  it('throws on whitespace-only text', async () => {
    await expect(synthesize('   ', 'en')).rejects.toThrow('[tts] text is required')
  })

  it('throws on null text', async () => {
    await expect(synthesize(null as never, 'en')).rejects.toThrow()
  })
})

// ── Real Gemini TTS API tests ──

describe('synthesize — real Gemini TTS', () => {
  it('generates audio buffer from English text', async () => {
    const result = await synthesize('Hello, this is a test.', 'en')
    expect(result.audio).toBeInstanceOf(Buffer)
    expect(result.audio.length).toBeGreaterThan(0)
    expect(result.mimeType).toContain('audio')
  }, 120000)

  it('generates audio buffer from Amharic text', async () => {
    const result = await synthesize('ሰላም እንዴት ናችሁ', 'am')
    expect(result.audio).toBeInstanceOf(Buffer)
    expect(result.audio.length).toBeGreaterThan(0)
    expect(result.mimeType).toContain('audio')
  }, 120000)

  it('returns consistent mime type across calls', async () => {
    const resultA = await synthesize('First sentence.', 'en')
    const resultB = await synthesize('Second sentence.', 'en')
    expect(resultA.mimeType).toBe(resultB.mimeType)
  }, 120000)

  it('produces different audio for different text', async () => {
    const short = await synthesize('Hi.', 'en')
    const long = await synthesize('This is a much longer sentence with many words for testing.', 'en')
    expect(long.audio.length).toBeGreaterThan(short.audio.length)
  }, 120000)
})
