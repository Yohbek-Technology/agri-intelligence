/**
 * useVoiceCommand Hook
 * Listens, parses Ethiopian speech transcripts into intents, and executes commands.
 * // FR-MOB-001 & FR-MOB-002: Voice navigation and scrolling
 */
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { parseVoiceTranscript, type ParsedCommand } from '@/voice/parser';
import { COMMAND_REGISTRY } from '@/voice/registry';
import { useTranslation } from '@/i18n';
import { ttsService } from '@/services/speech/tts';

export function useVoiceCommand() {
  const router = useRouter();
  const { language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<ParsedCommand | null>(null);

  const processTranscript = useCallback(
    async (transcript: string) => {
      const parsed = parseVoiceTranscript(transcript, language);
      setLastCommand(parsed);

      if (parsed.intent !== 'UNKNOWN') {
        const action = COMMAND_REGISTRY[parsed.intent];
        if (action.type === 'NAVIGATE' && action.route) {
          router.push(action.route as any);
        } else if (action.type === 'TTS') {
          await ttsService.speak('Command recognized: ' + parsed.intent, {
            language,
          });
        }
      }
      return parsed;
    },
    [language, router]
  );

  return {
    isListening,
    setIsListening,
    lastCommand,
    processTranscript,
  };
}
