/**
 * Speech-to-Text (STT) Service
 * Converts spoken input to text for search, form inputs, and voice commands.
 * // FR-MOB-001: Speech-to-text dictation in Ethiopian languages
 */

export interface SttResult {
  transcript: string;
  confidence: number;
  language: string;
}

export class SttService {
  private isListening: boolean = false;

  async startListening(
    language: string = 'am',
    onResult?: (result: SttResult) => void
  ): Promise<void> {
    this.isListening = true;
    // Native speech recognition integration (e.g. @react-native-voice/voice or Whisper edge model)
  }

  async stopListening(): Promise<void> {
    this.isListening = false;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const sttService = new SttService();

