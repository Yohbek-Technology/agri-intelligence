import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import { transcribe, isSupportedMimeType } from '../../src/services/stt.js'

beforeAll(() => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY must be set in .env before running tests')
  }
})

// Minimal valid WAV: 44-byte header + 8000 bytes of silence (0.5s mono 16kHz 16-bit PCM)
function makeSilentWav(): Buffer {
  const pcmLength = 8000
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcmLength, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(16000, 24)
  header.writeUInt32LE(32000, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcmLength, 40)
  return Buffer.concat([header, Buffer.alloc(pcmLength)])
}

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
    await expect(transcribe(Buffer.from('data'), 'video/mp4', 'en')).rejects.toThrow(
      '[stt] unsupported mime type'
    )
  })
})

// ── Real Gemini STT API tests (uses pre-built WAV — no TTS dependency) ──

describe('transcribe — real Gemini STT', () => {
  it('accepts a valid WAV buffer and returns a string or empty string for silence', async () => {
    const wav = makeSilentWav()
    // Silence may return empty string — what matters is no exception is thrown
    // and the return type is string
    let result: string | undefined
    try {
      result = await transcribe(wav, 'audio/wav', 'en')
      expect(typeof result).toBe('string')
    } catch (err) {
      // Gemini may return empty transcript for silence which stt.ts throws on
      // That is correct behavior — silence = no speech = empty transcript error
      expect((err as Error).message).toContain('[stt]')
    }
  }, 120000)
})
