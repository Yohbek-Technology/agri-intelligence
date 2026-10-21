import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { useVoice } from '@/context/VoiceContext';
import { ListeningOverlay } from './ListeningOverlay';

export interface VoiceAssistantProps {
  onNavigate?: (route: string) => void;
  onIntentResolved?: (intent: string, slots?: Record<string, unknown>) => void;
}

export function VoiceAssistant({ onNavigate, onIntentResolved }: VoiceAssistantProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isListening, isSpeaking, startListening } = useVoice();

  const handleOpen = () => {
    setModalVisible(true);
    startListening();
  };

  return (
    <>
      {/* 56dp Persistent Floating Voice Assistant FAB (VOICE-1, MOB-6, Stitch Level 3) */}
      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Voice Assistant Microphone"
        style={({ pressed }) => [
          styles.fab,
          Shadows.floatingButton,
          isListening && styles.fabListening,
          isSpeaking && styles.fabSpeaking,
          pressed && styles.fabPressed,
        ]}>
        <Text style={styles.fabIcon}>🎙️</Text>
        {isListening ? <View style={styles.pulseDot} /> : null}
      </Pressable>

      {/* Voice Listening Overlay Modal */}
      <ListeningOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Spacing.five,
    right: Spacing.four,
    width: TouchTargets.voiceButton, // 56dp
    height: TouchTargets.voiceButton, // 56dp
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary, // Deep Forest Green #1B5E20
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: Colors.light.primaryHover,
  },
  fabListening: {
    backgroundColor: Colors.light.secondary, // Fresh Sprout Green #4CAF50
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  fabSpeaking: {
    backgroundColor: Colors.light.accent, // Terracotta Amber #E65100
  },
  fabIcon: {
    fontSize: 26,
  },
  pulseDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.danger,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
