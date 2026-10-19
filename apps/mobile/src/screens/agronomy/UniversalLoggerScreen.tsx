import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export type LogType =
  | 'sowing'
  | 'basal'
  | 'urea_1'
  | 'urea_2'
  | 'plowing'
  | 'weeding'
  | 'spraying'
  | 'harvest'
  | 'ledger';

export interface UniversalLoggerScreenProps {
  cycleId?: string;
  initialLogType?: LogType;
  onComplete?: () => void;
}

const LOG_TYPES: { type: LogType; label: string; icon: string }[] = [
  { type: 'urea_1', label: '1st Urea Top-Dress', icon: '⏳' },
  { type: 'urea_2', label: '2nd Urea Top-Dress', icon: '📅' },
  { type: 'basal', label: 'Basal NPS Fertilizer', icon: '🧪' },
  { type: 'sowing', label: 'Sowing Record', icon: '🌱' },
  { type: 'weeding', label: 'Weeding Event', icon: '🌿' },
  { type: 'spraying', label: 'Chemical Spray', icon: '💧' },
  { type: 'harvest', label: 'Harvest Yield', icon: '🌾' },
  { type: 'ledger', label: 'Cash Expense/Revenue', icon: '💵' },
];

export function UniversalLoggerScreen({
  initialLogType = 'urea_1',
  onComplete,
}: UniversalLoggerScreenProps) {
  const [logType, setLogType] = useState<LogType>(initialLogType);
  const [quantityKg, setQuantityKg] = useState('25');
  const [applicationDate, setApplicationDate] = useState('2026-08-15');
  const [stage, setStage] = useState('Vegetative');
  const [isSkipped, setIsSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState<'unavailable' | 'unaffordable' | 'forgot' | 'other'>('unavailable');

  const handleSave = () => {
    if (logType === 'harvest') {
      const volume = parseFloat(quantityKg) || 0;
      if (volume > 80) {
        Alert.alert(
          'Yield Plausibility Confirmation (CROP-10)',
          `The entered yield (${volume} qt/ha) exceeds the standard ceiling of 80 qt/ha. Please confirm this verified harvest volume.`,
          [
            { text: 'Edit Quantity', style: 'cancel' },
            { text: 'Confirm & Save', onPress: () => onComplete?.() },
          ]
        );
        return;
      }
    }

    Alert.alert(
      'Spoken Read-Back Confirmation',
      `Saving ${logType.toUpperCase()}: ${isSkipped ? `SKIPPED (Reason: ${skipReason})` : `${quantityKg} kg on ${applicationDate} at ${stage} stage`}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm & Save', onPress: () => onComplete?.() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Field Event Logger</Text>
        <Text style={styles.subheading}>Record yield-determining inputs and crop lifecycle milestones.</Text>

        {/* Log Type Selector Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {LOG_TYPES.map((item) => (
            <Pressable
              key={item.type}
              onPress={() => {
                setLogType(item.type);
                setIsSkipped(false);
              }}
              style={[styles.chip, logType === item.type && styles.chipActive]}>
              <Text style={styles.chipIcon}>{item.icon}</Text>
              <Text style={[styles.chipText, logType === item.type && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.card}>
          <Text style={styles.formTitle}>
            Logging: {LOG_TYPES.find((t) => t.type === logType)?.label}
          </Text>

          {/* Explicit Skip Toggle for Fertilizers (CROP-8) */}
          {(logType === 'basal' || logType === 'urea_1' || logType === 'urea_2') ? (
            <View style={styles.skipToggleRow}>
              <Text style={styles.skipLabel}>Did you skip this fertilizer application?</Text>
              <Pressable
                onPress={() => setIsSkipped(!isSkipped)}
                style={[styles.skipButton, isSkipped && styles.skipButtonActive]}>
                <Text style={[styles.skipButtonText, isSkipped && styles.skipButtonTextActive]}>
                  {isSkipped ? 'Marked as Skipped' : 'Application Applied'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {isSkipped ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reason for Skipping (CROP-8)</Text>
              <View style={styles.reasonButtonGroup}>
                {(['unavailable', 'unaffordable', 'forgot', 'other'] as const).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setSkipReason(r)}
                    style={[styles.reasonButton, skipReason === r && styles.reasonButtonActive]}>
                    <Text style={[styles.reasonText, skipReason === r && styles.reasonTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {logType === 'harvest' ? 'Harvest Volume (Quintals)' : 'Quantity Applied (kg)'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={quantityKg}
                  onChangeText={setQuantityKg}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Application / Event Date</Text>
                <TextInput
                  style={styles.input}
                  value={applicationDate}
                  onChangeText={setApplicationDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Growth Stage at Event</Text>
                <TextInput
                  style={styles.input}
                  value={stage}
                  onChangeText={setStage}
                />
              </View>
            </>
          )}

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Confirm & Save Log</Text>
          </Pressable>
        </View>
      </ScrollView>
      <VoiceAssistant />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subheading: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.three,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.two,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: Spacing.one,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.primaryText,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.three,
  },
  skipToggleRow: {
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: Radii.medium,
    marginBottom: Spacing.three,
  },
  skipLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.two,
  },
  skipButton: {
    backgroundColor: Colors.light.card,
    paddingVertical: Spacing.two,
    borderRadius: Radii.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  skipButtonActive: {
    backgroundColor: Colors.light.dangerLight,
    borderColor: Colors.light.danger,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  skipButtonTextActive: {
    color: Colors.light.danger,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  input: {
    height: TouchTargets.minimum,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  reasonButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  reasonButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.small,
    backgroundColor: Colors.light.backgroundElement,
  },
  reasonButtonActive: {
    backgroundColor: Colors.light.danger,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '600',
  },
  reasonTextActive: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    height: TouchTargets.primaryButton,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  saveButtonText: {
    color: Colors.light.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
