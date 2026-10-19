import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';

export interface VoiceAssistantProps {
  onIntentResolved?: (intent: string, slots: Record<string, unknown>) => void;
}

export function VoiceAssistant({ onIntentResolved }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    setFeedback('Listening... Speak in Amharic, Oromo, Tigrinya, or English');

    // Simulate intent recognition / speech-to-text
    setTimeout(() => {
      setIsListening(false);
      setTranscript('Open current weather');
      setFeedback('Navigating to weather forecast...');
      onIntentResolved?.('open_weather', {});
      setTimeout(() => setIsOpen(false), 1200);
    }, 2000);
  };

  return (
    <>
      {/* 56dp Floating Voice Assistant Button (VOICE-1, MOB-6) */}
      <Pressable
        style={({ pressed }) => [
          styles.floatingButton,
          Shadows.floatingButton,
          pressed && styles.floatingButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Voice Assistant"
        onPress={() => {
          setIsOpen(true);
          startListening();
        }}>
        <Text style={styles.microphoneIcon}>🎙️</Text>
      </Pressable>

      {/* Voice Assistant Modal Overlay */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheetContainer}>
            <View style={styles.indicatorBar} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Agricultural Voice Assistant</Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                accessibilityLabel="Close voice assistant"
                style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Listening State Card */}
            <View style={styles.listeningCard}>
              <View style={[styles.pulseCircle, isListening && styles.pulseCircleActive]}>
                {isListening ? (
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                ) : (
                  <Text style={styles.micLarge}>🎙️</Text>
                )}
              </View>

              <Text style={styles.feedbackText}>{feedback}</Text>

              {transcript ? (
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptLabel}>You said:</Text>
                  <Text style={styles.transcriptText}>"{transcript}"</Text>
                </View>
              ) : null}
            </View>

            <Pressable
              style={styles.actionButton}
              onPress={isListening ? () => setIsListening(false) : startListening}>
              <Text style={styles.actionButtonText}>
                {isListening ? 'Stop Listening' : 'Tap to Speak Again'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Spacing.five,
    right: Spacing.four,
    width: TouchTargets.voiceButton,
    height: TouchTargets.voiceButton,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  floatingButtonPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: Colors.light.primaryHover,
  },
  microphoneIcon: {
    fontSize: 26,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  indicatorBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: Radii.full,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    width: TouchTargets.minimum,
    height: TouchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  listeningCard: {
    backgroundColor: Colors.light.background,
    borderRadius: Radii.large,
    padding: Spacing.four,
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  pulseCircle: {
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  pulseCircleActive: {
    backgroundColor: Colors.light.primarySubtle,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  micLarge: {
    fontSize: 28,
  },
  feedbackText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  transcriptBox: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    marginTop: Spacing.three,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  transcriptText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.large,
    height: TouchTargets.primaryButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  actionButtonText: {
    color: Colors.light.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
