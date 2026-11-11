import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { AlertCircle, Volume2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation, LanguageCode } from '@/i18n';
import { tokens } from '@/theme/tokens';

interface ConfirmSpokenProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const langToSpeechLocale: Record<LanguageCode, string> = {
  en: 'en-US',
  am: 'am-ET',
  om: 'om-ET',
  ti: 'ti-ET',
};

export function ConfirmSpoken({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
}: ConfirmSpokenProps) {
  const { language, t } = useTranslation();

  useEffect(() => {
    if (visible) {
      try {
        Speech.speak(`${title}. ${message}`, {
          language: langToSpeechLocale[language] || 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      } catch {
        // Fallback
      }
    } else {
      Speech.stop();
    }
  }, [visible, title, message, language]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <AlertCircle size={36} color="#DC2626" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {/* Yes / Confirm button */}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>
                {confirmLabel || t('common.yes')}
              </Text>
            </TouchableOpacity>

            {/* No / Cancel button */}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>
                {cancelLabel || t('common.no')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#151A14',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#566153',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    minHeight: tokens.touchTarget.min,
    borderRadius: tokens.touchTarget.min / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: '#F0ECE1',
  },
  cancelText: {
    color: '#151A14',
    fontSize: 17,
    fontWeight: '700',
  },
});

