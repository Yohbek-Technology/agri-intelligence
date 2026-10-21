import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import {
  cropCycleService,
  CycleFullDetails,
  CropCycle,
} from '@/services/api/crop-cycle-service';

export interface CropCycleHubScreenProps {
  plotId?: string;
  cycleId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function CropCycleHubScreen({
  plotId = 'plot-01',
  cycleId: initialCycleId,
  onNavigate,
}: CropCycleHubScreenProps) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<CycleFullDetails | null>(null);
  const [daModalVisible, setDaModalVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let targetCycleId = initialCycleId;

      if (!targetCycleId) {
        const plotRes = await cropCycleService.fetchPlotCycles(plotId);
        if (plotRes.success && plotRes.data && plotRes.data.length > 0) {
          targetCycleId = plotRes.data[0].id;
        }
      }

      if (targetCycleId) {
        const res = await cropCycleService.fetchCycleDetails(targetCycleId);
        if (res.success && res.data) {
          setDetails(res.data);
        }
      }
    } catch (err) {
      console.warn('Failed to load crop cycle details', err);
    } finally {
      setLoading(false);
    }
  }, [plotId, initialCycleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cycle = details?.cycle;
  const ledger = details?.ledger;

  const handlePlayAudio = () => {
    setAudioPlaying(true);
    Alert.alert(
      'Bilingual Audio Advisory (ድምፂ ስማዕ)',
      'የሰብል ዕድገት ደረጃ፡ እስካሁን 38 ቀናት ሆነዋል። የመጀመሪያው የዩሪያ ማዳበሪያ (25 ኪ.ግ) የሚሰጥበት ጊዜ ደርሷል። በአካባቢው የአፈር እርጥበት በቂ ነው።\n\nCrop status: Day 38 vegetative stage. 1st Urea top-dressing (25 kg) is due now under optimal soil moisture conditions.',
      [{ text: 'Close', onPress: () => setAudioPlaying(false) }]
    );
  };

  const handleDaAuditAction = (newStage: string) => {
    setDaModalVisible(false);
    Alert.alert(
      'DA Stage Correction Verified',
      `Stage updated to "${newStage.replace(/_/g, ' ').toUpperCase()}" and audit trail logged.`,
      [{ text: 'OK', onPress: () => loadData() }]
    );
  };

  if (loading && !details) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading Crop Cycle Milestones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysAfterSowing = cycle?.daysAfterSowing ?? 38;
  const moisturePercent = cycle?.moisturePercent ?? 82;
  const targetYield = cycle?.targetYieldQtPerHa ?? 14.5;
  const nextStageDays = cycle?.nextStageDays ?? 7;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status & Context Ribbon */}
        <View style={styles.ribbonRow}>
          <View style={styles.statusPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>
              Local AI Active • {cycle?.seasonName || 'Meher'} {cycle?.seasonYear || 2026}
            </Text>
          </View>

          <Pressable
            style={[styles.audioPill, audioPlaying && styles.audioPillActive]}
            onPress={handlePlayAudio}>
            <Text style={styles.audioIcon}>🔊</Text>
            <Text style={styles.audioText}>አዳምጥ • Listen (45s)</Text>
          </Pressable>
        </View>

        {/* Hero Plot Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroInfo}>
              <View style={styles.plotBadgeRow}>
                <View style={styles.plotBadge}>
                  <Text style={styles.plotBadgeText}>Plot #04</Text>
                </View>
                <Text style={styles.plotLocationText}>Lower Field</Text>
              </View>
              <Text style={styles.cropTitle}>{cycle?.cropName || 'Teff (Quncho DZ-Cr-37)'}</Text>
              <Text style={styles.cropMeta}>0.50 Ha • Koticha Vertisol (Black Clay)</Text>
            </View>

            <View style={styles.dasBox}>
              <Text style={styles.dasLabel}>DAS</Text>
              <Text style={styles.dasValue}>{daysAfterSowing}</Text>
              <Text style={styles.dasUnit}>DAY</Text>
            </View>
          </View>

          {/* Telemetry Badges Strip */}
          <View style={styles.telemetryStrip}>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>Moisture</Text>
              <Text style={styles.telemetryValue}>Optimal ({moisturePercent}%)</Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>Target Yield</Text>
              <Text style={[styles.telemetryValue, { color: Colors.light.primary }]}>
                {targetYield} Qt
              </Text>
            </View>
            <View style={styles.telemetryDivider} />
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>Next Stage</Text>
              <Text style={[styles.telemetryValue, { color: Colors.light.accent }]}>
                In {nextStageDays} Days
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Action Triggers */}
        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickActionBtn}
            onPress={() =>
              onNavigate?.('UniversalLogger', {
                cycleId: cycle?.id,
                initialLogType: 'urea_1',
              })
            }>
            <Text style={styles.quickIcon}>📝</Text>
            <Text style={styles.quickLabel}>Log Action</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionBtn}
            onPress={() =>
              Alert.alert(
                'Spray Window Advisory',
                'Optimal spray window: Tomorrow 06:00 - 09:30 AM. Wind speed < 6 km/h, rain probability < 15%.'
              )
            }>
            <Text style={styles.quickIcon}>💨</Text>
            <Text style={styles.quickLabel}>Spray Window</Text>
          </Pressable>

          <Pressable
            style={styles.quickActionBtn}
            onPress={() => onNavigate?.('PestScout', { plotId })}>
            <Text style={styles.quickIcon}>🔍</Text>
            <Text style={styles.quickLabel}>Pest Scout</Text>
          </Pressable>
        </View>

        {/* Cash Ledger Summary Card (CROP-11) */}
        <Pressable
          style={styles.ledgerCard}
          onPress={() =>
            onNavigate?.('UniversalLogger', {
              cycleId: cycle?.id,
              initialLogType: 'ledger',
            })
          }>
          <View style={styles.ledgerHeader}>
            <View style={styles.ledgerTitleRow}>
              <View style={styles.ledgerIconContainer}>
                <Text style={styles.ledgerTitleIcon}>💰</Text>
              </View>
              <View>
                <Text style={styles.ledgerTitle}>Crop Cash Ledger</Text>
                <Text style={styles.ledgerSubtitle}>Plot #04 Financial Health</Text>
              </View>
            </View>
            <View style={styles.profitableBadge}>
              <Text style={styles.profitableBadgeText}>Profitable</Text>
            </View>
          </View>

          <View style={styles.ledgerMetricsGrid}>
            <View style={styles.ledgerMetricCol}>
              <Text style={styles.ledgerMetricLabel}>Logged Cost</Text>
              <Text style={styles.costValue}>
                {ledger?.summary.totalCostsEtb.toLocaleString() || '6,450'} ETB
              </Text>
              <Text style={styles.metricSub}>Urea, NPS, Oxen</Text>
            </View>

            <View style={styles.ledgerMetricCol}>
              <Text style={styles.ledgerMetricLabel}>Exp. Revenue</Text>
              <Text style={styles.revenueValue}>
                {ledger?.summary.totalRevenueEtb.toLocaleString() || '18,500'} ETB
              </Text>
              <Text style={styles.metricSub}>14 Qt @ 1320</Text>
            </View>

            <View style={[styles.ledgerMetricCol, styles.marginCol]}>
              <Text style={styles.marginLabel}>Net Margin</Text>
              <Text style={styles.marginValue}>
                +{ledger?.summary.netMarginEtb.toLocaleString() || '12,050'}
              </Text>
              <Text style={styles.marginSub}>ETB projected</Text>
            </View>
          </View>
        </Pressable>

        {/* Milestone Timeline Header & DA Override Action */}
        <View style={styles.milestoneHeaderRow}>
          <View style={styles.milestoneHeaderLeft}>
            <Text style={styles.milestoneSectionIcon}>🌱</Text>
            <Text style={styles.milestoneSectionTitle}>Crop Cycle Milestones</Text>
          </View>

          <Pressable
            style={styles.daAuditBtn}
            onPress={() => setDaModalVisible(true)}>
            <Text style={styles.daAuditIcon}>🛡️</Text>
            <Text style={styles.daAuditText}>DA Audit</Text>
          </Pressable>
        </View>

        {/* Stepped Visual Roadmap (CROP-3) */}
        <View style={styles.roadmapCard}>
          {/* Stage 1: Done */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCompleted]}>
              <Text style={styles.stepCheck}>✓</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepRow}>
                <Text style={styles.stepTitle}>1. Land Preparation</Text>
                <View style={styles.doneTag}>
                  <Text style={styles.doneTagText}>Completed</Text>
                </View>
              </View>
              <Text style={styles.stepDescription}>
                4 maresha plowing passes executed on vertisol bed.
              </Text>
              <Text style={styles.stepAudit}>Logged June 24 • Verified by DA Bekele</Text>
            </View>
          </View>

          {/* Vertical Connecting Line */}
          <View style={styles.verticalLineDone} />

          {/* Stage 2: Done */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCompleted]}>
              <Text style={styles.stepCheck}>✓</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepRow}>
                <Text style={styles.stepTitle}>2. Sowing & Basal NPS</Text>
                <View style={styles.doneTag}>
                  <Text style={styles.doneTagText}>Completed</Text>
                </View>
              </View>
              <Text style={styles.stepDescription}>
                Row-sown Quncho teff (15 kg/ha) with 50 kg NPS basal fertilizer.
              </Text>
              <Text style={styles.stepAudit}>Logged July 15 • Optimal seed placement</Text>
            </View>
          </View>

          <View style={styles.verticalLineActive} />

          {/* Stage 3: ACTIVE */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <View style={styles.stepActiveCore} />
            </View>
            <View style={[styles.stepContent, styles.activeStepContent]}>
              <View style={styles.stepRow}>
                <Text style={[styles.stepTitle, styles.activeStepTitle]}>
                  3. Vegetative & 1st Urea
                </Text>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Current Stage</Text>
                </View>
              </View>
              <Text style={styles.stepDescription}>
                Tillering initiation underway. 25 kg Urea top-dressing application recommended.
              </Text>

              <Pressable
                style={styles.stepActionBtn}
                onPress={() =>
                  onNavigate?.('UniversalLogger', {
                    cycleId: cycle?.id,
                    initialLogType: 'urea_1',
                  })
                }>
                <Text style={styles.stepActionBtnText}>⚡ Log 1st Urea Top-Dress</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.verticalLinePending} />

          {/* Stage 4: Flowering */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepPending]}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepRow}>
                <Text style={styles.pendingStepTitle}>4. Flowering & Weed Clean</Text>
                <Text style={styles.stepEst}>Est. 55 DAS</Text>
              </View>
              <Text style={styles.stepDescription}>
                Target second manual weeding and head smut field scouting.
              </Text>
            </View>
          </View>

          <View style={styles.verticalLinePending} />

          {/* Stage 5: Grain Filling */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepPending]}>
              <Text style={styles.stepNumber}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepRow}>
                <Text style={styles.pendingStepTitle}>5. Grain Filling & 2nd Urea</Text>
                <Text style={styles.stepEst}>Est. 70 DAS</Text>
              </View>
              <Text style={styles.stepDescription}>
                Final 25 kg Urea top-dress applied strictly after 1st Urea confirmation.
              </Text>
            </View>
          </View>

          <View style={styles.verticalLinePending} />

          {/* Stage 6: Harvest */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepPending]}>
              <Text style={styles.stepNumber}>6</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepRow}>
                <Text style={styles.pendingStepTitle}>6. Maturity & Harvest</Text>
                <Text style={styles.stepEst}>Est. 95 DAS</Text>
              </View>
              <Text style={styles.stepDescription}>
                Threshing, yield quantification (Qt/Ha), and grain moisture check.
              </Text>
            </View>
          </View>
        </View>

        {/* Split-Fertilizer Schedule Section (CROP-5 to CROP-8) */}
        <Text style={styles.sectionHeading}>Split-Fertilizer Schedule</Text>

        <VisualCard
          icon="🧪"
          title="Basal Fertilizer (NPS)"
          subtitle="Applied: 50 kg on 2026-07-15 at planting"
          value="Applied (50 kg)"
          badgeText="Verified"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
        />

        <VisualCard
          icon="⏳"
          title="1st Urea Top-Dressing"
          subtitle="Target: 30-40 DAS (Vegetative tillering stage)"
          value="Due Now (25 kg)"
          badgeText="Pending Log"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onPress={() =>
            onNavigate?.('UniversalLogger', {
              cycleId: cycle?.id,
              initialLogType: 'urea_1',
            })
          }
        />

        <VisualCard
          icon="📅"
          title="2nd Urea Top-Dressing"
          subtitle="Target: Grain Filling stage (strictly following 1st Urea)"
          value="Scheduled (25 kg)"
          badgeText="Upcoming"
          badgeColor={Colors.light.textSecondary}
          badgeBackground={Colors.light.backgroundElement}
          onPress={() =>
            Alert.alert(
              'Constraint Notice (CROP-7)',
              '2nd Urea cannot be logged until 1st Urea is logged or explicitly marked skipped.'
            )
          }
        />
      </ScrollView>

      {/* DA Override & Correction Modal */}
      <Modal
        visible={daModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDaModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DA Stage Correction & Audit</Text>
            <Text style={styles.modalSub}>
              Override detected stage if extreme weather or replanting shifted the biological window.
            </Text>

            <View style={styles.modalOptions}>
              {[
                { label: 'Land Preparation', stage: 'land_prep' },
                { label: 'Sowing & Germination', stage: 'sowing' },
                { label: 'Vegetative Tillering (Active)', stage: 'vegetative' },
                { label: 'Flowering Stage', stage: 'flowering' },
                { label: 'Grain Filling Stage', stage: 'grain_filling' },
                { label: 'Maturity & Harvest', stage: 'maturity' },
              ].map((opt) => (
                <Pressable
                  key={opt.stage}
                  style={styles.modalOptionBtn}
                  onPress={() => handleDaAuditAction(opt.stage)}>
                  <Text style={styles.modalOptionText}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setDaModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  ribbonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCF',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  audioPillActive: {
    backgroundColor: '#FFB59A',
  },
  audioIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  audioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C2200',
  },
  heroCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.four,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  plotBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  plotBadge: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  plotLocationText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  cropTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cropMeta: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  dasBox: {
    width: 60,
    height: 60,
    borderRadius: Radii.card,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dasLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  dasValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.primary,
    lineHeight: 26,
  },
  dasUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  telemetryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radii.card,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.three,
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.border,
  },
  telemetryLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  telemetryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  quickIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  ledgerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  ledgerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  ledgerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ledgerIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerTitleIcon: {
    fontSize: 18,
  },
  ledgerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  ledgerSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  profitableBadge: {
    backgroundColor: '#94F990',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  profitableBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00450D',
  },
  ledgerMetricsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  ledgerMetricCol: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.two,
    borderRadius: 8,
  },
  marginCol: {
    backgroundColor: '#E8F5E9',
  },
  ledgerMetricLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.danger,
    marginTop: 2,
  },
  revenueValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  marginLabel: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  marginValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
    marginTop: 2,
  },
  marginSub: {
    fontSize: 9,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  metricSub: {
    fontSize: 9,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  milestoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  milestoneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneSectionIcon: {
    fontSize: 20,
  },
  milestoneSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  daAuditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  daAuditIcon: {
    fontSize: 14,
  },
  daAuditText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  roadmapCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepCompleted: {
    backgroundColor: Colors.light.primary,
  },
  stepActive: {
    backgroundColor: Colors.light.primarySubtle,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  stepActiveCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  stepPending: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  stepCheck: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  stepContent: {
    flex: 1,
  },
  activeStepContent: {
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  activeStepTitle: {
    color: Colors.light.primary,
  },
  pendingStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  doneTag: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  doneTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  activeTag: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  stepEst: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  stepAudit: {
    fontSize: 11,
    color: Colors.light.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  stepActionBtn: {
    marginTop: Spacing.two,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: Spacing.three,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  stepActionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verticalLineDone: {
    width: 2,
    height: 24,
    backgroundColor: Colors.light.primary,
    marginLeft: 12,
    marginVertical: 2,
  },
  verticalLineActive: {
    width: 2,
    height: 24,
    backgroundColor: Colors.light.primary,
    marginLeft: 12,
    marginVertical: 2,
  },
  verticalLinePending: {
    width: 2,
    height: 24,
    backgroundColor: Colors.light.border,
    marginLeft: 12,
    marginVertical: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.three,
  },
  modalOptions: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  modalOptionBtn: {
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalCloseBtn: {
    padding: Spacing.three,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.border,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
