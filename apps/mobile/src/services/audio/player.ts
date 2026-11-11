/**
 * Audio Player Service
 * Handles playback of pre-recorded prompts, spoken explanations, and DA voice replies.
 */
import { Audio } from 'expo-av';

export class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  async playUri(uri: string, onFinished?: () => void): Promise<void> {
    await this.stop();

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    this.sound = sound;
    this.isPlaying = true;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        this.isPlaying = false;
        onFinished?.();
      }
    });
  }

  async stop(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync().catch(() => {});
      await this.sound.unloadAsync().catch(() => {});
      this.sound = null;
      this.isPlaying = false;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioPlayer = new AudioPlayer();

