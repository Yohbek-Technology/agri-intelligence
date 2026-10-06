import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import { transcribe, isSupportedMimeType } from '../../src/services/stt.js'
import { synthesize } from '../../src/services/tts.js'

beforeAll(() => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY must be set in .env before running tests')
  }
})

// ── Pure function tests (no network) ──

describe('isSupportedMimeType', () => {
  it('returns true for supported types', () => {
    expect(isSupportedMimeType('audio/webm')).toBe(true)
    expect(isSupportedMimeType('audio/webm;codecs=opus')).toBe(true)
    expect(isSupportedMimeType('audio/mp3')).toBe(true)
    expect(isSupportedMimeType('audio/mpeg')).toBe(true)
    expect(isSupportedMimeType('audio/wav')).toBe(true)
    expect(isSupportedMimeType('audio/x-wav')).toBe(true)
    expect(isSupportedMimeType('audio/ogg')).toBe(true)
    expect(isSupportedMimeType('audio/ogg;codecs=opus')).toBe(true)
    expect(isSupportedMimeType('audio/aac')).toBe(true)
    expect(isSupportedMimeType('audio/mp4')).toBe(true)
    expect(isSupportedMimeType('audio/x-m4a')).toBe(true)
    expect(isSupportedMimeType('audio/flac')).toBe(true)
  })

  it('returns false for unsupported types', () => {
    expect(isSupportedMimeType('video/mp4')).toBe(false)
    expect(isSupportedMimeType('image/jpeg')).toBe(false)
    expect(isSupportedMimeType('text/plain')).toBe(false)
    expect(isSupportedMimeType('application/json')).toBe(false)
  })
})

// ── Input validation (no network) ──

describe('transcribe — input validation', () => {
  it('throws on empty buffer', async () => {
    await expect(transcribe(Buffer.alloc(0), 'audio/wav', 'en')).rejects.toThrow(
      '[stt] audio buffer is required'
    )
  })

  it('throws on oversized buffer (exceeds 5 MB)', async () => {
    const oversized = Buffer.alloc(6 * 1024 * 1024)
    await expect(transcribe(oversized, 'audio/wav', 'en')).rejects.toThrow(
      '[stt] audio exceeds maximum size'
    )
  })

  it('throws on unsupported mime type', async () => {
    const audio = Buffer.from('fake audio data that is long enough')
    await expect(transcribe(audio, 'video/mp4', 'en')).rejects.toThrow(
      '[stt] unsupported mime type'
    )
  })
})

// ── Real Gemini STT API tests ──

describe('transcribe — real Gemini STT', () => {
  it('transcribes synthesized English audio and checks keyword accuracy', async () => {
    const { audio, mimeType } = await synthesize('Good weather today.', 'en')

    expect(mimeType).toContain('audio')
    expect(isSupportedMimeType(mimeType)).toBe(true)

    const transcript = await transcribe(audio, mimeType, 'en')

    expect(transcript).toBeTruthy()
    expect(transcript.length).toBeGreaterThan(0)
    expect(transcript.toLowerCase()).toMatch(/weather|good|today/)
  }, 120000)

  it('transcribes a short English phrase', async () => {
    const { audio, mimeType } = await synthesize('Hello world.', 'en')
    const transcript = await transcribe(audio, mimeType, 'en')

    expect(transcript).toBeTruthy()
    expect(transcript.length).toBeGreaterThan(0)
  }, 120000)
})
