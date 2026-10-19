import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function CertifiedInputsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const sampleInputs = [
    {
      name: 'Quncho Teff (DZ-Cr-387)',
      type: 'Certified Seed',
      reg: 'ETH-SEED-2006-012',
      supplier: 'Oromia Seed Enterprise',
      icon: '🌾',
    },
    {
      name: 'Rex Duo (Fungicide)',
      type: 'Registered Chemical',
      reg: 'ETH-MOA-CHEM-0842',
      supplier: 'Authorized Agro-Dealer Adama',
      icon: '🧪',
    },
    {
      name: 'NPS-Zinc (Basal Fertilizer)',
      type: 'Subsidized Fertilizer',
      reg: 'ETH-MOA-FERT-2021-04',
      supplier: 'Primary Agricultural Cooperative Depot',
      icon: '📦',
    },
  ];

  const filtered = sampleInputs.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.reg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Certified Inputs & Seed Directory</Text>
          <Text style={styles.subtitle}>
            Verify genuine agro-chemicals and certified seed varieties offline.
          </Text>
        </View>

        {/* Search Bar with Voice Dictation (DIAG-9, VOICE-7) */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by brand name or reg number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable
            style={styles.micBtn}
            accessibilityLabel="Voice search inputs">
            <Text style={styles.micBtnIcon}>🎙️</Text>
          </Pressable>
        </View>

        {filtered.length > 0 ? (
          filtered.map((item) => (
            <VisualCard
              key={item.reg}
              icon={item.icon}
              title={item.name}
              subtitle={`Reg: ${item.reg} • Source: ${item.supplier}`}
              value={item.type}
              badgeText="Genuine Certified"
              badgeColor={Colors.light.primary}
              badgeBackground={Colors.light.primarySubtle}
            />
          ))
        ) : (
          /* Zero Result Adulteration Advisory (DIAG-9) */
          <View style={styles.notFoundCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.notFoundTitle}>Input Not Found in Official Registry</Text>
            <Text style={styles.notFoundDesc}>
              This product does not match any registered chemical or certified seed in the city office catalog.
              Beware of counterfeit or adulterated inputs.
            </Text>
            <Pressable style={styles.reportBtn}>
              <Text style={styles.reportBtnText}>Report Suspect Input to Grievance Desk</Text>
            </Pressable>
          </View>
        )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radii.medium,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    height: TouchTargets.minimum,
    marginBottom: Spacing.four,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  micBtn: {
    padding: Spacing.one,
  },
  micBtnIcon: {
    fontSize: 18,
  },
  notFoundCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: Colors.light.danger,
    borderRadius: Radii.card,
    padding: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  warningIcon: {
    fontSize: 36,
    marginBottom: Spacing.two,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.danger,
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 13,
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: Spacing.two,
    lineHeight: 18,
  },
  reportBtn: {
    backgroundColor: Colors.light.danger,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    marginTop: Spacing.three,
  },
  reportBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
