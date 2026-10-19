import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function StorageGuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Post-Harvest Grain Storage Guide</Text>
          <Text style={styles.subtitle}>
            Illustrated, voice-narrated instructions for grain moisture testing and hermetic (PICS) bag storage.
          </Text>
        </View>

        {/* Moisture Testing Step (AGENT-6) */}
        <Text style={styles.sectionHeading}>Step 1: Test Grain Moisture Without a Meter</Text>
        <VisualCard
          icon="🧂"
          title="The Dry Salt Jar Moisture Test"
          subtitle="Place dry grain in a glass jar with dry table salt. Shake for 2 minutes. If salt sticks to glass, grain moisture is >14% (too wet for storage)."
          value="Safe Moisture: <13%"
          badgeText="Moisture Rule"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onAudioPress={() => {}}
        />

        {/* Hermetic PICS Bag Guidelines (AGENT-6) */}
        <Text style={styles.sectionHeading}>Step 2: Hermetic Storage Bag (PICS) Sealing</Text>
        <VisualCard
          icon="1️⃣"
          title="Inspect & Fill Inner Liner"
          subtitle="Check the two high-density polyethylene inner liners for punctures. Fill completely with clean dry grain."
          value="Inner Layer 1"
          badgeText="Inspect First"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="2️⃣"
          title="Twist & Tie Inner Liners Individually"
          subtitle="Squeeze out trapped air. Twist the neck of the first liner tightly and fold over; tie firmly with twine. Repeat for second liner."
          value="Airtight Seal"
          badgeText="No Oxygen"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="3️⃣"
          title="Tie Outer Woven Polypropylene Bag"
          subtitle="Tie outer bag to protect liners from mechanical tear. Store on wooden pallets off the ground away from rodents."
          value="Pallet Storage"
          badgeText="Pest Protection"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
          onAudioPress={() => {}}
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
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
});
