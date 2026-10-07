import type { AITier, TierConfig } from '@repo/shared'
import { getTierConfig } from '@/providers/gemini.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const DEV_MODEL = 'openrouter/auto:free'

async function callOpenRouter(
  model: string,
  prompt: string,
  cfg: TierConfig,
  json: boolean
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('[openrouter] OPENROUTER_API_KEY must be set in environment variables.')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs)

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://agri-intelligence.app',
      },
      body: JSON.stringify({
        model,
        temperature: cfg.temperature,
        max_tokens: cfg.maxOutputTokens,
        top_p: cfg.topP,
        response_format: json ? { type: 'json_object' } : undefined,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`[openrouter] ${res.status}: ${err}`)
    }

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error(`[openrouter] Empty response from ${model}`)

    return text
  } finally {
    clearTimeout(timeout)
  }
}

export async function generateContent(
  tier: AITier,
  contents: unknown,
  _config?: Record<string, unknown>
): Promise<string> {
  const cfg = getTierConfig(tier)
  const model = DEV_MODEL
  const prompt = typeof contents === 'string' ? contents : JSON.stringify(contents)

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const text = await callOpenRouter(model, prompt, cfg, false)
      console.log(`[openrouter] ${tier} → ${model} (${attempt === 0 ? 'primary' : `retry ${attempt}`})`)
      return text
    } catch (err) {
      lastError = err as Error
      if (attempt < cfg.maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw new Error(`[openrouter] All attempts failed for tier "${tier}": ${lastError?.message}`)
}

export async function generateStructuredContent<T = unknown>(
  tier: AITier,
  contents: unknown,
  _schema: Record<string, unknown>,
  _config?: Record<string, unknown>
): Promise<T> {
  const cfg = getTierConfig(tier)
  const model = DEV_MODEL
  const prompt = typeof contents === 'string' ? contents : JSON.stringify(contents)

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const text = await callOpenRouter(model, prompt, cfg, true)
      console.log(`[openrouter] ${tier} → ${model} structured (${attempt === 0 ? 'primary' : `retry ${attempt}`})`)
      try {
        return JSON.parse(text) as T
      } catch {
        throw new Error(`[openrouter] Failed to parse JSON response from ${model}`)
      }
    } catch (err) {
      lastError = err as Error
      if (attempt < cfg.maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw new Error(`[openrouter] All attempts failed for tier "${tier}": ${lastError?.message}`)
}
