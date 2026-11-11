/**
 * Text-to-Speech (TTS) Service
 * Provides screen reading and spoken audio narration with per-language voice selection.
 * // FR-MOB-002: Read aloud and spoken guidance for low-literacy farmers
 */
import * as Speech from 'expo-speech';

export interface TtsOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onDone?: () => void;
}

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  am: 'am-ET',
  om: 'om-ET',
  ti: 'ti-ET',
  en: 'en-US',
};

export class TtsService {
  private isSpeaking: boolean = false;

  async speak(text: string, options?: TtsOptions): Promise<void> {
    const lang = options?.language || 'am';
    const speechCode = LANGUAGE_VOICE_MAP[lang] || 'en-US';

    await this.stop();
    this.isSpeaking = true;

    Speech.speak(text, {
      language: speechCode,
      rate: options?.rate ?? 0.85, // Slower rate for clear agronomic comprehension
      pitch: options?.pitch ?? 1.0,
      onDone: () => {
        this.isSpeaking = false;
        options?.onDone?.();
      },
      onError: () => {
        this.isSpeaking = false;
      },
    });
  }

  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TtsService();

