import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function MarketPricesScreen() {
  const [calculatorVolume, setCalculatorVolume] = useState('10'); // 10 quintals
  const teffAvgPrice = 9500; // ETB per quintal

  const volume = parseFloat(calculatorVolume) || 0;
  const estimatedRevenue = volume * teffAvgPrice;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>City Market Day Price Intelligence</Text>
          <Text style={styles.subtitle}>
            Verified spot survey prices • Adama Central Market • Last Survey: Oct 15
          </Text>
        </View>

        {/* Spot Price Cards (MKT-1) */}
        <VisualCard
          icon="🌾"
          title="White Teff (Magna / Quncho)"
          subtitle="Min: 9,200 ETB • Max: 9,800 ETB per Quintal"
          value="9,500 ETB/Qt"
          badgeText="Verified Survey"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="🍞"
          title="Bread Wheat (Kakaba)"
          subtitle="Min: 4,600 ETB • Max: 5,100 ETB per Quintal"
          value="4,850 ETB/Qt"
          badgeText="Verified Survey"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
          onAudioPress={() => {}}
        />

        {/* Expected Revenue Calculator (MKT-4) */}
        <Text style={styles.sectionHeading}>Expected Revenue Calculator</Text>
        <View style={styles.calculatorCard}>
          <Text style={styles.calcTitle}>Calculate Estimated Crop Revenue</Text>
          <View style={styles.calcRow}>
            <TextInput
              style={styles.calcInput}
              value={calculatorVolume}
              onChangeText={setCalculatorVolume}
              keyboardType="decimal-pad"
            />
            <Text style={styles.calcUnit}>Quintals of Teff</Text>
          </View>

          <View style={styles.calcResultBox}>
            <Text style={styles.calcResultLabel}>Estimated Gross Earnings:</Text>
            <Text style={styles.calcResultVal}>{estimatedRevenue.toLocaleString()} ETB</Text>
          </View>
        </View>

        {/* Crowdsourced Sale Logger Button (MKT-2) */}
        <Pressable
          style={styles.logSaleButton}
          onPress={() => Alert.alert('Log Sale Transaction', 'Record completed grain transaction for price moderation.')}>
          <Text style={styles.logSaleButtonText}>+ Record Completed Grain Sale</Text>
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
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  calculatorCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.two,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.three,
    gap: Spacing.three,
  },
  calcInput: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    height: TouchTargets.minimum,
    fontSize: 18,
    fontWeight: '700',
    width: 90,
    textAlign: 'center',
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  calcUnit: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  calcResultBox: {
    backgroundColor: Colors.light.primarySubtle,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcResultLabel: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  calcResultVal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  logSaleButton: {
    backgroundColor: Colors.light.primary,
    height: TouchTargets.primaryButton,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  logSaleButtonText: {
    color: Colors.light.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
});
