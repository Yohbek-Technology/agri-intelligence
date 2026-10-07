import type { AITier } from '@repo/shared'
import * as gemini from '@/providers/gemini.js'
import * as openrouter from '@/providers/openrouter.js'

const isDev = process.env.NODE_ENV !== 'production'
const provider = isDev ? openrouter : gemini

console.log(`[ai-provider] ${isDev ? 'openrouter/auto:free (development)' : 'gemini (production)'}`)

export const generateContent = (
  tier: AITier,
  contents: unknown,
  config?: Record<string, unknown>
): Promise<string> => provider.generateContent(tier, contents, config)

export const generateStructuredContent = <T = unknown>(
  tier: AITier,
  contents: unknown,
  schema: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<T> => provider.generateStructuredContent<T>(tier, contents, schema, config)

export { getTierConfig, roundCoordinates, sanitizePromptContext, Type, getAI } from '@/providers/gemini.js'
