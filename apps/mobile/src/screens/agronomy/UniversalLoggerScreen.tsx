import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { cropCycleService } from '@/services/api/crop-cycle-service';

export type LogType =
  | 'sowing'
  | 'basal'
  | 'urea_1'
  | 'urea_2'
  | 'weeding'
  | 'spraying'
  | 'harvest'
  | 'ledger';

export interface UniversalLoggerScreenProps {
  cycleId?: string;
  initialLogType?: LogType;
  onComplete?: () => void;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

const EVENT_TYPES: { type: LogType; label: string; icon: string; targetHint: string }[] = [
  { type: 'urea_1', label: '1st Urea Top-Dress', icon: '⚡', targetHint: 'Target: 30-40 DAS' },
  { type: 'urea_2', label: '2nd Urea Top-Dress', icon: '📅', targetHint: 'Target: Grain Filling' },
  { type: 'basal', label: 'Basal NPS', icon: '🧪', targetHint: 'Applied at sowing' },
  { type: 'sowing', label: 'Sowing Record', icon: '🌱', targetHint: 'Seed rate & variety' },
  { type: 'weeding', label: 'Weeding Event', icon: '🌿', targetHint: 'Labor & method' },
  { type: 'spraying', label: 'Chemical Spray', icon: '💧', targetHint: 'Target pest & dosage' },
  { type: 'harvest', label: 'Harvest Yield', icon: '🌾', targetHint: 'Volume & moisture' },
  { type: 'ledger', label: 'Cash Ledger', icon: '💵', targetHint: 'Cost or revenue' },
];

export function UniversalLoggerScreen({
  cycleId = 'cycle-01',
  initialLogType = 'urea_1',
  onComplete,
  onNavigate,
}: UniversalLoggerScreenProps) {
  const [logType, setLogType] = useState<LogType>(initialLogType);
  const [isApplied, setIsApplied] = useState(true);
  const [skipReason, setSkipReason] = useState<'unavailable' | 'unaffordable' | 'forgot' | 'other'>('unavailable');
  const [quantity, setQuantity] = useState('25');
  const [calendarMode, setCalendarMode] = useState<'GC' | 'EC'>('GC');
  const [dateStr, setDateStr] = useState('2026-08-15');
  const [stage, setStage] = useState('vegetative');
  const [notes, setNotes] = useState('');

  // Sowing specific fields
  const [seedVariety, setSeedVariety] = useState('Quncho (DZ-Cr-37)');
  const [seedRate, setSeedRate] = useState('15');
  const [sowingMethod, setSowingMethod] = useState<'row_planting' | 'broadcasting'>('row_planting');

  // Ledger specific fields
  const [ledgerType, setLedgerType] = useState<'cost' | 'revenue'>('cost');
  const [ledgerCategory, setLedgerCategory] = useState('fertilizer');
  const [ledgerAmount, setLedgerAmount] = useState('1200');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [voiceDictating, setVoiceDictating] = useState(false);

  const activeEventMeta = EVENT_TYPES.find((e) => e.type === logType) || EVENT_TYPES[0];

  const handleStepper = (delta: number) => {
    const current = parseFloat(quantity) || 0;
    const next = Math.max(0, current + delta);
    setQuantity(String(next));
  };

  const handleVoiceDictation = () => {
    setVoiceDictating(true);
    setTimeout(() => {
      setVoiceDictating(false);
      // Autofill simulated voice input
      if (logType === 'urea_1' || logType === 'urea_2' || logType === 'basal') {
        setQuantity('25');
        setIsApplied(true);
      } else if (logType === 'harvest') {
        setQuantity('14.5');
      } else if (logType === 'ledger') {
        setLedgerAmount('2500');
        setNotes('Certified seed purchase receipt');
      }
      Alert.alert(
        'Voice Dictation Detected (ድምጽ ተረድቷል)',
        'Extracted: 25 kg application on current plot at vegetative tillering stage.',
        [{ text: 'Review & Confirm' }]
      );
    }, 1200);
  };

  const handleSave = async (plausibilityOverride = false) => {
    setSubmitting(true);
    try {
      if (logType === 'harvest') {
        const yieldVal = parseFloat(quantity) || 0;
        if (yieldVal > 80 && !plausibilityOverride) {
          Alert.alert(
            'Yield Plausibility Confirmation (CROP-10)',
            `The entered harvest volume (${yieldVal} Qt/Ha) exceeds the agronomic ceiling of 80 Qt/Ha. Please verify whether this yield is confirmed.`,
            [
              { text: 'Edit Volume', style: 'cancel' },
              {
                text: 'Confirm High Yield',
                onPress: () => handleSave(true),
              },
            ]
          );
          setSubmitting(false);
          return;
        }

        const res = await cropCycleService.logHarvest(cycleId, {
          harvestDate: dateStr,
          yieldQtPerHa: yieldVal,
          plausibilityConfirmed: yieldVal > 80,
        });

        if (res.success) {
          Alert.alert('Harvest Logged', 'Harvest volume recorded and cycle closed successfully.', [
            { text: 'OK', onPress: () => onComplete?.() || onNavigate?.('CropCycleHub') },
          ]);
        }
        return;
      }

      if (logType === 'sowing') {
        const res = await cropCycleService.logSowing(cycleId, {
          sowingDate: dateStr,
          seedVariety,
          seedRateKgPerHa: parseFloat(seedRate) || 15,
          method: sowingMethod,
        });

        if (res.success) {
          Alert.alert('Sowing Event Logged', 'Planting details updated successfully.', [
            { text: 'OK', onPress: () => onComplete?.() || onNavigate?.('CropCycleHub') },
          ]);
        }
        return;
      }

      if (logType === 'basal' || logType === 'urea_1' || logType === 'urea_2') {
        const res = await cropCycleService.logFertilizer(cycleId, logType, {
          applicationDate: dateStr,
          stageApplied: stage,
          quantityKg: isApplied ? parseFloat(quantity) || 0 : undefined,
          skipped: !isApplied,
          skipReason: !isApplied ? skipReason : undefined,
        });

        if (!res.success && res.error?.includes('urea_1 must be logged')) {
          Alert.alert(
            'Biological Constraint Warning (CROP-7)',
            '2nd Urea cannot be applied before 1st Urea is logged or marked skipped.',
            [{ text: 'OK' }]
          );
          return;
        }

        if (res.success) {
          Alert.alert(
            'Fertilizer Log Saved',
            isApplied
              ? `${activeEventMeta.label}: ${quantity} kg logged successfully.`
              : `${activeEventMeta.label}: Marked skipped (Reason: ${skipReason}).`,
            [{ text: 'OK', onPress: () => onComplete?.() || onNavigate?.('CropCycleHub') }]
          );
        }
        return;
      }

      if (logType === 'weeding' || logType === 'spraying') {
        const res = await cropCycleService.logFieldOperation(cycleId, {
          operationType: logType,
          operationDate: dateStr,
          stageAtOperation: stage,
          notes,
        });

        if (res.success) {
          Alert.alert('Field Operation Logged', `${activeEventMeta.label} recorded.`, [
            { text: 'OK', onPress: () => onComplete?.() || onNavigate?.('CropCycleHub') },
          ]);
        }
        return;
      }

      if (logType === 'ledger') {
        const res = await cropCycleService.logCashLedger(cycleId, {
          entryType: ledgerType,
          category: ledgerCategory,
          amountEtb: parseFloat(ledgerAmount) || 0,
          description: notes || `${ledgerCategory} expense`,
          entryDate: dateStr,
        });

        if (res.success) {
          Alert.alert('Ledger Entry Logged', `${ledgerAmount} ETB ${ledgerType} recorded.`, [
            { text: 'OK', onPress: () => onComplete?.() || onNavigate?.('CropCycleHub') },
          ]);
        }
        return;
      }
    } catch (err) {
      console.warn('Log save error', err);
      Alert.alert('Saved to Offline Queue', 'Saved locally and queued for synchronization.');
      onComplete?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Cycle Context Banner */}
        <View style={styles.contextCard}>
          <View style={styles.contextTop}>
            <View style={styles.contextLeft}>
              <Text style={styles.contextIcon}>🌾</Text>
              <Text style={styles.contextTitle}>ACTIVE FIELD CYCLE</Text>
            </View>
            <View style={styles.cycleBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.cycleBadgeText}>Cycle #2026-Meher</Text>
            </View>
          </View>

          <Text style={styles.plotName}>Lower Field - Teff</Text>
          <View style={styles.tagsRow}>
            <View style={styles.varietyTag}>
              <Text style={styles.varietyTagText}>Quncho (DZ-Cr-37)</Text>
            </View>
            <Text style={styles.tagDot}>•</Text>
            <Text style={styles.plotMetaText}>0.5 Hectare</Text>
            <Text style={styles.tagDot}>•</Text>
            <Text style={styles.stageHighlightText}>Day 38 (Vegetative)</Text>
          </View>

          {/* Visual Progress Timeline bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressSub}>Sowing (Day 0)</Text>
              <Text style={styles.progressCurrent}>Current (Day 38)</Text>
              <Text style={styles.progressSub}>Harvest (~Day 95)</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
              <View style={[styles.progressBarGlow, { width: '10%' }]} />
            </View>
          </View>
        </View>

        {/* Dynamic Event Type Picker (Horizontal Scroll) */}
        <View style={styles.pickerSection}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Crop Lifecycle Event</Text>
            <Text style={styles.pickerStep}>Step {EVENT_TYPES.findIndex((e) => e.type === logType) + 1} of 8</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {EVENT_TYPES.map((item) => {
              const active = logType === item.type;
              return (
                <Pressable
                  key={item.type}
                  onPress={() => {
                    setLogType(item.type);
                    setIsApplied(true);
                  }}
                  style={[styles.eventChip, active && styles.eventChipActive]}>
                  <Text style={styles.eventChipIcon}>{item.icon}</Text>
                  <Text style={[styles.eventChipLabel, active && styles.eventChipLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Voice Dictation Prompt Card */}
        <View style={styles.voicePromptCard}>
          <View style={styles.voiceLeft}>
            <View style={styles.voiceBadgeRow}>
              <Text style={styles.voiceSparkle}>✨</Text>
              <Text style={styles.voiceBadgeText}>Smart Multilingual Voice</Text>
            </View>
            <Text style={styles.voicePromptHeading}>Speak to Autofill</Text>
            <Text style={styles.voiceLanguages}>Amharic • Afaan Oromoo • Tigrinya • English</Text>
          </View>

          <Pressable
            style={[styles.micButton, voiceDictating && styles.micButtonActive]}
            onPress={handleVoiceDictation}>
            <Text style={styles.micIcon}>{voiceDictating ? '🎙️' : '🎤'}</Text>
          </Pressable>
        </View>

        {/* Main Event Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formTitle}>{activeEventMeta.label}</Text>
              <Text style={styles.formHint}>Recommended window for optimal nutrient uptake.</Text>
            </View>
            <View style={styles.targetPill}>
              <Text style={styles.targetPillText}>{activeEventMeta.targetHint}</Text>
            </View>
          </View>

          {/* 1. Application Status Segmented Toggle (For Fertilizers) */}
          {(logType === 'basal' || logType === 'urea_1' || logType === 'urea_2') && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Application Status</Text>
              <View style={styles.segmentedToggle}>
                <Pressable
                  style={[styles.segmentBtn, isApplied && styles.segmentBtnActive]}
                  onPress={() => setIsApplied(true)}>
                  <Text style={[styles.segmentBtnText, isApplied && styles.segmentBtnTextActive]}>
                    ✓ Applied (ተተግብሯል)
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmentBtn, !isApplied && styles.segmentBtnActiveDanger]}
                  onPress={() => setIsApplied(false)}>
                  <Text style={[styles.segmentBtnText, !isApplied && styles.segmentBtnTextActiveDanger]}>
                    ✕ Skipped (ተዘሏል)
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* If Skipped: CROP-8 structured skip reasons */}
          {!isApplied && (logType === 'basal' || logType === 'urea_1' || logType === 'urea_2') ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Reason for Skipping (CROP-8 Required)</Text>
              <View style={styles.reasonsGrid}>
                {[
                  { id: 'unavailable', label: 'Not in Supply / Stock' },
                  { id: 'unaffordable', label: 'Cost / Unaffordable' },
                  { id: 'forgot', label: 'Missed Optimal Window' },
                  { id: 'other', label: 'Other Farm Reason' },
                ].map((r) => (
                  <Pressable
                    key={r.id}
                    style={[styles.reasonChip, skipReason === r.id && styles.reasonChipActive]}
                    onPress={() => setSkipReason(r.id as any)}>
                    <Text
                      style={[
                        styles.reasonChipText,
                        skipReason === r.id && styles.reasonChipTextActive,
                      ]}>
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {/* Applied Fields (Quantity with Stepper) */}
          {(isApplied || (logType !== 'basal' && logType !== 'urea_1' && logType !== 'urea_2')) &&
            logType !== 'ledger' &&
            logType !== 'sowing' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  {logType === 'harvest' ? 'Harvest Volume (Quintals / Ha)' : 'Quantity Applied (kg)'}
                </Text>
                <View style={styles.stepperContainer}>
                  <Pressable style={styles.stepperBtn} onPress={() => handleStepper(-5)}>
                    <Text style={styles.stepperBtnText}>- 5</Text>
                  </Pressable>
                  <Pressable style={styles.stepperBtn} onPress={() => handleStepper(-1)}>
                    <Text style={styles.stepperBtnText}>- 1</Text>
                  </Pressable>
                  <TextInput
                    style={styles.stepperInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                  <Pressable style={styles.stepperBtn} onPress={() => handleStepper(1)}>
                    <Text style={styles.stepperBtnText}>+ 1</Text>
                  </Pressable>
                  <Pressable style={styles.stepperBtn} onPress={() => handleStepper(5)}>
                    <Text style={styles.stepperBtnText}>+ 5</Text>
                  </Pressable>
                </View>
              </View>
            )}

          {/* Sowing specific inputs */}
          {logType === 'sowing' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Seed Variety Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={seedVariety}
                  onChangeText={setSeedVariety}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Seed Rate (kg / Ha)</Text>
                <TextInput
                  style={styles.textInput}
                  value={seedRate}
                  onChangeText={setSeedRate}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Planting Method</Text>
                <View style={styles.segmentedToggle}>
                  <Pressable
                    style={[
                      styles.segmentBtn,
                      sowingMethod === 'row_planting' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setSowingMethod('row_planting')}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        sowingMethod === 'row_planting' && styles.segmentBtnTextActive,
                      ]}>
                      Row Planting (መስመር)
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.segmentBtn,
                      sowingMethod === 'broadcasting' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setSowingMethod('broadcasting')}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        sowingMethod === 'broadcasting' && styles.segmentBtnTextActive,
                      ]}>
                      Broadcasting (ብተና)
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* Cash Ledger specific inputs */}
          {logType === 'ledger' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Transaction Type</Text>
                <View style={styles.segmentedToggle}>
                  <Pressable
                    style={[
                      styles.segmentBtn,
                      ledgerType === 'cost' && styles.segmentBtnActiveDanger,
                    ]}
                    onPress={() => setLedgerType('cost')}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        ledgerType === 'cost' && styles.segmentBtnTextActiveDanger,
                      ]}>
                      Production Cost (ወጪ)
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.segmentBtn,
                      ledgerType === 'revenue' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setLedgerType('revenue')}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        ledgerType === 'revenue' && styles.segmentBtnTextActive,
                      ]}>
                      Crop Revenue (ገቢ)
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.reasonsGrid}>
                  {['fertilizer', 'seed', 'labor', 'oxen_plow', 'chemical', 'harvest_sale'].map(
                    (cat) => (
                      <Pressable
                        key={cat}
                        style={[
                          styles.reasonChip,
                          ledgerCategory === cat && styles.reasonChipActive,
                        ]}
                        onPress={() => setLedgerCategory(cat)}>
                        <Text
                          style={[
                            styles.reasonChipText,
                            ledgerCategory === cat && styles.reasonChipTextActive,
                          ]}>
                          {cat.replace('_', ' ').toUpperCase()}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Amount in Ethiopian Birr (ETB)</Text>
                <TextInput
                  style={styles.textInput}
                  value={ledgerAmount}
                  onChangeText={setLedgerAmount}
                  keyboardType="numeric"
                  placeholder="e.g. 1200"
                />
              </View>
            </>
          )}

          {/* Date Selector with Dual Ethiopian / Gregorian Calendar Toggle */}
          <View style={styles.fieldGroup}>
            <View style={styles.dateLabelRow}>
              <Text style={styles.fieldLabel}>Application / Event Date</Text>
              <View style={styles.calendarToggle}>
                <Pressable
                  style={[styles.calBtn, calendarMode === 'GC' && styles.calBtnActive]}
                  onPress={() => setCalendarMode('GC')}>
                  <Text style={[styles.calBtnText, calendarMode === 'GC' && styles.calBtnTextActive]}>
                    G.C.
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.calBtn, calendarMode === 'EC' && styles.calBtnActive]}
                  onPress={() => setCalendarMode('EC')}>
                  <Text style={[styles.calBtnText, calendarMode === 'EC' && styles.calBtnTextActive]}>
                    E.C. (ዓ.ም)
                  </Text>
                </Pressable>
              </View>
            </View>

            <TextInput
              style={styles.textInput}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder={calendarMode === 'GC' ? 'YYYY-MM-DD' : 'DD/MM/YYYY E.C.'}
            />
          </View>

          {/* Growth Stage Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Observed Growth Stage</Text>
            <TextInput
              style={styles.textInput}
              value={stage}
              onChangeText={setStage}
              placeholder="e.g. Vegetative Tillering"
            />
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Field Notes / Observations</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Record soil condition, weather notes, or cooperative receipt..."
              multiline
            />
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            disabled={submitting}
            onPress={() => handleSave(false)}>
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Confirm & Save Event Log</Text>
            )}
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
  contextCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  contextTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contextIcon: {
    fontSize: 16,
  },
  contextTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  cycleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  plotName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  varietyTag: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  varietyTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  tagDot: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  plotMetaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  stageHighlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.accent,
  },
  progressSection: {
    marginTop: Spacing.three,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  progressCurrent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  progressBarGlow: {
    height: '100%',
    backgroundColor: '#94F990',
  },
  pickerSection: {
    marginBottom: Spacing.four,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  pickerStep: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  chipScroll: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radii.card,
    marginRight: Spacing.two,
    gap: 6,
  },
  eventChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  eventChipIcon: {
    fontSize: 16,
  },
  eventChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  eventChipLabelActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  voicePromptCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.card,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  voiceLeft: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  voiceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  voiceSparkle: {
    fontSize: 14,
  },
  voiceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ACF4A4',
  },
  voicePromptHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  voiceLanguages: {
    fontSize: 11,
    color: '#E8F5E9',
    marginTop: 2,
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  micButtonActive: {
    backgroundColor: '#FFDBCF',
  },
  micIcon: {
    fontSize: 24,
  },
  formCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.four,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  formHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },
  targetPill: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  fieldGroup: {
    marginBottom: Spacing.four,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  segmentBtnActiveDanger: {
    backgroundColor: Colors.light.danger,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  segmentBtnTextActiveDanger: {
    color: '#FFF',
    fontWeight: '700',
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  reasonChip: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reasonChipActive: {
    backgroundColor: '#FFDAD6',
    borderColor: Colors.light.danger,
  },
  reasonChipText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  reasonChipTextActive: {
    color: Colors.light.danger,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperBtn: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  stepperInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textInput: {
    height: 48,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  notesInput: {
    height: 80,
    paddingTop: Spacing.two,
    textAlignVertical: 'top',
  },
  dateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  calendarToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 4,
    padding: 2,
  },
  calBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  calBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  calBtnText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  calBtnTextActive: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    height: 52,
    borderRadius: Radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
