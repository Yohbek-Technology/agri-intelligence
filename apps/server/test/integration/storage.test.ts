import 'dotenv/config'
import { describe, it, expect } from 'vitest'
import {
  uploadFile,
  getSignedUrl,
  deleteFile,
  deleteFileByUrl,
  generateStorageKey,
  extractPublicId,
} from '../../src/config/storage.js'

// Full end-to-end flow mirroring production usage:
// generate key → upload → sign → extract public_id → delete

describe('Storage integration — full media lifecycle', () => {
  let publicId: string
  let secureUrl: string

  it('step 1: generateStorageKey produces a valid DB storage_key', () => {
    const key = generateStorageKey('integration/test', 'jpg')
    expect(key).toMatch(/^integration\/test\/[0-9a-f-]{36}\.jpg$/)
  })

  it('step 2: uploadFile returns DB-ready fields', async () => {
    const result = await uploadFile(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      'integration/test',
      'image'
    )

    expect(result.secure_url).toMatch(/^https:\/\/res\.cloudinary\.com/)
    expect(result.public_id).toBeTruthy()
    expect(result.bytes).toBeGreaterThan(0)
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
    expect(result.format).toBe('jpg')
    expect(result.resource_type).toBe('image')

    publicId = result.public_id
    secureUrl = result.secure_url
  })

  it('step 3: getSignedUrl returns a valid time-limited URL', () => {
    const signed = getSignedUrl(publicId, 600)
    expect(signed).toMatch(/^https:\/\/res\.cloudinary\.com/)
    expect(signed).toContain('s--')
    expect(signed).toContain(publicId)
  })

  it('step 4: extractPublicId round-trips the public_id from the stored secure_url', () => {
    expect(extractPublicId(secureUrl)).toBe(publicId)
  })

  it('step 5: deleteFile removes the asset by public_id', async () => {
    await expect(deleteFile(publicId)).resolves.toBeUndefined()
  })
})

describe('Storage integration — buffer upload', () => {
  it('uploads a PNG buffer simulating a multipart form file', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    const result = await uploadFile(pngBuffer, 'integration/test', 'image')

    expect(result.secure_url).toMatch(/^https:\/\/res\.cloudinary\.com/)
    expect(result.bytes).toBeGreaterThan(0)

    await deleteFile(result.public_id)
  })
})

describe('Storage integration — deleteFileByUrl', () => {
  it('deletes an asset using only the secure_url', async () => {
    const result = await uploadFile(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      'integration/test',
      'image'
    )

    await expect(deleteFileByUrl(result.secure_url)).resolves.toBeUndefined()
  })
})

describe('Storage integration — concurrent uploads', () => {
  it('handles 3 simultaneous uploads and cleans up all of them', async () => {
    const results = await Promise.all([
      uploadFile('https://res.cloudinary.com/demo/image/upload/sample.jpg', 'integration/concurrent', 'image'),
      uploadFile('https://res.cloudinary.com/demo/image/upload/sample.jpg', 'integration/concurrent', 'image'),
      uploadFile('https://res.cloudinary.com/demo/image/upload/sample.jpg', 'integration/concurrent', 'image'),
    ])

    const publicIds = results.map((r) => r.public_id)
    expect(new Set(publicIds).size).toBe(3)

    await Promise.all(publicIds.map(deleteFile))
  })
})
