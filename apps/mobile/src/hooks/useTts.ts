/**
 * useTts Hook
 * Spoken narration and screen read-aloud controller.
 */
import { useCallback, useState } from 'react';
import { ttsService } from '@/services/speech/tts';
import { useTranslation } from '@/i18n';

export function useTts() {
  const { language } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    async (text: string) => {
      setIsSpeaking(true);
      await ttsService.speak(text, {
        language,
        onDone: () => setIsSpeaking(false),
      });
    },
    [language]
  );

  const stop = useCallback(async () => {
    await ttsService.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    autoTtsEnabled: true,
  };
}
