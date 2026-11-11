import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, Volume2, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { audioService } from '@/services/audio';

export default function YieldGapResultScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const params = useLocalSearchParams();

  const ownYield = 32.0;
  const peerMedian = 34.5;
  const topQuartile = 42.0;
  const gapPct = -23.8; // gap vs top quartile

  const candidateCauses = [
    {
      title: 'Urea Top-Dressing Split Timing',
      impact: '-4.5 qt/ha',
      severity: 'HIGH',
      description: 'Second Urea application was delayed by 14 days after stem elongation, missing peak nitrogen uptake.',
    },
    {
      title: 'Weed Competition & Delayed Weeding',
      impact: '-3.2 qt/ha',
      severity: 'MEDIUM',
      description: 'First weeding occurred at 38 days after planting instead of the recommended 25-30 day window.',
    },
    {
      title: 'Sowing Date Relative to Rain Onset',
      impact: '-2.0 qt/ha',
      severity: 'LOW',
      description: 'Planted 6 days after initial Meher onset, slightly reducing early tillering vigor.',
    },
  ];

  const handleReadAloud = () => {
    audioService.speak(
      `Agronomic Yield Gap Analysis: Your plot achieved 32 quintals per hectare. Top producers in Adama Black Vertisol achieved 42 quintals. The primary cause was delayed second Urea application reducing yield by 4.5 quintals, followed by delayed weeding.`,
      language
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agronomy.yieldGap')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Comparison Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Sparkles size={24} color="#16A34A" />
            <Text style={styles.heroCity}>Adama City • Koticha (Black Vertisol) Benchmark</Text>
          </View>

          <View style={styles.comparisonGrid}>
            <View style={styles.compareCol}>
              <Text style={styles.compareNum}>{ownYield}</Text>
              <Text style={styles.compareLabel}>Your Plot (qt/ha)</Text>
            </View>

            <View style={styles.vsBox}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.compareCol}>
              <Text style={[styles.compareNum, styles.topQuartileText]}>{topQuartile}</Text>
              <Text style={styles.compareLabel}>Top 25% Peers</Text>
            </View>
          </View>

          <View style={styles.gapBadge}>
            <TrendingDown size={16} color="#DC2626" />
            <Text style={styles.gapText}>{gapPct}% Productivity Gap ({topQuartile - ownYield} qt/ha potential gain)</Text>
          </View>
        </View>

        {/* Listen Explanation Action */}
        <TouchableOpacity style={styles.audioAction} onPress={handleReadAloud}>
          <Volume2 size={20} color="#16A34A" />
          <Text style={styles.audioActionText}>Listen Agronomic Plain-Language Explanation</Text>
        </TouchableOpacity>

        {/* Root Causes List */}
        <Text style={styles.sectionTitle}>Identified Root Causes & Yield Loss</Text>
        {candidateCauses.map((c, idx) => (
          <View key={idx} style={styles.causeCard}>
            <View style={styles.causeHeader}>
              <Text style={styles.causeTitle}>{c.title}</Text>
              <View style={styles.impactBadge}>
                <Text style={styles.impactText}>{c.impact}</Text>
              </View>
            </View>
            <Text style={styles.causeDesc}>{c.description}</Text>
          </View>
        ))}

        {/* Actionable Next-Season Recommendations */}
        <Text style={styles.sectionTitle}>Next Season Directives</Text>
        <View style={styles.recommendationCard}>
          <CheckCircle size={20} color="#16A34A" />
          <View style={styles.recText}>
            <Text style={styles.recTitle}>Pre-schedule Urea Split Top-Dressing</Text>
            <Text style={styles.recSub}>Apply 50 kg Urea at 35 DAP and the remaining 50 kg before flag leaf emergence.</Text>
          </View>
        </View>
      </ScrollView>

      <VoiceBar
        title={t('agronomy.yieldGap')}
        readAloudText={`Yield Gap Analysis. Productivity gap: ${topQuartile - ownYield} quintals per hectare.`}
        onVoiceCommand={handleReadAloud}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 20,
    marginBottom: 14,
    elevation: 3,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  heroCity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#566153',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  compareCol: {
    alignItems: 'center',
  },
  compareNum: {
    fontSize: 32,
    fontWeight: '900',
    color: '#151A14',
  },
  topQuartileText: {
    color: '#16A34A',
  },
  compareLabel: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
    marginTop: 4,
  },
  vsBox: {
    backgroundColor: '#F0ECE1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#71717A',
  },
  gapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
  },
  gapText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  audioAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  audioActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
    marginVertical: 10,
  },
  causeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 10,
  },
  causeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  causeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#151A14',
    flex: 1,
  },
  impactBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  causeDesc: {
    fontSize: 12,
    color: '#566153',
    lineHeight: 18,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    gap: 12,
  },
  recText: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
  },
  recSub: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
    lineHeight: 16,
  },
});

