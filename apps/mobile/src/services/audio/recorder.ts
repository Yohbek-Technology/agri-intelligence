/**
 * Audio Recording Service
 * Records farmer spoken grievances and queries using expo-av.
 * // FR-MOB-005: Voice Box audio recording with max duration constraint
 */
import { Audio } from 'expo-av';
import { MAX_AUDIO_RECORDING_DURATION_SEC } from '@/lib/constants';

export interface RecordingResult {
  uri: string;
  durationSec: number;
}

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private startTime: number = 0;

  async startRecording(): Promise<void> {
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== 'granted') {
      throw new Error('Microphone permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    this.recording = recording;
    this.startTime = Date.now();
  }

  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording) {
      throw new Error('No active recording in progress');
    }

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    const elapsedSec = Math.min(
      Math.round((Date.now() - this.startTime) / 1000),
      MAX_AUDIO_RECORDING_DURATION_SEC
    );
    this.recording = null;

    if (!uri) {
      throw new Error('Failed to retrieve recording URI');
    }

    return { uri, durationSec: elapsedSec };
  }

  isRecording(): boolean {
    return this.recording !== null;
  }
}

export const audioRecorder = new AudioRecorder();

