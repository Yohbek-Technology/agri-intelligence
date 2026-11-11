import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, Calculator } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { syncEngine } from '@/database/sync';

export default function HarvestRecordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [harvestValue, setHarvestValue] = useState('32');
  const [unit, setUnit] = useState<'QUINTAL' | 'KG'>('QUINTAL');
  const [harvestDate, setHarvestDate] = useState('2024-11-05');
  const [moisturePct, setMoisturePct] = useState('12.5');

  const plotAreaHectares = 1.0; // from plot
  const numericVal = parseFloat(harvestValue) || 0;
  const harvestKg = unit === 'QUINTAL' ? numericVal * 100 : numericVal;
  const yieldQtHa = (harvestKg / 100) / (plotAreaHectares || 1.0);

  const handleSave = () => {
    syncEngine.enqueueOperation({
      table_name: 'crop_cycles',
      record_id: String(params.id || 'c-1'),
      op_type: 'UPDATE',
      payload: {
        harvest_date: harvestDate,
        harvest_value: numericVal,
        harvest_unit: unit,
        harvest_kg: harvestKg,
        yield_qt_ha: yieldQtHa,
        grain_moisture_pct: parseFloat(moisturePct) || 0,
        status: 'HARVESTED',
      },
      base_version: 2,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agronomy.harvest')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.unitRow}>
          <View style={styles.inputBox}>
            <VoiceTextInput
              label="Harvest Amount"
              value={harvestValue}
              onChangeText={setHarvestValue}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'QUINTAL' && styles.activeUnitBtn]}
              onPress={() => setUnit('QUINTAL')}
            >
              <Text style={[styles.unitText, unit === 'QUINTAL' && styles.activeUnitText]}>
                Quintal (100 kg)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'KG' && styles.activeUnitBtn]}
              onPress={() => setUnit('KG')}
            >
              <Text style={[styles.unitText, unit === 'KG' && styles.activeUnitText]}>
                Kilograms (kg)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Computed Productivity Glance */}
        <View style={styles.computedCard}>
          <Calculator size={22} color="#16A34A" />
          <View>
            <Text style={styles.computedLabel}>Calculated Normalized Yield</Text>
            <Text style={styles.computedVal}>
              {yieldQtHa.toFixed(1)} Quintals per Hectare (qt/ha)
            </Text>
          </View>
        </View>

        <VoiceTextInput
          label="Harvest Date (YYYY-MM-DD)"
          value={harvestDate}
          onChangeText={setHarvestDate}
        />

        <VoiceTextInput
          label="Grain Moisture Percentage (%)"
          value={moisturePct}
          onChangeText={setMoisturePct}
          keyboardType="numeric"
          placeholder="e.g. 12.5"
        />

        <TouchableOpacity
          style={styles.guideLink}
          onPress={() => router.push('/support/storage-guidance')}
        >
          <BookOpen size={18} color="#16A34A" />
          <Text style={styles.guideLinkText}>
            Open Grain Moisture & PICS Storage Guide →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('agronomy.harvest')} readAloudText={t('agronomy.harvest')} />
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
  unitRow: {
    gap: 8,
  },
  inputBox: {
    flex: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  unitBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeUnitBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#566153',
  },
  activeUnitText: {
    color: '#15803D',
  },
  computedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  computedLabel: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  computedVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 2,
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  guideLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  saveBtn: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

