import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import {
  getAI,
  getTierConfig,
  generateContent,
  generateStructuredContent,
  roundCoordinates,
  sanitizePromptContext,
  Type,
} from '../../src/config/ai.js'
import type { AITier } from '@repo/shared'

beforeAll(() => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY must be set in .env before running tests')
  }
})

// ── Pure function tests (no network) ──

describe('roundCoordinates', () => {
  it('rounds to 0.01 degree precision', () => {
    const result = roundCoordinates(8.541139, 39.270428)
    expect(result.lat).toBe(8.54)
    expect(result.lng).toBe(39.27)
  })

  it('handles negative coordinates', () => {
    const result = roundCoordinates(-8.541139, -39.270428)
    expect(result.lat).toBe(-8.54)
    expect(result.lng).toBe(-39.27)
  })

  it('handles already-rounded values', () => {
    const result = roundCoordinates(8.54, 39.27)
    expect(result.lat).toBe(8.54)
    expect(result.lng).toBe(39.27)
  })

  it('handles whole numbers', () => {
    const result = roundCoordinates(8, 39)
    expect(result.lat).toBe(8)
    expect(result.lng).toBe(39)
  })
})

describe('sanitizePromptContext', () => {
  it('strips all PII fields', () => {
    const ctx = {
      farmer_name: 'John Doe',
      phone_number: '+251911000000',
      local_id: 'ID123',
      farmer_id: 'uuid-1',
      user_id: 'uuid-2',
      crop: 'teff',
      soil_class: 'koticha_vertisol',
    }
    const sanitized = sanitizePromptContext(ctx)
    expect(sanitized).not.toHaveProperty('farmer_name')
    expect(sanitized).not.toHaveProperty('phone_number')
    expect(sanitized).not.toHaveProperty('local_id')
    expect(sanitized).not.toHaveProperty('farmer_id')
    expect(sanitized).not.toHaveProperty('user_id')
  })

  it('preserves non-PII fields', () => {
    const ctx = { crop: 'teff', zone: 'kolla', stage: 'vegetative' }
    const sanitized = sanitizePromptContext(ctx)
    expect(sanitized).toEqual(ctx)
  })

  it('rounds coordinates when both lat and lng are present', () => {
    const ctx = { lat: 8.541139, lng: 39.270428, crop: 'teff' }
    const sanitized = sanitizePromptContext(ctx)
    expect(sanitized.lat).toBe(8.54)
    expect(sanitized.lng).toBe(39.27)
  })

  it('does not round coordinates when only lat is present without lng', () => {
    // sanitizePromptContext only rounds when both lat AND lng exist
    const ctx = { lat: 8.541139, crop: 'teff' }
    const sanitized = sanitizePromptContext(ctx)
    expect(sanitized.lat).toBe(8.541139)
  })

  it('does not add coordinates when absent', () => {
    const ctx = { crop: 'teff' }
    const sanitized = sanitizePromptContext(ctx)
    expect(sanitized).not.toHaveProperty('lat')
    expect(sanitized).not.toHaveProperty('lng')
  })

  it('does not modify the original object', () => {
    const ctx = { farmer_name: 'John', lat: 8.541139, lng: 39.270428, crop: 'teff' }
    const sanitized = sanitizePromptContext(ctx)
    // original must be untouched
    expect(ctx.farmer_name).toBe('John')
    expect(ctx.lat).toBe(8.541139)
    expect(ctx.lng).toBe(39.270428)
    // sanitized must have PII removed and coordinates rounded
    expect(sanitized).not.toHaveProperty('farmer_name')
    expect(sanitized.lat).toBe(8.54)
    expect(sanitized.lng).toBe(39.27)
  })
})

describe('getTierConfig', () => {
  const tiers: AITier[] = ['diagnostics', 'voice_intent', 'yield_narration', 'rotation_advice']

  for (const tier of tiers) {
    it(`returns valid config for "${tier}"`, () => {
      const cfg = getTierConfig(tier)
      expect(typeof cfg.primaryModel).toBe('string')
      expect(cfg.primaryModel.length).toBeGreaterThan(0)
      expect(typeof cfg.fallbackModel).toBe('string')
      expect(cfg.fallbackModel.length).toBeGreaterThan(0)
      expect(cfg.temperature).toBeGreaterThanOrEqual(0)
      expect(cfg.maxOutputTokens).toBeGreaterThan(0)
      expect(cfg.topP).toBeGreaterThan(0)
      expect(cfg.timeoutMs).toBeGreaterThan(0)
      expect(cfg.maxRetries).toBeGreaterThanOrEqual(0)
    })
  }

  it('uses flash-lite for voice_intent primary model', () => {
    expect(getTierConfig('voice_intent').primaryModel).toContain('flash-lite')
  })

  it('has lower temperature for diagnostics than yield_narration', () => {
    expect(getTierConfig('diagnostics').temperature).toBeLessThan(
      getTierConfig('yield_narration').temperature
    )
  })

  it('voice_intent has shorter timeout than diagnostics', () => {
    expect(getTierConfig('voice_intent').timeoutMs).toBeLessThan(
      getTierConfig('diagnostics').timeoutMs
    )
  })
})

// ── Real API tests (requires GEMINI_API_KEY) ──

describe('getAI', () => {
  it('returns a GoogleGenAI instance', () => {
    const ai = getAI()
    expect(ai).toBeDefined()
    expect(ai.models).toBeDefined()
  })

  it('returns the same instance on subsequent calls (singleton)', () => {
    expect(getAI()).toBe(getAI())
  })
})

describe('generateContent — real Gemini API', () => {
  it('generates text from a simple prompt', async () => {
    const result = await generateContent('voice_intent', 'What is 2+2? Reply with only the number.')
    expect(result).toBeTruthy()
    expect(result).toContain('4')
  }, 120000)

  it('generates text for yield_narration tier', async () => {
    const result = await generateContent(
      'yield_narration',
      'In one sentence, explain why late fertilizer application reduces crop yield.'
    )
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(20)
  }, 120000)
})

describe('generateStructuredContent — real Gemini API', () => {
  it('returns parsed JSON matching the schema', async () => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        intent: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
      },
      required: ['intent', 'confidence'],
    }
    // Use voice_intent — faster and more quota-friendly for a simple classification
    const result = await generateStructuredContent<{ intent: string; confidence: number }>(
      'voice_intent',
      'Classify the intent of: "show my weather forecast". Respond with JSON only.',
      schema
    )
    expect(typeof result.intent).toBe('string')
    expect(result.intent.length).toBeGreaterThan(0)
    expect(typeof result.confidence).toBe('number')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  }, 120000)

  it('returns correct number in structured JSON', async () => {
    const schema = {
      type: Type.OBJECT,
      properties: {
        result: { type: Type.NUMBER },
      },
      required: ['result'],
    }
    // Use voice_intent (flash-lite, low retries, 10s timeout) — fast for trivial math
    const data = await generateStructuredContent<{ result: number }>(
      'voice_intent',
      'What is 5 + 5? Respond with JSON only, using field "result".',
      schema
    )
    expect(typeof data.result).toBe('number')
    expect(data.result).toBe(10)
  }, 120000)
})
