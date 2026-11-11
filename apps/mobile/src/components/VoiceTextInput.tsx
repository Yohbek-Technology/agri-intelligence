import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { tokens } from '@/theme/tokens';

interface VoiceTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}

export function VoiceTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: VoiceTextInputProps) {
  const { t } = useTranslation();
  const [isDictating, setIsDictating] = useState<boolean>(false);

  const handleMicPress = () => {
    setIsDictating(!isDictating);
    // When integrated with speech-to-text driver, dictation updates onChangeText
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, multiline && styles.multilineWrapper]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          multiline={multiline}
        />
        <TouchableOpacity
          style={[styles.micButton, isDictating && styles.activeMic]}
          onPress={handleMicPress}
          activeOpacity={0.7}
          accessibilityLabel={t('common.tapToSpeak')}
        >
          {isDictating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Mic size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: tokens.touchTarget.min,
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#151A14',
    paddingVertical: 8,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  micButton: {
    width: tokens.touchTarget.min,
    height: tokens.touchTarget.min,
    borderRadius: tokens.touchTarget.min / 2,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeMic: {
    backgroundColor: '#DC2626',
  },
});

