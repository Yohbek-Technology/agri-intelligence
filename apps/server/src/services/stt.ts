import type { AppLanguage } from '@repo/shared'
import { getAI } from '@/config/ai.js'

const STT_MODEL = process.env.AI_STT_MODEL ?? 'gemini-3.5-transcribe'
const STT_FALLBACK_MODEL = process.env.AI_STT_FALLBACK_MODEL ?? 'gemini-3.8-flash'
const MAX_AUDIO_BYTES = 5 * 1024 * 1024 // SRS 4.2: audio ≤ 5 MB

const LANGUAGE_HINT: Record<AppLanguage, string> = {
  am: 'Amharic',
  om: 'Afaan Oromoo',
  ti: 'Tigrinya',
  en: 'English',
}

const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/flac',
]

// Transcribe audio to text — used by POST /v1/voice/transcribe (SRS 4.15, Section 5.1)
export async function transcribe(
  audio: Buffer,
  mimeType: string,
  language: AppLanguage
): Promise<string> {
  if (!audio || audio.length === 0) throw new Error('[stt] audio buffer is required')
  if (audio.length > MAX_AUDIO_BYTES) {
    throw new Error(`[stt] audio exceeds maximum size of ${MAX_AUDIO_BYTES} bytes`)
  }
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`[stt] unsupported mime type: ${mimeType}. Supported: ${SUPPORTED_MIME_TYPES.join(', ')}`)
  }

  const ai = getAI()
  const models = [STT_MODEL, STT_FALLBACK_MODEL]
  const langName = LANGUAGE_HINT[language]
  let lastError: Error | undefined

  for (const model of models) {
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              text: `Transcribe the following audio accurately in ${langName}. Return only the transcribed text, no additional commentary.`,
            },
            {
              inlineData: {
                mimeType,
                data: audio.toString('base64'),
              },
            },
          ],
          config: {
            temperature: 0.0,
            maxOutputTokens: 2048,
          },
        } as never)

        const transcript = response.text?.trim()
        if (!transcript) throw new Error(`[stt] No transcript returned from ${model}`)

        return transcript
      } catch (err) {
        lastError = err as Error
        const isLastModel = model === models[models.length - 1]
        const isLastAttempt = attempt === 2
        if (!isLastModel || !isLastAttempt) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        }
      }
    }
  }

  throw new Error(`[stt] All models failed: ${lastError?.message}`)
}

// Check if a mime type is supported by the STT service
export function isSupportedMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType)
}
