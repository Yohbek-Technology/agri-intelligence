import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Square, Send, CheckCircle } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { audioService } from '@/services/audio';

type GrievanceCategory =
  | 'FERTILIZER_SHORTAGE'
  | 'SEED_SHORTAGE'
  | 'PEST_OUTBREAK'
  | 'WATER_CONFLICT'
  | 'ADULTERATED_INPUT'
  | 'OTHER';

export default function VoiceBoxScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GrievanceCategory>('FERTILIZER_SHORTAGE');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories: { key: GrievanceCategory; label: string }[] = [
    { key: 'FERTILIZER_SHORTAGE', label: t('voiceBox.fertilizerShortage') },
    { key: 'SEED_SHORTAGE', label: t('voiceBox.seedShortage') },
    { key: 'PEST_OUTBREAK', label: t('voiceBox.pestOutbreak') },
    { key: 'WATER_CONFLICT', label: t('voiceBox.waterConflict') },
    { key: 'ADULTERATED_INPUT', label: t('voiceBox.adulteratedInput') },
    { key: 'OTHER', label: t('voiceBox.other') },
  ];

  const handleToggleRecord = async () => {
    if (isRecording) {
      const uri = await audioService.stopRecording();
      setIsRecording(false);
      setRecordedUri(uri);
      setTranscript('Urea fertilizer allocation for Boku Shenen cooperative is missing 2 quintals.');
    } else {
      await audioService.startRecording();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        router.push('/grievances');
      }, 1200);
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('voiceBox.recordComplaint')}</Text>
        <Text style={styles.subtitle}>
          Speak clearly in your language. Your message is delivered to the City Agriculture Office & your DA.
        </Text>
      </View>

      {/* Big Audio Record Button */}
      <View style={styles.recordSection}>
        <TouchableOpacity
          style={[styles.bigMicButton, isRecording && styles.recordingButton]}
          onPress={handleToggleRecord}
          activeOpacity={0.8}
        >
          {isRecording ? (
            <Square size={44} color="#FFFFFF" />
          ) : (
            <Mic size={48} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        <Text style={styles.recordStatusText}>
          {isRecording ? t('voiceBox.recording') : t('voiceBox.holdToRecord')}
        </Text>
      </View>

      {/* Category Chips */}
      <Text style={styles.sectionLabel}>{t('voiceBox.category')}</Text>
      <View style={styles.chipsContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.chip, selectedCategory === cat.key && styles.selectedChip]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.key && styles.selectedChipText,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Editable Speech-to-Text Transcript */}
      <VoiceTextInput
        label="Speech Transcript (Editable)"
        value={transcript}
        onChangeText={setTranscript}
        placeholder="Audio transcript will appear here, or type your complaint directly..."
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (!transcript && !recordedUri) && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={(!transcript && !recordedUri) || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : submitted ? (
          <View style={styles.buttonInner}>
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.submitText}>Submitted Successfully</Text>
          </View>
        ) : (
          <View style={styles.buttonInner}>
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitText}>{t('common.submit')}</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 14,
    color: '#566153',
    marginTop: 4,
    lineHeight: 20,
  },
  recordSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bigMicButton: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordingButton: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  recordStatusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedChip: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#566153',
  },
  selectedChipText: {
    color: '#15803D',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

