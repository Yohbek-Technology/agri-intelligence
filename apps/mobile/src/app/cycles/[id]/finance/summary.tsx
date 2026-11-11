import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';

export default function CycleFinancialSummaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const totalIncome = 38400;
  const totalExpenses = 7500;
  const netProfit = totalIncome - totalExpenses;
  const isProfit = netProfit >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agronomy.financialSummary')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Net Profit / Loss Hero Card */}
        <View style={[styles.heroCard, isProfit ? styles.profitHero : styles.lossHero]}>
          <Text style={styles.heroSubLabel}>
            {isProfit ? 'Net Season Profit' : 'Net Season Loss'}
          </Text>
          <Text style={[styles.heroAmount, isProfit ? styles.profitText : styles.lossText]}>
            {isProfit ? '+' : ''}{netProfit.toLocaleString()} ETB
          </Text>
          <Text style={styles.heroPlotText}>
            Wheat (Kakaba) • 1.00 Hectare • 2024 Meher
          </Text>
        </View>

        {/* Income vs Expenses Two Columns */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <TrendingUp size={20} color="#16A34A" />
              <Text style={styles.metricTitle}>Gross Income</Text>
            </View>
            <Text style={styles.incomeAmount}>+{totalIncome.toLocaleString()} ETB</Text>
            <Text style={styles.metricSub}>32 quintals grain sold</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <TrendingDown size={20} color="#DC2626" />
              <Text style={styles.metricTitle}>Total Costs</Text>
            </View>
            <Text style={styles.expenseAmount}>-{totalExpenses.toLocaleString()} ETB</Text>
            <Text style={styles.metricSub}>Seed, fertilizer, labor</Text>
          </View>
        </View>

        {/* Visual Bar Ratio */}
        <View style={styles.barCard}>
          <Text style={styles.barTitle}>Expense-to-Income Ratio</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barIncomeFill,
                { width: `${Math.round((totalIncome / (totalIncome + totalExpenses)) * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.barLegend}>
            <Text style={styles.legendIncome}>Income: 83.6%</Text>
            <Text style={styles.legendExpense}>Expenses: 16.4%</Text>
          </View>
        </View>
      </ScrollView>
      <VoiceBar
        title={t('agronomy.financialSummary')}
        readAloudText={`Net Profit: ${netProfit} Ethiopian Birr. Gross income: ${totalIncome} Birr. Total expenses: ${totalExpenses} Birr.`}
      />
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
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    elevation: 3,
  },
  profitHero: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  lossHero: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  heroSubLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#566153',
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 8,
  },
  profitText: {
    color: '#15803D',
  },
  lossText: {
    color: '#DC2626',
  },
  heroPlotText: {
    fontSize: 13,
    color: '#566153',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  incomeAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16A34A',
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#DC2626',
  },
  metricSub: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 4,
  },
  barCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 16,
  },
  barTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 10,
  },
  barTrack: {
    height: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barIncomeFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendIncome: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  legendExpense: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});

