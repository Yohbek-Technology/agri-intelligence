import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function PestDiagnosisScreen() {
  const [photoCount, setPhotoCount] = useState(2);

  const takePhoto = () => {
    if (photoCount >= 4) {
      Alert.alert('Maximum Photos', 'You can attach up to 4 photos per diagnosis request.');
      return;
    }
    setPhotoCount((c) => c + 1);
    Alert.alert('Photo Captured', 'Leaf symptom photo compressed to 280 KB (EXIF stripped). Ready for multimodal AI diagnosis.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Multimodal Plant Disease Diagnosis</Text>
          <Text style={styles.subtitle}>
            Photograph affected crop leaves. Gemini Vision diagnoses against registered treatments.
          </Text>
        </View>

        {/* Camera Capture Section (DIAG-1, MOB-DEV-1) */}
        <View style={styles.captureCard}>
          <Text style={styles.captureTitle}>Leaf & Stem Inspection Photos ({photoCount}/4)</Text>
          <Text style={styles.captureDesc}>
            Take clear close-up photos in natural light. Avoid blurred or distant images.
          </Text>

          <View style={styles.photoThumbnailsRow}>
            {Array.from({ length: photoCount }).map((_, i) => (
              <View key={i} style={styles.thumbnailBox}>
                <Text style={styles.thumbnailIcon}>🍃</Text>
                <Text style={styles.thumbnailLabel}>Photo {i + 1}</Text>
              </View>
            ))}

            {photoCount < 4 ? (
              <Pressable style={styles.addPhotoBox} onPress={takePhoto}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>+ Add Photo</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Diagnosis Result Card with Safety Filter (DIAG-4, DIAG-5) */}
        <Text style={styles.sectionHeading}>Diagnosis & Prescribed Advisory</Text>

        <VisualCard
          icon="🔬"
          title="Identified: Yellow Rust (Puccinia striiformis)"
          subtitle="Confidence: 94% • High Severity • Foliar fungal disease"
          value="Prescribed Treatment"
          badgeText="94% Confidence"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onAudioPress={() => {}}
        />

        {/* Registered Chemical Directory Match (DIAG-4, DIAG-5) */}
        <View style={styles.chemicalCard}>
          <Text style={styles.chemicalTag}>LEGAL REGISTERED TREATMENT (DIAG-4)</Text>
          <Text style={styles.chemicalBrand}>Rex Duo (Epoxiconazole + Thiophanate-methyl)</Text>
          <Text style={styles.regNumber}>MoA Reg: ETH-MOA-CHEM-0842 • Status: Active</Text>

          <View style={styles.chemicalDetailRow}>
            <Text style={styles.detailLabel}>Dosage Rate:</Text>
            <Text style={styles.detailVal}>0.5 Liters per Hectare in 200L water</Text>
          </View>

          <View style={styles.chemicalDetailRow}>
            <Text style={styles.detailLabel}>Pre-Harvest Interval (PHI):</Text>
            <Text style={styles.detailVal}>35 Days before harvest</Text>
          </View>

          <View style={styles.chemicalDetailRow}>
            <Text style={styles.detailLabel}>Required PPE:</Text>
            <Text style={styles.detailVal}>Face mask, chemical gloves, eye shield</Text>
          </View>
        </View>

        {/* 3-Year Rotation Advice (DIAG-8) */}
        <Text style={styles.sectionHeading}>3-Year Crop Rotation Plan</Text>
        <VisualCard
          icon="🔄"
          title="Recommended Next Crop: Chickpea (Legume)"
          subtitle="Break cereal fungal cycle. Fixes 60 kg/ha atmospheric nitrogen in Koticha soil."
          value="Cereal -> Legume"
          badgeText="Break Disease Cycle"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
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
  captureCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.two,
  },
  captureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  captureDesc: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  photoThumbnailsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  thumbnailBox: {
    width: 72,
    height: 72,
    borderRadius: Radii.medium,
    backgroundColor: Colors.light.primarySubtle,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 24,
  },
  thumbnailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 2,
  },
  addPhotoBox: {
    width: 72,
    height: 72,
    borderRadius: Radii.medium,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    fontSize: 22,
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: '600',
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
  chemicalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    padding: Spacing.four,
    marginVertical: Spacing.two,
  },
  chemicalTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  chemicalBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.one,
  },
  regNumber: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: Spacing.three,
  },
  chemicalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: Colors.light.backgroundElement,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.two,
  },
});
