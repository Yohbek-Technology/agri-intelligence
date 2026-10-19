import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { normalizeToHectares, type AreaUnit } from '@/utils/unit-converter';

export interface RegisterPlotScreenProps {
  onComplete?: () => void;
}

export function RegisterPlotScreen({ onComplete }: RegisterPlotScreenProps) {
  const [plotName, setPlotName] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('timad');
  const [plannedCrop, setPlannedCrop] = useState('Teff');
  const [soilClass, setSoilClass] = useState('koticha_vertisol');
  const [drainage, setDrainage] = useState('waterlogs');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  const captureGps = () => {
    // Fused Location Simulator (PLOT-5)
    setGpsLocation({
      lat: 8.5411,
      lng: 39.2704,
      accuracy: 9.2, // accurate <= 30m
    });
    Alert.alert('GPS Centroid Captured', 'Location: 8.5411° N, 39.2704° E (Accuracy: 9.2m)\nAgro-Zone Tagged: Weyna Dega (1,840m elevation)');
  };

  const calculatedHa = areaValue ? normalizeToHectares(parseFloat(areaValue) || 0, areaUnit) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Register New Plot</Text>
        <Text style={styles.subheading}>Define land boundaries, soil properties, and planned season crop.</Text>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plot Name / የማሳ ስም</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lower Field"
              value={plotName}
              onChangeText={setPlotName}
            />
          </View>

          {/* Area & Unit Selector (PLOT-4) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Land Area & Unit</Text>
            <View style={styles.areaRow}>
              <TextInput
                style={[styles.input, styles.areaInput]}
                placeholder="2.0"
                value={areaValue}
                onChangeText={setAreaValue}
                keyboardType="decimal-pad"
              />
              <View style={styles.unitButtonGroup}>
                {(['timad', 'kert', 'hectare'] as AreaUnit[]).map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setAreaUnit(u)}
                    style={[styles.unitButton, areaUnit === u && styles.unitButtonActive]}>
                    <Text style={[styles.unitText, areaUnit === u && styles.unitTextActive]}>
                      {u.charAt(0).toUpperCase() + u.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {calculatedHa > 0 ? (
              <Text style={styles.normalizedText}>
                Normalized: {calculatedHa} Hectares (Office conversion rate: 0.25 ha/timad)
              </Text>
            ) : null}
          </View>

          {/* GPS Centroid Capture (PLOT-5) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plot GPS Centroid (Horizontal Accuracy ≤ 30m)</Text>
            <Pressable style={styles.gpsButton} onPress={captureGps}>
              <Text style={styles.gpsButtonText}>
                {gpsLocation
                  ? `📍 Centroid Pinned (${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)} • ±${gpsLocation.accuracy}m)`
                  : '📍 Capture GPS Centroid (Works Offline)'}
              </Text>
            </Pressable>
          </View>

          {/* Qualitative Soil Profiling (PLOT-7) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qualitative Soil Class (PLOT-7)</Text>
            <View style={styles.soilGrid}>
              <Pressable
                onPress={() => setSoilClass('koticha_vertisol')}
                style={[styles.soilCard, soilClass === 'koticha_vertisol' && styles.soilCardActive]}>
                <Text style={styles.soilTitle}>Koticha (Black Vertisol)</Text>
                <Text style={styles.soilDesc}>High fertility, heavy clay, prone to waterlogging</Text>
              </Pressable>

              <Pressable
                onPress={() => setSoilClass('beda_nitisol')}
                style={[styles.soilCard, soilClass === 'beda_nitisol' && styles.soilCardActive]}>
                <Text style={styles.soilTitle}>Beda (Red Nitisol)</Text>
                <Text style={styles.soilDesc}>Deep red, good drainage, needs phosphorus</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={onComplete}>
            <Text style={styles.saveButtonText}>Save Plot to Local Database</Text>
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
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subheading: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.four,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  input: {
    height: TouchTargets.minimum,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  areaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  areaInput: {
    flex: 1,
  },
  unitButtonGroup: {
    flexDirection: 'row',
    borderRadius: Radii.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  unitButton: {
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundElement,
  },
  unitButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  unitText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '600',
  },
  unitTextActive: {
    color: Colors.light.primaryText,
  },
  normalizedText: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: Spacing.one,
    fontWeight: '600',
  },
  gpsButton: {
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  soilGrid: {
    gap: Spacing.two,
  },
  soilCard: {
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radii.medium,
    backgroundColor: Colors.light.background,
  },
  soilCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primarySubtle,
  },
  soilTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  soilDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    height: TouchTargets.primaryButton,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  saveButtonText: {
    color: Colors.light.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
