import React, { createContext, useContext } from 'react';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import type { ParsedCommand } from '@/voice/parser';

export interface VoiceContextValue {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  lastCommand: ParsedCommand | null;
  processTranscript: (transcript: string) => Promise<ParsedCommand>;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const voiceState = useVoiceCommand();

  return (
    <VoiceContext.Provider value={voiceState}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoiceContext(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return ctx;
}

