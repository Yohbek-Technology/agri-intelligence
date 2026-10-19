import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export interface PlotDetailScreenProps {
  plotId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function PlotDetailScreen({ plotId, onNavigate }: PlotDetailScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Lower Field Plot</Text>
          <Text style={styles.subtitle}>2.0 Timad (0.50 Hectares) • Weyna Dega (1,840m)</Text>
        </View>

        {/* Soil & Agro-Ecological Profile (PLOT-6, PLOT-7) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Soil & Elevation Profile</Text>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Soil Class:</Text>
            <Text style={styles.specValue}>Koticha (Black Vertisol)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Drainage Behavior:</Text>
            <Text style={styles.specValue}>Waterlogging Risk</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Agro-Climatic Zone:</Text>
            <Text style={styles.specValue}>Weyna Dega (Auto-Derived)</Text>
          </View>
        </View>

        {/* Active Crop Cycle Milestone (CROP-2, CROP-3) */}
        <Text style={styles.sectionHeading}>Current Cropping Cycle (2026 Meher)</Text>
        <VisualCard
          icon="🌱"
          title="Teff (Quncho Variety)"
          subtitle="Started: 2026-07-15 • Sowing Certified Seed (25 kg/ha)"
          value="Vegetative Stage"
          badgeText="Active Cycle"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onPress={() => onNavigate?.('CropCycleHub', { plotId })}
        />

        {/* Action Shortcuts */}
        <Pressable
          style={styles.actionBtn}
          onPress={() => onNavigate?.('UniversalLogger', { cycleId: 'active-cycle' })}>
          <Text style={styles.actionBtnText}>+ Log Fertilizer or Field Event</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={() => onNavigate?.('WeatherForecast', { plotId })}>
          <Text style={[styles.actionBtnText, styles.secondaryBtnText]}>
            View 7-Day Farm-or-Not Forecast
          </Text>
        </Pressable>
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
    marginBottom: Spacing.four,
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
  sectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  specLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginVertical: Spacing.two,
  },
  actionBtn: {
    backgroundColor: Colors.light.primary,
    height: TouchTargets.primaryButton,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  actionBtnText: {
    color: Colors.light.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    marginTop: Spacing.two,
  },
  secondaryBtnText: {
    color: Colors.light.primary,
  },
});
