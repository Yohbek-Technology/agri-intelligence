import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export interface PlotListScreenProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function PlotListScreen({ onNavigate }: PlotListScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Registered Plots (2 Active)</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => onNavigate?.('RegisterPlot')}>
            <Text style={styles.addButtonText}>+ Add Plot</Text>
          </Pressable>
        </View>

        <VisualCard
          icon="🌱"
          title="Lower Field"
          subtitle="2.0 Timad (0.50 Ha) • Koticha (Black Vertisol) • Weyna Dega"
          value="Teff (Quncho)"
          badgeText="Vegetative"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onPress={() => onNavigate?.('PlotDetail', { plotId: 'plot-1' })}
        />

        <VisualCard
          icon="🌾"
          title="Riverbank Plot"
          subtitle="1.5 Timad (0.37 Ha) • Beda (Red Nitisol) • Weyna Dega"
          value="Wheat (Kakaba)"
          badgeText="Flowering"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
          onPress={() => onNavigate?.('PlotDetail', { plotId: 'plot-2' })}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.medium,
  },
  addButtonText: {
    color: Colors.light.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
});
