import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { audioPlayer } from '@/services/voice/audio-player';
import { classifySpokenIntent, type ClassifiedIntent } from '@/services/voice/intent-classifier';
import { resolveVoiceIntentToRoute } from '@/services/voice/voice-router';
import { apiRequest, setActiveLanguage, getActiveLanguage } from '@/services/api/client';
import { API_ENDPOINTS } from '@/config/env';
import type { SupportedLanguage } from '@/config/constants';

export interface VoiceContextValue {
  isListening: boolean;
  isSpeaking: boolean;
  language: SupportedLanguage;
  transcript: string;
  lastClassifiedIntent: ClassifiedIntent | null;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  speakText: (text: string, lang?: SupportedLanguage) => Promise<void>;
  processSpokenUtterance: (transcript: string, onNavigate?: (route: string) => void) => Promise<void>;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguageState] = useState<SupportedLanguage>('am');
  const [transcript, setTranscript] = useState('');
  const [lastClassifiedIntent, setLastClassifiedIntent] = useState<ClassifiedIntent | null>(null);

  // Hydrate language preference on launch
  useEffect(() => {
    void (async () => {
      const active = await getActiveLanguage();
      if (active === 'am' || active === 'om' || active === 'ti' || active === 'en') {
        setLanguageState(active);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    await setActiveLanguage(newLang);
  }, []);

  const stopSpeaking = useCallback(() => {
    audioPlayer.stop();
    setIsSpeaking(false);
  }, []);

  // Subscribe to audio player state
  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setIsSpeaking(state.status === 'playing' || state.status === 'loading');
    });
    return unsubscribe;
  }, []);


  const startListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const speakText = useCallback(async (text: string, lang?: SupportedLanguage) => {
    if (!text.trim()) return;
    const targetLang = lang || language;

    try {
      // In production with active backend, calls POST /v1/voice/tts
      const ttsUrl = `${API_ENDPOINTS.voice.tts}?lang=${targetLang}&text=${encodeURIComponent(text)}`;
      await audioPlayer.playStream(ttsUrl);
    } catch (err) {
      console.warn('[VoiceContext] Failed to speak text:', err);
    }
  }, [language]);


  const processSpokenUtterance = useCallback(
    async (rawText: string, onNavigate?: (route: string) => void) => {
      setIsListening(false);
      setTranscript(rawText);

      // 1. Run on-device offline classifier
      let classified = classifySpokenIntent(rawText, 'am');
      setLastClassifiedIntent(classified);

      // 2. Fallback to server if low confidence and online
      if (classified.confidence < 0.65) {
        try {
          const res = await apiRequest<{ intent: string; confidence: number; slots: Record<string, string> }>(
            API_ENDPOINTS.voice.intentFallback,
            {
              method: 'POST',
              body: JSON.stringify({ transcript: rawText, lang: 'am', screen: 'home' }),
            }
          );
          if (res.success && res.data) {
            classified = {
              intent: res.data.intent as any,
              confidence: res.data.confidence,
              slots: res.data.slots || {},
              rawTranscript: rawText,
              detectedLanguage: 'am',
            };
            setLastClassifiedIntent(classified);
          }
        } catch {
          // offline fallback to local classifier result
        }
      }

      // 3. Resolve intent to route
      const resolution = resolveVoiceIntentToRoute(classified);
      const feedback = resolution.spokenFeedback.am;

      // Speak feedback and navigate
      await speakText(feedback, 'am');
      if (resolution.routeName && onNavigate) {
        onNavigate(resolution.routeName);
      }
    },
    [speakText]
  );

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        language,
        transcript,
        lastClassifiedIntent,
        startListening,
        stopListening,
        stopSpeaking,
        setLanguage,
        speakText,
        processSpokenUtterance,
      }}>
      {children}
    </VoiceContext.Provider>

  );
}

export function useVoice(): VoiceContextValue {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
