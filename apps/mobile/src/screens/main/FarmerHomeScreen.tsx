import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { useAuth } from '@/context/AuthContext';

export interface FarmerHomeScreenProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function FarmerHomeScreen({ onNavigate }: FarmerHomeScreenProps) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        pendingSyncCount={0}
        onSyncChipPress={() => onNavigate?.('SyncSettings')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Extreme Weather Alert Banner (WEATH-7) */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertTextGroup}>
            <Text style={styles.alertTitle}>Unseasonal Heavy Rain Warning</Text>
            <Text style={styles.alertSubtitle}>
              Downpour expected in Adama over next 48h. Postpone chemical spraying.
            </Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            Selam, {user?.name || 'Farmer'} 👨‍🌾
          </Text>
          <Text style={styles.subgreeting}>Meher Growing Season • Adama Jurisdiction</Text>
        </View>

        {/* Quick Agronomic Dashboard Cards (PLOT-10, WEATH-3) */}
        <Text style={styles.sectionHeading}>Active Plots & Advisories</Text>

        <VisualCard
          icon="🌱"
          title="Lower Field Plot (2.0 Timad)"
          subtitle="Teff (Quncho) • Vegetative Growth Stage"
          value="Ready for 1st Urea"
          badgeText="Next Task"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onPress={() => onNavigate?.('CropCycleHub', { plotId: 'demo-plot-1' })}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="☀️"
          title="Adama 7-Day Weather"
          subtitle="26°C • Rain Chance: 15% • Wind: 8 km/h"
          value="Plowing: GO"
          badgeText="Farm-or-Not"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onPress={() => onNavigate?.('WeatherForecast')}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="📊"
          title="Yield Gap Diagnostic"
          subtitle="Previous Season Teff: 12 qt/ha vs 31 qt/ha Peer P75"
          value="-61% Yield Gap"
          badgeText="Root Causes"
          badgeColor={Colors.light.danger}
          badgeBackground={Colors.light.dangerLight}
          onPress={() => onNavigate?.('YieldGap', { cycleId: 'demo-cycle-1' })}
          onAudioPress={() => {}}
        />

        {/* Action Shortcuts */}
        <View style={styles.shortcutsRow}>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => onNavigate?.('UniversalLogger', { cycleId: 'demo-cycle-1' })}>
            <Text style={styles.shortcutIcon}>📝</Text>
            <Text style={styles.shortcutTitle}>Log Event</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => onNavigate?.('PestDiagnosis')}>
            <Text style={styles.shortcutIcon}>🔬</Text>
            <Text style={styles.shortcutTitle}>Diagnose Pest</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => onNavigate?.('MarketPrices')}>
            <Text style={styles.shortcutIcon}>💰</Text>
            <Text style={styles.shortcutTitle}>Market Board</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => onNavigate?.('GrievanceChat')}>
            <Text style={styles.shortcutIcon}>📢</Text>
            <Text style={styles.shortcutTitle}>Voice Box</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Persistent 56dp Floating Voice Assistant (VOICE-1) */}
      <VoiceAssistant
        onNavigate={onNavigate}
        onIntentResolved={(intent: string) => {
          if (intent === 'open_weather') onNavigate?.('WeatherForecast');
        }}
      />
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.dangerLight,
    borderWidth: 1,
    borderColor: Colors.light.danger,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: Spacing.two,
  },
  alertTextGroup: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.danger,
  },
  alertSubtitle: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 2,
    lineHeight: 16,
  },
  welcomeSection: {
    marginBottom: Spacing.four,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subgreeting: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginVertical: Spacing.two,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.three,
    alignItems: 'center',
    marginHorizontal: Spacing.half,
    ...Shadows.card,
  },
  shortcutIcon: {
    fontSize: 26,
    marginBottom: Spacing.one,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
});
