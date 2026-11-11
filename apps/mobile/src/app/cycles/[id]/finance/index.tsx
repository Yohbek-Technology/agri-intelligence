import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { VoiceTextInput } from '@/components/VoiceTextInput';
import { syncEngine } from '@/database/sync';

type TxnCategory = 'SEED' | 'FERTILIZER' | 'LABOR' | 'EQUIPMENT_RENTAL' | 'OTHER_EXPENSE' | 'CROP_SALE';

export default function CostsIncomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [category, setCategory] = useState<TxnCategory>('FERTILIZER');
  const [amountEtb, setAmountEtb] = useState('3200');
  const [description, setDescription] = useState('NPS fertilizer purchase from cooperative');
  const [date, setDate] = useState('2024-07-10');

  const transactions = [
    { id: '1', category: 'SEED', amount: '2400 ETB', isIncome: false, date: '2024-07-12', desc: 'Kakaba seed' },
    { id: '2', category: 'FERTILIZER', amount: '3600 ETB', isIncome: false, date: '2024-07-14', desc: 'NPS & Urea' },
    { id: '3', category: 'LABOR', amount: '1500 ETB', isIncome: false, date: '2024-08-01', desc: 'Weeding labor' },
    { id: '4', category: 'CROP_SALE', amount: '38400 ETB', isIncome: true, date: '2024-11-10', desc: '32 qt sold to union' },
  ];

  const handleAddTxn = () => {
    const isIncome = category === 'CROP_SALE';
    syncEngine.enqueueOperation({
      table_name: 'farm_transactions',
      record_id: 'txn-' + Date.now(),
      op_type: 'CREATE',
      payload: {
        cycle_id: String(params.id || 'c-1'),
        category,
        is_income: isIncome,
        amount_etb: parseFloat(amountEtb) || 0,
        txn_date: date,
        description,
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
        <Text style={styles.headerTitle}>{t('agronomy.costsIncome')}</Text>
        <TouchableOpacity onPress={() => router.push(`/cycles/${params.id || 'c-1'}/finance/summary` as any)}>
          <Text style={styles.summaryLink}>Summary →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txnCard}>
            <View style={styles.txnLeft}>
              {tx.isIncome ? (
                <TrendingUp size={22} color="#16A34A" />
              ) : (
                <TrendingDown size={22} color="#DC2626" />
              )}
              <View>
                <Text style={styles.txnDesc}>{tx.desc}</Text>
                <Text style={styles.txnSub}>{tx.category} • {tx.date}</Text>
              </View>
            </View>
            <Text style={[styles.txnAmount, tx.isIncome ? styles.incomeText : styles.expenseText]}>
              {tx.isIncome ? '+' : '-'}{tx.amount}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Add Ledger Entry</Text>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {(['SEED', 'FERTILIZER', 'LABOR', 'EQUIPMENT_RENTAL', 'OTHER_EXPENSE', 'CROP_SALE'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, category === cat && styles.activeCatBtn]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <VoiceTextInput
          label="Amount in ETB"
          value={amountEtb}
          onChangeText={setAmountEtb}
          keyboardType="numeric"
        />

        <VoiceTextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleAddTxn}>
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <VoiceBar title={t('agronomy.costsIncome')} readAloudText={t('agronomy.costsIncome')} />
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
    justifyContent: 'space-between',
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
  summaryLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
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
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 8,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txnDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
  txnSub: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  incomeText: {
    color: '#16A34A',
  },
  expenseText: {
    color: '#DC2626',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  catBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeCatBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  catText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#566153',
  },
  activeCatText: {
    color: '#15803D',
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

