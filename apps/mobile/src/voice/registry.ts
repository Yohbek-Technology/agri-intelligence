/**
 * Voice Command Registry
 * Maps voice intents to router actions, scroll offsets, or modal confirmations.
 */
import { VoiceIntent } from './parser';

export interface CommandHandlerAction {
  type: 'NAVIGATE' | 'SCROLL' | 'CONFIRM' | 'TTS';
  route?: string;
  scrollDirection?: 'UP' | 'DOWN';
  confirmed?: boolean;
}

export const COMMAND_REGISTRY: Record<VoiceIntent, CommandHandlerAction> = {
  NAVIGATE_HOME: { type: 'NAVIGATE', route: '/(farmer)' },
  NAVIGATE_FARMS: { type: 'NAVIGATE', route: '/(farmer)/farms' },
  NAVIGATE_DIAGNOSE: { type: 'NAVIGATE', route: '/(farmer)/diagnose' },
  NAVIGATE_WEATHER: { type: 'NAVIGATE', route: '/(farmer)/weather' },
  NAVIGATE_VOICE_BOX: { type: 'NAVIGATE', route: '/(farmer)/voice-box' },
  SCROLL_DOWN: { type: 'SCROLL', scrollDirection: 'DOWN' },
  SCROLL_UP: { type: 'SCROLL', scrollDirection: 'UP' },
  CONFIRM_YES: { type: 'CONFIRM', confirmed: true },
  CONFIRM_NO: { type: 'CONFIRM', confirmed: false },
  READ_ALOUD: { type: 'TTS' },
  UNKNOWN: { type: 'TTS' },
};

