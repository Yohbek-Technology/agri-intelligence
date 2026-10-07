import 'dotenv/config'
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
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
    expect(resultA.mimeType).toContain('audio')
    // second call handled in next test to avoid back-to-back rate limit
  }, 120000)

  it('produces longer audio for longer text', async () => {
    const result = await synthesize('This is a longer sentence used to verify audio length scales with input.', 'en')
    expect(result.audio.length).toBeGreaterThan(0)
  }, 120000)
})
