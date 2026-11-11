import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { syncEngine } from '@/database/sync';

type ActivityType = 'PLOWING' | 'WEEDING' | 'SPRAYING' | 'IRRIGATION';

export default function FieldActivitiesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [activity, setActivity] = useState<ActivityType>('SPRAYING');
  const [date, setDate] = useState('2024-08-15');
  const [quantity, setQuantity] = useState('2');
  const [quantityUnit, setQuantityUnit] = useState('Litre');
  const [selectedPesticide, setSelectedPesticide] = useState('Deltamethrin 2.5% EC (Approved for Adama)');

  const timeline = [
    { type: 'PLOWING', date: '2024-07-02', detail: 'Primary moldboard pass (4 hours oxen)' },
    { type: 'WEEDING', date: '2024-08-01', detail: 'Manual weeding (2 laborers, 8 hours)' },
  ];

  const handleSave = () => {
    syncEngine.enqueueOperation({
      table_name: 'farm_activities',
      record_id: 'act-' + Date.now(),
      op_type: 'CREATE',
      payload: {
        cycle_id: String(params.id || 'c-1'),
        activity,
        activity_date: date,
        quantity: parseFloat(quantity) || 0,
        quantity_unit: quantityUnit,
        pesticide_id: activity === 'SPRAYING' ? 'pest-delta-1' : undefined,
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
        <Text style={styles.headerTitle}>{t('agronomy.activities')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Recorded Activities</Text>
        {timeline.map((act, idx) => (
          <View key={idx} style={styles.historyCard}>
            <View style={styles.historyTop}>
              <Text style={styles.historyType}>{act.type}</Text>
              <Text style={styles.historyDate}>{act.date}</Text>
            </View>
            <Text style={styles.historyDetail}>{act.detail}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Log New Activity</Text>
        <View style={styles.activityGrid}>
          {(['PLOWING', 'WEEDING', 'SPRAYING', 'IRRIGATION'] as const).map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.activityBtn, activity === a && styles.activeActivityBtn]}
              onPress={() => setActivity(a)}
            >
              <Text style={[styles.activityText, activity === a && styles.activeActivityText]}>
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <VoiceTextInput
          label="Activity Date"
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.quantityRow}>
          <View style={styles.quantityInput}>
            <VoiceTextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.quantityUnitInput}>
            <VoiceTextInput
              label="Unit (litre / hour / pass)"
              value={quantityUnit}
              onChangeText={setQuantityUnit}
            />
          </View>
        </View>

        {activity === 'SPRAYING' && (
          <View style={styles.pesticideBox}>
            <View style={styles.pesticideHeader}>
              <ShieldCheck size={18} color="#16A34A" />
              <Text style={styles.pesticideTitle}>Locally Available & Registered Agrochemical</Text>
            </View>
            <Text style={styles.pesticideValue}>{selectedPesticide}</Text>
            <Text style={styles.washoffNotice}>
              Rain-free window: 4 hours required after application.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('agronomy.activities')} readAloudText={t('agronomy.activities')} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 8,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  historyDate: {
    fontSize: 12,
    color: '#71717A',
  },
  historyDetail: {
    fontSize: 13,
    color: '#374151',
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  activityBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeActivityBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  activityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#566153',
  },
  activeActivityText: {
    color: '#15803D',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quantityInput: {
    flex: 1,
  },
  quantityUnitInput: {
    flex: 2,
  },
  pesticideBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
    gap: 4,
  },
  pesticideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pesticideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  pesticideValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#151A14',
    marginTop: 2,
  },
  washoffNotice: {
    fontSize: 11,
    color: '#166534',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

