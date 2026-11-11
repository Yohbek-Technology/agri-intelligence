/**
 * Voice Command Parser
 * Parses transcribed speech into structured navigation, scrolling, or action intents.
 * // FR-MOB-001 & FR-MOB-002: Offline/on-device spoken command parsing
 */
import enPhrases from './phrases/en.json';
import amPhrases from './phrases/am.json';
import omPhrases from './phrases/om.json';
import tiPhrases from './phrases/ti.json';

export type VoiceIntent =
  | 'NAVIGATE_HOME'
  | 'NAVIGATE_FARMS'
  | 'NAVIGATE_DIAGNOSE'
  | 'NAVIGATE_WEATHER'
  | 'NAVIGATE_VOICE_BOX'
  | 'SCROLL_DOWN'
  | 'SCROLL_UP'
  | 'CONFIRM_YES'
  | 'CONFIRM_NO'
  | 'READ_ALOUD'
  | 'UNKNOWN';

export interface ParsedCommand {
  intent: VoiceIntent;
  confidence: number;
  rawTranscript: string;
  matchedPhrase?: string;
}

const PHRASE_DICTIONARIES: Record<string, Record<string, string[]>> = {
  en: enPhrases,
  am: amPhrases,
  om: omPhrases,
  ti: tiPhrases,
};

export function parseVoiceTranscript(
  transcript: string,
  language: string = 'am'
): ParsedCommand {
  if (!transcript || transcript.trim().length === 0) {
    return { intent: 'UNKNOWN', confidence: 0, rawTranscript: '' };
  }

  const clean = transcript.trim().toLowerCase();
  const dict = PHRASE_DICTIONARIES[language] || PHRASE_DICTIONARIES.en;

  // Exact match search across active language dictionary
  for (const [intentKey, phrases] of Object.entries(dict)) {
    for (const phrase of phrases) {
      const lowerPhrase = phrase.toLowerCase();
      if (clean === lowerPhrase || clean.includes(lowerPhrase)) {
        return {
          intent: intentKey as VoiceIntent,
          confidence: clean === lowerPhrase ? 1.0 : 0.85,
          rawTranscript: transcript,
          matchedPhrase: phrase,
        };
      }
    }
  }

  // Fallback to English dictionary if not already checked
  if (language !== 'en') {
    for (const [intentKey, phrases] of Object.entries(PHRASE_DICTIONARIES.en)) {
      for (const phrase of phrases) {
        if (clean === phrase.toLowerCase() || clean.includes(phrase.toLowerCase())) {
          return {
            intent: intentKey as VoiceIntent,
            confidence: 0.75,
            rawTranscript: transcript,
            matchedPhrase: phrase,
          };
        }
      }
    }
  }

  return { intent: 'UNKNOWN', confidence: 0, rawTranscript: transcript };
}

