// AI tier configuration types shared across server and web

export type AITier =
  | 'diagnostics'
  | 'voice_intent'
  | 'yield_narration'
  | 'rotation_advice'

export interface TierConfig {
  primaryModel: string
  fallbackModel: string
  temperature: number
  maxOutputTokens: number
  topP: number
  timeoutMs: number
  maxRetries: number
}
