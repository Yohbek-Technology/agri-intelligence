import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export interface CropCycleHubScreenProps {
  plotId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

const MILESTONES = [
  { stage: 'Land Preparation', date: '2026-07-01', completed: true },
  { stage: 'Sowing', date: '2026-07-15', completed: true },
  { stage: 'Vegetative', date: 'Current Stage', completed: true, active: true },
  { stage: 'Flowering', date: 'Est. 2026-09-01', completed: false },
  { stage: 'Grain Filling', date: 'Est. 2026-09-25', completed: false },
  { stage: 'Harvest', date: 'Est. 2026-10-20', completed: false },
];

export function CropCycleHubScreen({ plotId, onNavigate }: CropCycleHubScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>2026 Meher Crop Cycle</Text>
          <Text style={styles.subtitle}>Teff (Quncho) • Lower Field Plot</Text>
        </View>

        {/* Milestone Timeline (CROP-3) */}
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneHeading}>Growth Milestone Timeline</Text>
          <View style={styles.timelineList}>
            {MILESTONES.map((m, idx) => (
              <View key={m.stage} style={styles.timelineItem}>
                <View
                  style={[
                    styles.dot,
                    m.completed && styles.dotCompleted,
                    m.active && styles.dotActive,
                  ]}>
                  {m.completed && !m.active ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStage, m.active && styles.timelineStageActive]}>
                    {m.stage}
                  </Text>
                  <Text style={styles.timelineDate}>{m.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Fertilizer Split Logs Status (CROP-5 to CROP-8) */}
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
          subtitle="Target: 30 days after sowing (Vegetative stage)"
          value="Due Now (25 kg)"
          badgeText="Pending Log"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onPress={() => onNavigate?.('UniversalLogger', { cycleId: 'active', logType: 'urea_1' })}
        />

        <VisualCard
          icon="📅"
          title="2nd Urea Top-Dressing"
          subtitle="Target: Grain Filling stage (following 1st Urea)"
          value="Scheduled (25 kg)"
          badgeText="Upcoming"
          badgeColor={Colors.light.textSecondary}
          badgeBackground={Colors.light.backgroundElement}
        />

        {/* Cash Ledger Preview (CROP-11) */}
        <Text style={styles.sectionHeading}>Cash Ledger Summary (ETB)</Text>
        <VisualCard
          icon="💵"
          title="Total Production Costs"
          subtitle="Seed (2,500 ETB) • Basal NPS (3,800 ETB) • Plowing (1,200 ETB)"
          value="7,500 ETB"
          badgeText="Cost to Date"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
          onPress={() => onNavigate?.('UniversalLogger', { cycleId: 'active', logType: 'ledger' })}
        />
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
  header: {
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  milestoneCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.three,
  },
  milestoneHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.three,
  },
  timelineList: {
    gap: Spacing.three,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  dotCompleted: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  dotActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primarySubtle,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineStage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  timelineStageActive: {
    fontWeight: '700',
    color: Colors.light.primary,
  },
  timelineDate: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
});
