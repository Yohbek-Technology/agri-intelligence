import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function DaTasksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>DA Assigned Field Tasks</Text>

        <VisualCard
          icon="📋"
          title="Field Audit Visit: Plot 104"
          subtitle="Farmer: Abebe Balcha • Inspect delayed Urea 1 application."
          value="Due Tomorrow"
          badgeText="High Priority"
          badgeColor={Colors.light.danger}
          badgeBackground={Colors.light.dangerLight}
        />

        <VisualCard
          icon="🔬"
          title="Review Low-Confidence Diagnosis"
          subtitle="Farmer: Fatuma Mohammed • Leaf rust symptoms flagged for DA review."
          value="Review Needed"
          badgeText="Diagnosis Task"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
        />

        <VisualCard
          icon="✅"
          title="Sowing Verification: Plot 202"
          subtitle="Farmer: Kebede Tadesse • Verified certified Kakaba seed."
          value="Completed"
          badgeText="Done"
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
