import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Mic, Volume2, Square } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation, LanguageCode } from '@/i18n';
import { Colors } from '@/constants/theme';
import { tokens } from '@/theme/tokens';

interface VoiceBarProps {
  title?: string;
  readAloudText?: string;
  onVoiceCommand?: () => void;
}

const langToSpeechLocale: Record<LanguageCode, string> = {
  en: 'en-US',
  am: 'am-ET',
  om: 'om-ET',
  ti: 'ti-ET',
};

export function VoiceBar({ title, readAloudText, onVoiceCommand }: VoiceBarProps) {
  const { language, t } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleReadAloud = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToRead = readAloudText || title || t('common.appName');
    setIsSpeaking(true);

    try {
      Speech.speak(textToRead, {
        language: langToSpeechLocale[language] || 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleMicPress = () => {
    setIsListening(!isListening);
    if (onVoiceCommand) {
      onVoiceCommand();
    }
  };

  return (
    <View style={styles.container}>
      {/* Read Aloud Button */}
      <TouchableOpacity
        style={[styles.button, isSpeaking ? styles.speakingButton : styles.actionButton]}
        onPress={handleReadAloud}
        activeOpacity={0.8}
        accessibilityLabel={isSpeaking ? t('common.stopAudio') : t('common.readAloud')}
      >
        {isSpeaking ? (
          <Square size={20} color="#FFFFFF" />
        ) : (
          <Volume2 size={20} color="#151A14" />
        )}
        <Text style={[styles.buttonText, isSpeaking && styles.speakingButtonText]}>
          {isSpeaking ? t('common.stopAudio') : t('common.readAloud')}
        </Text>
      </TouchableOpacity>

      {/* Screen Title Display */}
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle} numberOfLines={1}>
          {title || t('common.appName')}
        </Text>
      </View>

      {/* Voice Mic Button */}
      <TouchableOpacity
        style={[styles.micButton, isListening && styles.listeningMic]}
        onPress={handleMicPress}
        activeOpacity={0.8}
        accessibilityLabel={t('common.tapToSpeak')}
      >
        {isListening ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Mic size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E2DBD0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0ECE1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 28,
    minHeight: tokens.touchTarget.min,
  },
  speakingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 28,
    minHeight: tokens.touchTarget.min,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#151A14',
  },
  speakingButtonText: {
    color: '#FFFFFF',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
    textAlign: 'center',
  },
  micButton: {
    width: tokens.touchTarget.min,
    height: tokens.touchTarget.min,
    borderRadius: tokens.touchTarget.min / 2,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  listeningMic: {
    backgroundColor: '#DC2626',
  },
});

