import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { syncEngine } from '@/database/sync';

export default function FertilizerLogScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [stage, setStage] = useState<'BASAL' | 'UREA_FIRST' | 'UREA_SECOND' | 'OTHER'>('UREA_SECOND');
  const [product, setProduct] = useState<'UREA' | 'NPS' | 'DAP' | 'COMPOST'>('UREA');
  const [amountKg, setAmountKg] = useState('50');
  const [date, setDate] = useState('2024-08-20');

  const history = [
    { stage: 'BASAL', product: 'NPS', amount: '100 kg', date: '2024-07-14', status: 'COMPLETED' },
    { stage: 'UREA_FIRST', product: 'UREA', amount: '50 kg', date: '2024-08-04', status: 'COMPLETED' },
  ];

  const handleAdd = () => {
    syncEngine.enqueueOperation({
      table_name: 'fertilizer_applications',
      record_id: 'fert-' + Date.now(),
      op_type: 'CREATE',
      payload: {
        cycle_id: String(params.id || 'c-1'),
        fertilizer: product,
        stage,
        amount_kg: parseFloat(amountKg) || 0,
        application_date: date,
      },
      base_version: 0,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agronomy.fertilizer')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Completed Stage Progress */}
        <Text style={styles.sectionTitle}>Application Timeline</Text>
        {history.map((h, idx) => (
          <View key={idx} style={styles.historyCard}>
            <CheckCircle size={20} color="#16A34A" />
            <View style={styles.historyText}>
              <Text style={styles.historyTitle}>{h.stage} ({h.product})</Text>
              <Text style={styles.historySub}>{h.amount} applied on {h.date}</Text>
            </View>
          </View>
        ))}

        {/* Add Application Form */}
        <Text style={styles.sectionTitle}>Record Next Application</Text>

        <Text style={styles.label}>Application Stage</Text>
        <View style={styles.gridRow}>
          {(['BASAL', 'UREA_FIRST', 'UREA_SECOND', 'OTHER'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, stage === s && styles.activeChip]}
              onPress={() => setStage(s)}
            >
              <Text style={[styles.chipText, stage === s && styles.activeChipText]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Fertilizer Product</Text>
        <View style={styles.gridRow}>
          {(['UREA', 'NPS', 'DAP', 'COMPOST'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, product === p && styles.activeChip]}
              onPress={() => setProduct(p)}
            >
              <Text style={[styles.chipText, product === p && styles.activeChipText]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <VoiceTextInput
          label="Amount Applied (kg)"
          value={amountKg}
          onChangeText={setAmountKg}
          keyboardType="numeric"
        />

        <VoiceTextInput
          label="Date of Application"
          value={date}
          onChangeText={setDate}
        />

        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Save Fertilizer Entry</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('agronomy.fertilizer')} readAloudText={t('agronomy.fertilizer')} />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
    marginVertical: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
  historySub: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginTop: 10,
    marginBottom: 6,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeChip: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#566153',
  },
  activeChipText: {
    color: '#15803D',
  },
  addBtn: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

