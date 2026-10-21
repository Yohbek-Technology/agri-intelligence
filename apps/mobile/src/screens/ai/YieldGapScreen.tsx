import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import {
  intelligenceService,
  YieldGapEvaluation,
} from '@/services/api/intelligence-service';

export interface YieldGapScreenProps {
  cycleId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function YieldGapScreen({ cycleId = 'default-cycle', onNavigate }: YieldGapScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluation, setEvaluation] = useState<YieldGapEvaluation | null>(null);
  const [audioLang, setAudioLang] = useState<'am' | 'om'>('am');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(24);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({
    'rec-1': true,
    'rec-2': true,
  });
  const [remindersSaved, setRemindersSaved] = useState<boolean>(false);

  useEffect(() => {
    loadYieldGap();
  }, [cycleId]);

  const loadYieldGap = async () => {
    setLoading(true);
    try {
      const res = await intelligenceService.fetchYieldGapByCycle(cycleId);
      if (res.success && res.data) {
        setEvaluation(res.data);
      }
    } catch {
      // Fallback handled by service
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (id: string) => {
    setCheckedActions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleAudio = () => {
    setIsPlayingAudio((prev) => !prev);
    if (!isPlayingAudio) {
      setAudioProgress(40);
    }
  };

  const handleSaveReminders = () => {
    setRemindersSaved(true);
    setTimeout(() => setRemindersSaved(false), 3000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Analyzing Peer Cohort Benchmarks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const evalData = evaluation!;
  const realizedYield = evalData.metrics?.realizedYieldQtPerHa || 18.0;
  const cohortMedian = evalData.metrics?.cohortMedianQtPerHa || 26.5;
  const topQuartile = evalData.metrics?.cohortTopQuartileQtPerHa || 32.0;
  const gapPercent = evalData.metrics?.gapPercent || 43.8;
  const absoluteGap = evalData.metrics?.absoluteGapQtPerHa || 14.0;

  // Calculate percentage bar widths
  const yourPlotWidth = Math.min(100, Math.round((realizedYield / topQuartile) * 100));
  const medianWidth = Math.min(100, Math.round((cohortMedian / topQuartile) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plot & Cohort Context Header Card */}
        <View style={styles.cohortCard}>
          <View style={styles.categoryBadgeRow}>
            <Text style={styles.categoryIcon}>🌱</Text>
            <Text style={styles.categoryBadgeText}>FIELD DIAGNOSTIC SUMMARY</Text>
          </View>
          <Text style={styles.plotHeadline}>
            {evalData.plot?.name || 'Lower Field (Teff - Koticha Soil)'}
          </Text>

          <View style={styles.pillTagRow}>
            <View style={styles.pillTag}>
              <Text style={styles.pillTagIcon}>📅</Text>
              <Text style={styles.pillTagText}>Meher Season 2024</Text>
            </View>
            <View style={[styles.pillTag, styles.pillTagHighlight]}>
              <Text style={styles.pillTagIcon}>🏆</Text>
              <Text style={[styles.pillTagText, styles.pillTagHighlightText]}>
                Top-Quartile Benchmark
              </Text>
            </View>
          </View>

          <View style={styles.cohortComparisonBox}>
            <Text style={styles.cohortIcon}>👥</Text>
            <Text style={styles.cohortText}>
              Comparison against{' '}
              <Text style={styles.cohortBold}>14 Top-Quartile Teff Farmers</Text> in Adama
              Woreda farming on Koticha (black clay) soils.
            </Text>
          </View>
        </View>

        {/* Visual Yield Gap Comparison & Data Telemetry */}
        <View style={styles.telemetryCard}>
          <View style={styles.telemetryHeader}>
            <View>
              <Text style={styles.telemetrySub}>PRODUCTION YIELD</Text>
              <Text style={styles.telemetryTitle}>Post-Harvest Analysis</Text>
            </View>
            <View style={styles.gapBadgeContainer}>
              <Text style={styles.gapBadgePercent}>-{gapPercent.toFixed(1)}%</Text>
              <Text style={styles.gapBadgeSub}>-{absoluteGap.toFixed(1)} Qt/Ha gap</Text>
            </View>
          </View>

          {/* Visual 3-Bar Representation */}
          <View style={styles.barsContainer}>
            {/* Your Plot */}
            <View style={styles.barBlock}>
              <View style={styles.barLabelRow}>
                <View style={styles.barLegendDotRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
                  <Text style={styles.barLegendLabel}>Your Plot (Lower Field)</Text>
                </View>
                <Text style={[styles.barYieldValue, { color: '#E65100' }]}>
                  {realizedYield.toFixed(1)} Qt/Ha
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${yourPlotWidth}%`, backgroundColor: '#E65100' },
                  ]}
                />
              </View>
            </View>

            {/* Cohort Median */}
            <View style={styles.barBlock}>
              <View style={styles.barLabelRow}>
                <View style={styles.barLegendDotRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#64748B' }]} />
                  <Text style={styles.barLegendLabel}>Adama Woreda Median</Text>
                </View>
                <Text style={styles.barYieldValue}>{cohortMedian.toFixed(1)} Qt/Ha</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${medianWidth}%`, backgroundColor: '#94A3B8' },
                  ]}
                />
              </View>
            </View>

            {/* Top 25% Peers */}
            <View style={styles.barBlock}>
              <View style={styles.barLabelRow}>
                <View style={styles.barLegendDotRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: Colors.light.primary }]}
                  />
                  <Text style={[styles.barLegendLabel, { fontWeight: '700' }]}>
                    Top 25% High-Yield Peers
                  </Text>
                </View>
                <Text
                  style={[
                    styles.barYieldValue,
                    { color: Colors.light.primary, fontWeight: '800' },
                  ]}
                >
                  {topQuartile.toFixed(1)} Qt/Ha
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: '100%', backgroundColor: Colors.light.primary },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Micro metric pills */}
          <View style={styles.microMetricsGrid}>
            <View style={styles.microMetricPill}>
              <Text style={styles.microMetricLabel}>Realized Yield</Text>
              <Text style={[styles.microMetricVal, { color: '#E65100' }]}>
                {realizedYield.toFixed(1)}{' '}
                <Text style={styles.microMetricUnit}>Quintals</Text>
              </Text>
            </View>
            <View style={[styles.microMetricPill, styles.microMetricHighlight]}>
              <Text style={[styles.microMetricLabel, { color: Colors.light.primary }]}>
                Achievable Target
              </Text>
              <Text style={[styles.microMetricVal, { color: Colors.light.primary }]}>
                {topQuartile.toFixed(1)}{' '}
                <Text style={styles.microMetricUnit}>Quintals</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Gemini AI Plain-Language Voice Explanation Card */}
        <View style={styles.voiceAdvisoryCard}>
          <View style={styles.voiceHeaderRow}>
            <View style={styles.aiBrandRow}>
              <Text style={styles.aiSparkleIcon}>✨</Text>
              <Text style={styles.aiBrandTitle}>Gemini Agronomy Intelligence</Text>
            </View>
            <Pressable
              style={styles.langSwitchBtn}
              onPress={() => setAudioLang(audioLang === 'am' ? 'om' : 'am')}
            >
              <Text style={styles.langSwitchText}>
                {audioLang === 'am' ? 'አማርኛ' : 'Afaan Oromoo'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.voiceExplanationQuote}>
            {audioLang === 'am'
              ? '«የማዳበሪያ አጠቃቀምዎ ዘግይቶ መከናወኑ እና የተሻሻለ የቁንጮ ዝርያ አለመጠቀምዎ በመኸር ወቅት 14 ኩንታል በሄክታር እንዲያጡ አድርጓል። ድምፁን ያዳምጡ።»'
              : '«Hojiin xaa’oo keessanii waan tureefii sanyii Qunxoo filatamaa waan hin fayyadamneef hektaara tokkotti kuntaala 14 dhabdaniittu. Sagalee dhaggeeffadhaa.»'}
          </Text>

          {/* Audio Scrubber & Player Widget */}
          <View style={styles.audioPlayerWidget}>
            <View style={styles.audioTopRow}>
              <Pressable
                style={[
                  styles.audioPlayBtn,
                  isPlayingAudio && { backgroundColor: Colors.light.primary },
                ]}
                onPress={handleToggleAudio}
              >
                <Text style={styles.audioPlayBtnIcon}>
                  {isPlayingAudio ? '⏸' : '▶'}
                </Text>
              </Pressable>
              <View style={styles.audioTitleCol}>
                <Text style={styles.audioTitleText}>
                  {audioLang === 'am'
                    ? 'የምርታማነት ክፍተት ትንተና አዳምጥ'
                    : 'Xiinxala Oomishitummaa Dhaggeeffadhu'}
                </Text>
                <Text style={styles.audioSubText}>
                  🔊 {audioLang === 'am' ? 'Amharic Voice' : 'Oromo Voice'} (1:42 min)
                </Text>
              </View>
              <Text style={styles.audioTimeCounter}>
                {isPlayingAudio ? '0:40' : '0:24'} / 1:42
              </Text>
            </View>

            <View style={styles.scrubberTrack}>
              <View style={[styles.scrubberFill, { width: `${audioProgress}%` }]} />
            </View>
          </View>
        </View>

        {/* Top 3 Ranked Agronomic Root Causes */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionHeading}>Ranked Root Causes</Text>
          </View>
          <Text style={styles.modelConfidenceBadge}>Model Confidence 94%</Text>
        </View>

        {/* Cause 1 (High Impact - Crimson) */}
        <View style={styles.causeCard}>
          <View style={styles.causeTopRow}>
            <View style={styles.causeLeftHeader}>
              <View style={[styles.causeIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.causeGlyph}>⏳</Text>
              </View>
              <View>
                <View style={[styles.severityPill, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.severityText, { color: '#B91C1C' }]}>
                    RANK 1 • HIGH SEVERITY
                  </Text>
                </View>
                <Text style={styles.causeTitle}>2nd Urea Top-Dressing Timing</Text>
              </View>
            </View>
            <View style={styles.lossCol}>
              <Text style={[styles.lossVal, { color: '#DC2626' }]}>~40%</Text>
              <Text style={styles.lossSub}>Yield Loss</Text>
            </View>
          </View>
          <Text style={styles.causeDescription}>
            Nitrogen applied at <Text style={styles.boldText}>49 DAS</Text> (Days After
            Sowing). Top quartile applied precisely at{' '}
            <Text style={[styles.boldText, { color: Colors.light.primary }]}>28 DAS</Text>{' '}
            during rapid tillering.
          </Text>
          <View style={styles.causeFooter}>
            <Text style={[styles.causeFooterHighlight, { color: '#DC2626' }]}>
              ⏱ +21 Days Delayed
            </Text>
            <Text style={styles.causeFooterText}>Koticha Leaching Impact: High</Text>
          </View>
        </View>

        {/* Cause 2 (Moderate Impact - Amber) */}
        <View style={styles.causeCard}>
          <View style={styles.causeTopRow}>
            <View style={styles.causeLeftHeader}>
              <View style={[styles.causeIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.causeGlyph}>🌿</Text>
              </View>
              <View>
                <View style={[styles.severityPill, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.severityText, { color: '#B45309' }]}>
                    RANK 2 • MODERATE SEVERITY
                  </Text>
                </View>
                <Text style={styles.causeTitle}>Weeding Delay Window</Text>
              </View>
            </View>
            <View style={styles.lossCol}>
              <Text style={[styles.lossVal, { color: '#D97706' }]}>~32%</Text>
              <Text style={styles.lossSub}>Yield Loss</Text>
            </View>
          </View>
          <Text style={styles.causeDescription}>
            First weeding completed at <Text style={styles.boldText}>35 DAS</Text>. Optimal
            critical control window is between{' '}
            <Text style={styles.boldText}>20-30 DAS</Text>. Early weed canopy outcompeted
            young teff shoots for nitrogen.
          </Text>
          <View style={styles.causeFooter}>
            <Text style={[styles.causeFooterHighlight, { color: '#D97706' }]}>
              ⚠️ Nutrient Competition
            </Text>
            <Text style={styles.causeFooterText}>Manual Weeding Labor Gap</Text>
          </View>
        </View>

        {/* Cause 3 (Low Impact - Genetic Potential) */}
        <View style={styles.causeCard}>
          <View style={styles.causeTopRow}>
            <View style={styles.causeLeftHeader}>
              <View style={[styles.causeIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <Text style={styles.causeGlyph}>🌾</Text>
              </View>
              <View>
                <View style={[styles.severityPill, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={[styles.severityText, { color: '#334155' }]}>
                    RANK 3 • GENETIC POTENTIAL
                  </Text>
                </View>
                <Text style={styles.causeTitle}>Seed Source & Purity Quality</Text>
              </View>
            </View>
            <View style={styles.lossCol}>
              <Text style={[styles.lossVal, { color: Colors.light.primary }]}>~28%</Text>
              <Text style={styles.lossSub}>Yield Loss</Text>
            </View>
          </View>
          <Text style={styles.causeDescription}>
            Planted with recycled home-saved grain. 93% of top-quartile cohort utilized{' '}
            <Text style={[styles.boldText, { color: Colors.light.primary }]}>
              Certified Improved Quncho (DZ-Cr-37)
            </Text>{' '}
            seed from the woreda cooperative.
          </Text>
          <View style={styles.causeFooter}>
            <Text style={[styles.causeFooterHighlight, { color: Colors.light.primary }]}>
              ✓ Germination Gap
            </Text>
            <Text style={styles.causeFooterText}>Local Grain Germination ~71%</Text>
          </View>
        </View>

        {/* Actionable Next-Season Correction Recommendations */}
        <View style={styles.correctionsContainer}>
          <View style={styles.correctionsHeader}>
            <View style={styles.correctionsTitleRow}>
              <Text style={styles.correctionsIcon}>🎯</Text>
              <Text style={styles.correctionsTitle}>Target Corrections for 2025</Text>
            </View>
            <Text style={styles.correctionsBadge}>2 Direct Actions</Text>
          </View>

          {/* Action 1 */}
          <Pressable
            style={[
              styles.actionItemCard,
              checkedActions['rec-1'] && styles.actionItemCardChecked,
            ]}
            onPress={() => toggleAction('rec-1')}
          >
            <View
              style={[
                styles.actionCheckbox,
                checkedActions['rec-1'] && styles.actionCheckboxActive,
              ]}
            >
              <Text style={styles.actionCheckboxGlyph}>
                {checkedActions['rec-1'] ? '✓' : ''}
              </Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionItemTitle}>
                Schedule 2nd Urea at exactly 25-30 DAS
              </Text>
              <Text style={styles.actionItemDescription}>
                AgriIntel will trigger automated SMS/Voice calendar alarm based on your
                confirmed 2025 sowing date.
              </Text>
            </View>
          </Pressable>

          {/* Action 2 */}
          <Pressable
            style={[
              styles.actionItemCard,
              checkedActions['rec-2'] && styles.actionItemCardChecked,
            ]}
            onPress={() => toggleAction('rec-2')}
          >
            <View
              style={[
                styles.actionCheckbox,
                checkedActions['rec-2'] && styles.actionCheckboxActive,
              ]}
            >
              <Text style={styles.actionCheckboxGlyph}>
                {checkedActions['rec-2'] ? '✓' : ''}
              </Text>
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionItemTitle}>Pre-order Certified Quncho Seed</Text>
              <Text style={styles.actionItemDescription}>
                Reserve 35kg bag at Adama Agricultural Cooperative Union depot before May 15.
              </Text>
            </View>
          </Pressable>

          {/* Toast feedback */}
          {remindersSaved && (
            <View style={styles.toastCard}>
              <Text style={styles.toastText}>
                ✓ 2025 Season Reminders & Cooperative Reservation Saved!
              </Text>
            </View>
          )}

          {/* Save Reminders CTA */}
          <Pressable
            style={styles.saveRemindersButton}
            onPress={handleSaveReminders}
          >
            <Text style={styles.saveRemindersBtnText}>
              💾 Save as 2025 Calendar Reminders
            </Text>
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
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  cohortCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  plotHeadline: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  pillTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  pillTagIcon: {
    fontSize: 12,
  },
  pillTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  pillTagHighlight: {
    backgroundColor: '#DCFCE7',
  },
  pillTagHighlightText: {
    color: '#15803D',
  },
  cohortComparisonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginTop: Spacing.xs,
  },
  cohortIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  cohortText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  cohortBold: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  telemetryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: Spacing.md,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  telemetrySub: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  telemetryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  gapBadgeContainer: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.md,
    alignItems: 'flex-end',
  },
  gapBadgePercent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },
  gapBadgeSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
    marginTop: 1,
  },
  barsContainer: {
    gap: Spacing.sm,
  },
  barBlock: {
    gap: 4,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLegendDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: Radii.full,
  },
  barLegendLabel: {
    fontSize: 13,
    color: Colors.light.text,
  },
  barYieldValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  barTrack: {
    height: 18,
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.full,
    padding: 2,
    justifyContent: 'center',
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  microMetricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  microMetricPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.md,
    padding: Spacing.sm,
  },
  microMetricHighlight: {
    backgroundColor: '#F0FDF4',
  },
  microMetricLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  microMetricVal: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  microMetricUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  voiceAdvisoryCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiSparkleIcon: {
    fontSize: 18,
  },
  aiBrandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  langSwitchBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  langSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  voiceExplanationQuote: {
    fontSize: 15,
    color: '#7C2D12',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  audioPlayerWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    gap: 8,
    marginTop: 4,
  },
  audioTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayBtnIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 2,
  },
  audioTitleCol: {
    flex: 1,
  },
  audioTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  audioSubText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  audioTimeCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  scrubberTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: Radii.full,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  sectionTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modelConfidenceBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  causeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: Spacing.xs,
  },
  causeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  causeLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  causeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  causeGlyph: {
    fontSize: 18,
  },
  severityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  causeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  lossCol: {
    alignItems: 'flex-end',
  },
  lossVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  lossSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  causeDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  causeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    marginTop: 6,
  },
  causeFooterHighlight: {
    fontSize: 12,
    fontWeight: '700',
  },
  causeFooterText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  correctionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  correctionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  correctionsIcon: {
    fontSize: 18,
  },
  correctionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  correctionsBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  actionItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionItemCardChecked: {
    borderColor: Colors.light.primary,
  },
  actionCheckbox: {
    width: 26,
    height: 26,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  actionCheckboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  actionCheckboxGlyph: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionTextCol: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  actionItemDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  toastCard: {
    backgroundColor: '#DCFCE7',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  saveRemindersButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Shadows.sm,
  },
  saveRemindersBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
