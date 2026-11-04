import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import { randomUUID } from 'crypto'

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

// Generate a unique storage key — stored as media_files.storage_key in the DB
export function generateStorageKey(folder: string, extension: string): string {
  return `${folder}/${randomUUID()}.${extension}`
}

// Extract the Cloudinary public_id from a secure_url stored in the DB
export function extractPublicId(secureUrl: string): string {
  const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
  if (!match?.[1]) throw new Error(`[storage] Cannot extract public_id from URL: ${secureUrl}`)
  return match[1]
}

// Upload a file buffer or local path — returns the full result; save result.secure_url and result.public_id to DB
export async function uploadFile(
  source: Buffer | string,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto',
  maxRetries = 1
): Promise<UploadApiResponse> {
  const attemptUpload = () =>
    new Promise<UploadApiResponse>((resolve, reject) => {
      if (Buffer.isBuffer(source)) {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType, timeout: 60000 },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve(result)
          }
        )
        stream.end(source)
      } else {
        cloudinary.uploader.upload(
          source,
          { folder, resource_type: resourceType, timeout: 60000 },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve(result)
          }
        )
      }
    })

  try {
    return await attemptUpload()
  } catch (error: any) {
    const isTimeout =
      error?.name === 'TimeoutError' ||
      error?.message === 'Request Timeout' ||
      error?.http_code === 499

    if (maxRetries > 0 && isTimeout) {
      return uploadFile(source, folder, resourceType, maxRetries - 1)
    }
    throw error
  }
}

// Generate a signed delivery URL for time-limited secure access (media_files signed delivery)
export function getSignedUrl(publicId: string, expiresInSeconds = 3600): string {
  return cloudinary.url(publicId, {
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  })
}

// Delete an asset by public_id (stored alongside secure_url in media_files)
export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

// Delete an asset by its secure_url when only the URL is available
export async function deleteFileByUrl(secureUrl: string): Promise<void> {
  const publicId = extractPublicId(secureUrl)
  await cloudinary.uploader.destroy(publicId)
}
