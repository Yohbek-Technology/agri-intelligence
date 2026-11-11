import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { LanguageCode } from '@/i18n';

const langToSpeechLocale: Record<LanguageCode, string> = {
  en: 'en-US',
  am: 'am-ET',
  om: 'om-ET',
  ti: 'ti-ET',
};

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  async startRecording(): Promise<void> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Audio recording permission denied');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
    } catch (err) {
      console.error('Failed to start recording', err);
      throw err;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
      return null;
    }
  }

  async playSound(uri: string, onDone?: () => void): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      this.sound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          if (onDone) onDone();
        }
      });
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  }

  async stopSound(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  speak(text: string, language: LanguageCode = 'am', onDone?: () => void): void {
    Speech.stop();
    Speech.speak(text, {
      language: langToSpeechLocale[language] || 'en-US',
      pitch: 1.0,
      rate: 0.9,
      onDone,
      onError: onDone,
    });
  }

  stopSpeech(): void {
    Speech.stop();
  }
}

export const audioService = new AudioService();

