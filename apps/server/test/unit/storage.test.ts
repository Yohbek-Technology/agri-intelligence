import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import {
  generateStorageKey,
  extractPublicId,
  uploadFile,
  getSignedUrl,
  deleteFile,
  deleteFileByUrl,
} from '../../src/config/storage.js'

// Real Cloudinary calls — credentials must be set in .env
// Every test that uploads cleans up after itself

describe('generateStorageKey', () => {
  it('returns a correctly structured path', () => {
    const key = generateStorageKey('farmers/photos', 'jpg')
    expect(key).toMatch(/^farmers\/photos\/[0-9a-f-]{36}\.jpg$/)
  })

  it('produces a unique key on every call', () => {
    const keys = Array.from({ length: 10 }, () => generateStorageKey('test', 'jpg'))
    const unique = new Set(keys)
    expect(unique.size).toBe(10)
  })
})

describe('extractPublicId', () => {
  it('extracts from a versioned secure_url', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/farmers/photos/abc.jpg'
    expect(extractPublicId(url)).toBe('farmers/photos/abc')
  })

  it('extracts from a URL without a version segment', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/farmers/photos/abc.jpg'
    expect(extractPublicId(url)).toBe('farmers/photos/abc')
  })

  it('throws on a non-Cloudinary URL', () => {
    expect(() => extractPublicId('https://example.com/image.jpg')).toThrow()
  })
})

describe('uploadFile — real Cloudinary', () => {
  it('uploads a remote URL and returns valid metadata', async () => {
    const result = await uploadFile(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      'test/unit',
      'image'
    )

    expect(result.secure_url).toMatch(/^https:\/\/res\.cloudinary\.com/)
    expect(result.public_id).toBeTruthy()
    expect(result.bytes).toBeGreaterThan(0)
    expect(result.format).toBe('jpg')

    await deleteFile(result.public_id)
  })

  it('uploads a Buffer and returns valid metadata', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    const result = await uploadFile(pngBuffer, 'test/unit', 'image')

    expect(result.secure_url).toMatch(/^https:\/\/res\.cloudinary\.com/)
    expect(result.public_id).toBeTruthy()

    await deleteFile(result.public_id)
  })
})

describe('getSignedUrl — real Cloudinary', () => {
  it('returns a signed URL with a valid signature token', async () => {
    const result = await uploadFile(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      'test/unit',
      'image'
    )

    const signed = getSignedUrl(result.public_id, 300)
    expect(signed).toMatch(/^https:\/\/res\.cloudinary\.com/)
    expect(signed).toContain('s--')

    await deleteFile(result.public_id)
  })
})

describe('deleteFile — real Cloudinary', () => {
  it('deletes an uploaded asset without throwing', async () => {
    const result = await uploadFile(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      'test/unit',
      'image'
    )

    await expect(deleteFile(result.public_id)).resolves.toBeUndefined()
  })
})

describe('deleteFileByUrl — real Cloudinary', () => {
  it('deletes an asset using only the secure_url', async () => {
    const result = await uploadFile(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      'test/unit',
      'image'
    )

    await expect(deleteFileByUrl(result.secure_url)).resolves.toBeUndefined()
  })
})
