import { GoogleGenAI, Type } from '@google/genai'
import type { AITier, TierConfig } from '@repo/shared'

export { Type }
export type { AITier, TierConfig }

// ── Per-tier configuration (SRS 5.2: model ID configurable, timeout 25s, max 2 retries) ──
const TIERS: Record<AITier, TierConfig> = {
  // DIAG-1 to DIAG-8: heavy multimodal vision for leaf/stem photo inspection
  diagnostics: {
    primaryModel: process.env.AI_DIAGNOSTICS_MODEL ?? 'gemini-3.8-flash',
    fallbackModel: process.env.AI_DIAGNOSTICS_FALLBACK_MODEL ?? 'gemini-3.5-flash',
    temperature: 0.1,
    maxOutputTokens: 4096,
    topP: 0.95,
    timeoutMs: 25000,
    maxRetries: 2,
  },
  // VOICE-2 to VOICE-8, Section 5.1: ultra-low latency intent classification in 4 languages
  voice_intent: {
    primaryModel: process.env.AI_VOICE_MODEL ?? 'gemini-3.5-flash-lite',
    fallbackModel: process.env.AI_VOICE_FALLBACK_MODEL ?? 'gemini-3.5-flash',
    temperature: 0.0,
    maxOutputTokens: 1024,
    topP: 1.0,
    timeoutMs: 10000,
    maxRetries: 1,
  },
  // YIELD-7, YIELD-8: narrate deterministic statistical gaps in plain language
  yield_narration: {
    primaryModel: process.env.AI_NARRATION_MODEL ?? 'gemini-3.5-flash',
    fallbackModel: process.env.AI_NARRATION_FALLBACK_MODEL ?? 'gemini-3.8-flash',
    temperature: 0.3,
    maxOutputTokens: 2048,
    topP: 0.9,
    timeoutMs: 25000,
    maxRetries: 2,
  },
  // DIAG-8, REG-9: structured crop rotation and input guidance synthesis
  rotation_advice: {
    primaryModel: process.env.AI_ROTATION_MODEL ?? 'gemini-3.5-flash',
    fallbackModel: process.env.AI_ROTATION_FALLBACK_MODEL ?? 'gemini-3.8-flash',
    temperature: 0.2,
    maxOutputTokens: 2048,
    topP: 0.9,
    timeoutMs: 25000,
    maxRetries: 2,
  },
}

// ── Safety settings (SRS 4.2: safety settings enabled) ──
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_ONLY_HIGH' },
]

// ── GoogleGenAI singleton (SRS 4.2: API key exists only on the server) ──
let aiClient: GoogleGenAI | undefined

export function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('[ai] GEMINI_API_KEY must be set in environment variables.')
    }
    aiClient = new GoogleGenAI({ apiKey })
    console.log('[ai] GoogleGenAI client initialised')
  }
  return aiClient
}

export function getTierConfig(tier: AITier): TierConfig {
  return TIERS[tier]
}

// ── Unified content generation with retry, fallback, and timeout (SRS 5.2) ──
export async function generateContent(
  tier: AITier,
  contents: unknown,
  config?: Record<string, unknown>
): Promise<string> {
  const cfg = TIERS[tier]
  const ai = getAI()

  const models = [cfg.primaryModel, cfg.fallbackModel]
  let lastError: Error | undefined

  for (const model of models) {
    for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs)

        const response = await ai.models.generateContent({
          model,
          contents: contents as never,
          config: {
            temperature: cfg.temperature,
            maxOutputTokens: cfg.maxOutputTokens,
            topP: cfg.topP,
            safetySettings: SAFETY_SETTINGS,
            abortSignal: controller.signal,
            ...config,
          } as never,
        })

        clearTimeout(timeout)

        const text = response.text
        if (!text) throw new Error(`[ai] Empty response from ${model}`)

        console.log(`[ai] ${tier} → ${model} (${attempt === 0 ? 'primary' : `retry ${attempt}`})`)
        return text
      } catch (err) {
        lastError = err as Error
        const isLastModel = model === models[models.length - 1]
        const isLastAttempt = attempt === cfg.maxRetries
        if (!isLastModel || !isLastAttempt) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        }
      }
    }
  }

  throw new Error(`[ai] All models failed for tier "${tier}": ${lastError?.message}`)
}

// ── Structured JSON generation with schema validation (DIAG-3, YIELD-7) ──
export async function generateStructuredContent<T = unknown>(
  tier: AITier,
  contents: unknown,
  schema: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<T> {
  const text = await generateContent(tier, contents, {
    responseMimeType: 'application/json',
    responseSchema: schema,
    ...config,
  })

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`[ai] Failed to parse structured response as JSON for tier "${tier}"`)
  }
}

// ── Data sanitization (SRS 4.2: no PII, coordinates rounded to 0.01°) ──
export function roundCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
  }
}

// ── Strip PII from prompt context before sending to Gemini ──
export function sanitizePromptContext(ctx: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...ctx }
  delete sanitized.farmer_name
  delete sanitized.phone_number
  delete sanitized.local_id
  delete sanitized.farmer_id
  delete sanitized.user_id

  if (typeof sanitized.lat === 'number' && typeof sanitized.lng === 'number') {
    const rounded = roundCoordinates(sanitized.lat as number, sanitized.lng as number)
    sanitized.lat = rounded.lat
    sanitized.lng = rounded.lng
  }

  return sanitized
}
