import { Platform } from 'react-native';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';

export interface AudioPlayerState {
  status: PlaybackStatus;
  currentUrl: string | null;
  playbackSpeed: number;
  durationMs: number;
  positionMs: number;
  error?: string;
}

type StateListener = (state: AudioPlayerState) => void;

class EphemeralAudioPlayer {
  private state: AudioPlayerState = {
    status: 'idle',
    currentUrl: null,
    playbackSpeed: 1.0,
    durationMs: 0,
    positionMs: 0,
  };

  private listeners: Set<StateListener> = new Set();
  private webAudioElement: HTMLAudioElement | null = null;

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  /**
   * Streams audio directly from an API endpoint without persisting to flash storage.
   */
  async playStream(url: string, speed: number = this.state.playbackSpeed): Promise<void> {
    try {
      this.state = {
        ...this.state,
        status: 'loading',
        currentUrl: url,
        playbackSpeed: speed,
        error: undefined,
      };
      this.notify();

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (this.webAudioElement) {
          this.webAudioElement.pause();
          this.webAudioElement = null;
        }

        const audio = new window.Audio(url);
        this.webAudioElement = audio;
        audio.playbackRate = speed;

        audio.onplaying = () => {
          this.state = { ...this.state, status: 'playing' };
          this.notify();
        };

        audio.onpause = () => {
          if (this.state.status === 'playing') {
            this.state = { ...this.state, status: 'paused' };
            this.notify();
          }
        };

        audio.onended = () => {
          this.state = { ...this.state, status: 'completed', positionMs: 0 };
          this.notify();
        };

        audio.onerror = (e) => {
          console.warn('[AudioPlayer] Audio playback error:', e);
          this.state = { ...this.state, status: 'error', error: 'Audio stream playback failed.' };
          this.notify();
        };

        await audio.play();
      } else {
        // Native mobile simulation / driver hook
        // When expo-audio / native audio player is linked, it streams here
        this.state = { ...this.state, status: 'playing', durationMs: 45000 };
        this.notify();

        // Simulate natural speech completion fallback if native driver is mock
        setTimeout(() => {
          if (this.state.currentUrl === url && this.state.status === 'playing') {
            this.state = { ...this.state, status: 'completed' };
            this.notify();
          }
        }, 5000);
      }
    } catch (err: any) {
      console.warn('[AudioPlayer] Failed to stream audio:', err);
      this.state = {
        ...this.state,
        status: 'error',
        error: err?.message || 'Failed to stream audio.',
      };
      this.notify();
    }
  }

  pause(): void {
    if (this.webAudioElement) {
      this.webAudioElement.pause();
    }
    this.state = { ...this.state, status: 'paused' };
    this.notify();
  }

  stop(): void {
    if (this.webAudioElement) {
      this.webAudioElement.pause();
      this.webAudioElement.currentTime = 0;
      this.webAudioElement = null;
    }
    this.state = { ...this.state, status: 'idle', currentUrl: null, positionMs: 0 };
    this.notify();
  }

  setSpeed(speed: number): void {
    this.state = { ...this.state, playbackSpeed: speed };
    if (this.webAudioElement) {
      this.webAudioElement.playbackRate = speed;
    }
    this.notify();
  }

  getState(): AudioPlayerState {
    return { ...this.state };
  }
}

export const audioPlayer = new EphemeralAudioPlayer();
