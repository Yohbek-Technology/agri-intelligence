/**
 * useRecorder Hook
 * Starts, stops, and manages audio recording for voice grievances and queries.
 */
import { useState, useCallback } from 'react';
import { audioRecorder, type RecordingResult } from '@/services/audio/recorder';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecording, setLastRecording] = useState<RecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to start recording');
    }
  }, []);

  const stop = useCallback(async (): Promise<RecordingResult | null> => {
    try {
      const result = await audioRecorder.stopRecording();
      setIsRecording(false);
      setLastRecording(result);
      return result;
    } catch (err: any) {
      setIsRecording(false);
      setError(err?.message || 'Failed to stop recording');
      return null;
    }
  }, []);

  return {
    isRecording,
    lastRecording,
    error,
    start,
    stop,
  };
}

