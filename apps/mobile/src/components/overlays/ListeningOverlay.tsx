import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets, Shadows } from '@/theme/tokens';
import { useVoice } from '@/context/VoiceContext';

export interface ListeningOverlayProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export function ListeningOverlay({ visible, onClose, onNavigate }: ListeningOverlayProps) {
  const { isListening, transcript, processSpokenUtterance, stopListening } = useVoice();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [inputVal, setInputVal] = useState('');

  // Pulsing animation for microphone wave ring
  useEffect(() => {
    if (visible && isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible, isListening, pulseAnim]);

  const handleQuickCommand = async (command: string) => {
    onClose();
    await processSpokenUtterance(command, onNavigate);
  };

  const handleFinish = async () => {
    const textToProcess = inputVal || transcript || 'የአየር ሁኔታ';
    onClose();
    await processSpokenUtterance(textToProcess, onNavigate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        stopListening();
        onClose();
      }}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, Shadows.floatingButton]}>
          {/* Header with Close Action */}
          <View style={styles.header}>
            <View style={styles.languagePill}>
              <Text style={styles.languageText}>🎙️ አማርኛ (Amharic)</Text>
            </View>
            <Pressable
              onPress={() => {
                stopListening();
                onClose();
              }}
              accessibilityLabel="Close voice listening"
              style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Central Animated Mic & Soundwave Ring */}
          <View style={styles.micContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View style={styles.micCircle}>
              <Text style={styles.micIcon}>🎤</Text>
            </View>
          </View>

          {/* Prompt / Live Transcription */}
          <Text style={styles.statusPrompt}>
            {transcript || 'እያዳመጥኩ ነው... ይናገሩ (Listening... speak now)'}
          </Text>

          {/* Quick Voice Command Pills */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionTitle}>ፈጣን የድምፅ ትዕዛዞች (Quick Spoken Commands):</Text>
            <View style={styles.chipsRow}>
              {[
                { label: '🌤️ የአየር ሁኔታ (Weather)', cmd: 'የአየር ሁኔታ' },
                { label: '🌾 ማሳዎቼ (My Plots)', cmd: 'ማሳዎቼ' },
                { label: '💰 የገበያ ዋጋ (Market Prices)', cmd: 'የገበያ ዋጋ' },
                { label: '🐛 ተባይ መርምር (Diagnose Pest)', cmd: 'ተባይ መርምር' },
              ].map((chip) => (
                <Pressable
                  key={chip.cmd}
                  onPress={() => handleQuickCommand(chip.cmd)}
                  style={styles.chip}>
                  <Text style={styles.chipText}>{chip.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                stopListening();
                onClose();
              }}
              style={styles.cancelBtn}>
              <Text style={styles.cancelText}>ሰርዝ (Cancel)</Text>
            </Pressable>
            <Pressable onPress={handleFinish} style={styles.doneBtn}>
              <Text style={styles.doneText}>ጨርስ (Done)</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 45, 0.6)', // Stitch dark backdrop
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languagePill: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  micContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
  pulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(76, 175, 80, 0.3)', // Sprout green pulse ring
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primary, // Forest green
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micIcon: {
    fontSize: 32,
  },
  statusPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 22,
    minHeight: 44,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    flex: 1,
    height: TouchTargets.minimum,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  doneBtn: {
    flex: 1,
    height: TouchTargets.minimum,
    borderRadius: Radii.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
