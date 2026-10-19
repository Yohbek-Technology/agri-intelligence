import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export interface DaOperationsHubScreenProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function DaOperationsHubScreen({ onNavigate }: DaOperationsHubScreenProps) {
  const [activeFarmer, setActiveFarmer] = useState('Abebe Balcha');

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        activeFarmerName={activeFarmer}
        pendingSyncCount={3}
        onFarmerSwitchPress={() => {}}
        onSyncChipPress={() => onNavigate?.('SyncSettings')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Outbreak Cluster Alert Card (AGENT-5) */}
        <View style={styles.outbreakAlert}>
          <Text style={styles.outbreakIcon}>🚨</Text>
          <View style={styles.outbreakContent}>
            <Text style={styles.outbreakTitle}>Pest Cluster Alert: Fall Armyworm</Text>
            <Text style={styles.outbreakBody}>
              3 cases reported within 4 km in Kebele 02 over the last 5 days.
            </Text>
          </View>
        </View>

        {/* DA Operations Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Assigned Farmers (38 Total)</Text>
          <Pressable
            style={styles.bulkButton}
            onPress={() => onNavigate?.('UniversalLogger', { cycleId: 'bulk' })}>
            <Text style={styles.bulkButtonText}>+ Bulk Urea Entry</Text>
          </Pressable>
        </View>

        {/* Sample Farmer Completeness Cards (AGENT-7) */}
        <VisualCard
          icon="👨‍🌾"
          title="Abebe Balcha (Active)"
          subtitle="Plot: Lower Field (Teff) • Missing: 1st Urea top-dress"
          value="75% Complete"
          badgeText="Action Needed"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onPress={() => onNavigate?.('CropCycleHub', { plotId: 'plot-1' })}
        />

        <VisualCard
          icon="👩‍🌾"
          title="Fatuma Mohammed"
          subtitle="Plot: River Field (Maize) • Sowing log verified"
          value="100% Up to Date"
          badgeText="Healthy"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onPress={() => {
            setActiveFarmer('Fatuma Mohammed');
          }}
        />

        <VisualCard
          icon="👨‍🌾"
          title="Kebede Tadesse"
          subtitle="Plot: Upper Kert (Wheat) • Missing: Sowing date"
          value="40% Complete"
          badgeText="Overdue"
          badgeColor={Colors.light.danger}
          badgeBackground={Colors.light.dangerLight}
          onPress={() => {
            setActiveFarmer('Kebede Tadesse');
          }}
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
  outbreakAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: Radii.medium,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  outbreakIcon: {
    fontSize: 24,
    marginRight: Spacing.two,
  },
  outbreakContent: {
    flex: 1,
  },
  outbreakTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  outbreakBody: {
    fontSize: 12,
    color: '#151A14',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.two,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  bulkButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.medium,
  },
  bulkButtonText: {
    color: Colors.light.primaryText,
    fontSize: 13,
    fontWeight: '600',
  },
});
