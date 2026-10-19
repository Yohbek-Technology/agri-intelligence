import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function UnifiedInboxScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Alerts & Notifications</Text>

        <VisualCard
          icon="🌧️"
          title="Heavy Downpour Advisory"
          subtitle="Forecast indicates 55mm precipitation over the weekend."
          value="Weather Alert"
          badgeText="High"
          badgeColor={Colors.light.danger}
          badgeBackground={Colors.light.dangerLight}
        />

        <VisualCard
          icon="💬"
          title="Grievance Desk Reply"
          subtitle="DA Kebede responded to your fertilizer shortage voice note."
          value="New Voice Message"
          badgeText="Desk Update"
          badgeColor={Colors.light.info}
          badgeBackground={Colors.light.infoLight}
        />

        <VisualCard
          icon="🌾"
          title="Meher Sowing Window"
          subtitle="Optimal rainfall onset verified. Sowing window active for Teff."
          value="Agronomic Reminder"
          badgeText="Active"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
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
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.three,
  },
});
