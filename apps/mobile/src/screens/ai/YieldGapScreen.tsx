import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export interface YieldGapScreenProps {
  cycleId?: string;
}

export function YieldGapScreen({ cycleId }: YieldGapScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Yield Gap Diagnostic</Text>
          <Text style={styles.subtitle}>
            Peer Benchmark: Top 25% Teff Producers in Adama on Koticha Soil
          </Text>
        </View>

        {/* Comparison Hero Card (YIELD-1, YIELD-2) */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.yieldCol}>
              <Text style={styles.yieldLabel}>Your Yield</Text>
              <Text style={styles.yieldValue}>12.0</Text>
              <Text style={styles.yieldUnit}>Quintals/Ha</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.yieldCol}>
              <Text style={styles.yieldLabel}>Top Peers (P75)</Text>
              <Text style={[styles.yieldValue, { color: Colors.light.primary }]}>31.0</Text>
              <Text style={styles.yieldUnit}>Quintals/Ha</Text>
            </View>
          </View>

          <View style={styles.gapPill}>
            <Text style={styles.gapPillText}>-61.3% Productivity Gap vs Top Producers</Text>
          </View>
        </View>

        {/* Ranked Root Causes (YIELD-3 to YIELD-7) */}
        <Text style={styles.sectionHeading}>Top 3 Root Causes Diagnosed</Text>

        <VisualCard
          icon="1️⃣"
          title="Delayed 2nd Urea Top-Dressing"
          subtitle="Applied 49 days after sowing vs peer median of 28 days (21-day delay)."
          value="Primary Cause"
          badgeText="Timing Gap"
          badgeColor={Colors.light.danger}
          badgeBackground={Colors.light.dangerLight}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="2️⃣"
          title="Delayed 1st Weeding Pass"
          subtitle="Weeding delayed by 14 days beyond crop critical window, causing weed competition."
          value="Secondary Cause"
          badgeText="Weed Gap"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="3️⃣"
          title="Recycled Local Grain Seed"
          subtitle="Used recycled local grain. Certified improved seed yielded +8 qt/ha in this cohort."
          value="Contributing Factor"
          badgeText="Seed Variety"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
          onAudioPress={() => {}}
        />

        {/* Actionable Recommendations (YIELD-9) */}
        <Text style={styles.sectionHeading}>Recommended Actions for Next Season</Text>
        <View style={styles.recommendationBox}>
          <Text style={styles.recTitle}>💡 Top Agronomic Correction:</Text>
          <Text style={styles.recText}>
            Apply 1st Urea exactly 30 days after sowing and 2nd Urea at early grain-filling (within 55 days).
          </Text>
          <Pressable style={styles.saveReminderButton}>
            <Text style={styles.saveReminderText}>Save as Next Season Reminders</Text>
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
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.three,
    alignItems: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: Spacing.two,
  },
  yieldCol: {
    alignItems: 'center',
    flex: 1,
  },
  yieldLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  yieldValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
  },
  yieldUnit: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.light.border,
    height: '80%',
    alignSelf: 'center',
  },
  gapPill: {
    backgroundColor: Colors.light.dangerLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
    marginTop: Spacing.three,
  },
  gapPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.danger,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  recommendationBox: {
    backgroundColor: Colors.light.primarySubtle,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radii.large,
    padding: Spacing.four,
    marginTop: Spacing.two,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: Spacing.one,
  },
  recText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  saveReminderButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  saveReminderText: {
    color: Colors.light.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
});
