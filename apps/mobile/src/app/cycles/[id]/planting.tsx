import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { syncEngine } from '@/database/sync';

export default function PlantingRecordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [plantingDate, setPlantingDate] = useState('2024-07-14');
  const [seedType, setSeedType] = useState('Kakaba Certified Seed');
  const [seedSource, setSeedSource] = useState<'COOPERATIVE' | 'MARKET' | 'SAVED' | 'OTHER'>('COOPERATIVE');
  const [seedAmountKg, setSeedAmountKg] = useState('120');

  const recommendedRateKg = 100; // Benchmark for 1 ha wheat
  const numericAmount = parseFloat(seedAmountKg) || 0;
  const isHighDeviation = numericAmount > recommendedRateKg * 1.3 || numericAmount < recommendedRateKg * 0.7;

  const handleSave = () => {
    syncEngine.enqueueOperation({
      table_name: 'crop_cycles',
      record_id: String(params.id || 'c-1'),
      op_type: 'UPDATE',
      payload: {
        planting_date: plantingDate,
        seed_type: seedType,
        seed_source: seedSource,
        seed_amount_kg: numericAmount,
      },
      base_version: 1,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agronomy.planting')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VoiceTextInput
          label="Planting Date (YYYY-MM-DD)"
          value={plantingDate}
          onChangeText={setPlantingDate}
          placeholder="2024-07-14"
        />

        <VoiceTextInput
          label="Seed Variety / Type"
          value={seedType}
          onChangeText={setSeedType}
          placeholder="e.g. Kakaba Certified Grade 1"
        />

        {/* Seed Source Toggle */}
        <Text style={styles.sectionLabel}>Seed Source</Text>
        <View style={styles.sourceGrid}>
          {(['COOPERATIVE', 'MARKET', 'SAVED', 'OTHER'] as const).map((src) => (
            <TouchableOpacity
              key={src}
              style={[styles.sourceBtn, seedSource === src && styles.activeSourceBtn]}
              onPress={() => setSeedSource(src)}
            >
              <Text style={[styles.sourceText, seedSource === src && styles.activeSourceText]}>
                {src}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <VoiceTextInput
          label="Seed Quantity (Kilograms)"
          value={seedAmountKg}
          onChangeText={setSeedAmountKg}
          placeholder="100"
          keyboardType="numeric"
        />

        {/* Rate Deviation Warning Banner (FR-MOB-039) */}
        {isHighDeviation && (
          <View style={styles.warningBox}>
            <AlertTriangle size={20} color="#C78326" />
            <Text style={styles.warningText}>
              Warning: {numericAmount} kg deviates strongly from the recommended rate ({recommendedRateKg} kg/ha). Over-seeding increases lodging risk.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('agronomy.planting')} readAloudText={t('agronomy.planting')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  scroll: {
    padding: 16,
    paddingBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 12,
    marginBottom: 6,
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  sourceBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  activeSourceBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#566153',
  },
  activeSourceText: {
    color: '#15803D',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginVertical: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

