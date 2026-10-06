import type { AppLanguage } from '@repo/shared'
import { getAI } from '@/config/ai.js'

const TTS_MODEL = process.env.AI_TTS_MODEL ?? 'gemini-3.8-flash-tts'
const TTS_FALLBACK_MODEL = process.env.AI_TTS_FALLBACK_MODEL ?? 'gemini-3.8-flash-tts'
const VOICE_MAP: Record<AppLanguage, string> = {
  am: process.env.AI_TTS_VOICE_AM ?? 'Achird',
  om: process.env.AI_TTS_VOICE_OM ?? 'Achird',
  ti: process.env.AI_TTS_VOICE_TI ?? 'Achird',
  en: process.env.AI_TTS_VOICE_EN ?? 'Puck',
}

interface TTSResult {
  audio: Buffer
  mimeType: string
}

// Extract base64 audio from Gemini response parts using type narrowing
function extractAudio(parts: unknown[]): TTSResult | null {
  for (const part of parts) {
    if (typeof part !== 'object' || part === null) continue
    if (!('inlineData' in part)) continue

    const inlineData = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData
    if (!inlineData?.data) continue

    return {
      audio: Buffer.from(inlineData.data, 'base64'),
      mimeType: inlineData.mimeType ?? 'audio/L16;codec=pcm;rate=24000',
    }
  }
  return null
}

// Synthesize text to speech — returns PCM audio buffer + mime type
// Used by: announcements (COMM-3), grievance TTS (TRG-4, GRIEV-6), weather audio (WEATH-6), yield-gap narration (YIELD-8), diagnosis audio (DIAG-7)
export async function synthesize(
  text: string,
  language: AppLanguage
): Promise<TTSResult> {
  if (!text?.trim()) throw new Error('[tts] text is required and must not be empty')

  const ai = getAI()
  const models = [TTS_MODEL, TTS_FALLBACK_MODEL]
  let lastError: Error | undefined

  for (const model of models) {
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: text,
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: VOICE_MAP[language],
                },
              },
            },
          } as never,
        })

        const parts = response.candidates?.[0]?.content?.parts
        if (!parts?.length) throw new Error(`[tts] No content parts in response from ${model}`)

        const result = extractAudio(parts)
        if (!result) throw new Error(`[tts] No audio data found in response from ${model}`)

        if (result.audio.length === 0) {
          throw new Error(`[tts] Audio buffer is empty from ${model}`)
        }

        return result
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

  throw new Error(`[tts] All models failed: ${lastError?.message}`)
}
