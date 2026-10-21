import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import {
  diagnosticService,
  DiagnosisCase,
} from '@/services/api/diagnostic-service';

export interface PestDiagnosisScreenProps {
  plotId?: string;
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function PestDiagnosisScreen({
  plotId = 'plot-01',
  onNavigate,
}: PestDiagnosisScreenProps) {
  const [photoCount, setPhotoCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisCase | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Initial load / default diagnosis fetch
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const res = await diagnosticService.submitDiagnosis({
          plotId,
          symptomsDescription: 'Distinct reddish-brown powdery rust pustules on upper leaves and stem lesions',
          affectedAreaPercent: 20,
        });
        if (res.success && res.data) {
          setDiagnosis(res.data);
        }
      } catch (err) {
        console.warn('Initial diagnosis load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [plotId]);

  const handleAddPhoto = () => {
    if (photoCount >= 4) {
      Alert.alert('Maximum Reached', 'You can attach up to 4 multi-angle leaf photos per diagnosis case.');
      return;
    }
    const nextCount = photoCount + 1;
    setPhotoCount(nextCount);
    Alert.alert(
      'Photo 4 Added (Macro Spore)',
      'Under-leaf fungal spore macro photo attached and compressed (240 KB). AI re-evaluating...'
    );
  };

  const handlePlayAudio = () => {
    setAudioPlaying(true);
    Alert.alert(
      'Audio Prescription (የመፍትሄ ሃሳቡን አዳምጥ)',
      'የስንዴ ቢጫ ዝገት (Wheat Stem Rust) በ94% እርግጠኝነት ተገኝቷል። የተፈቀደው የኬሚካል ሕክምና ቲልት 250 (Tilt 250 EC) ነው። በሄክታር 0.5 ሊትር በ200 ሊትር ንጹህ ውሃ በመበጥበጥ በማለዳ ይረጩ። የ30 ቀናት የደህንነት ጊዜ ይጠብቁ። ጓንትና ማስክ ማድረግ ግዴታ ነው።\n\nHigh severity Wheat Stem Rust diagnosed. Treat with Tilt 250 EC at 0.5 L/Ha. Observe 30-day pre-harvest interval.',
      [{ text: 'Close', onPress: () => setAudioPlaying(false) }]
    );
  };

  const handleSimulateLowConfidence = async () => {
    setLoading(true);
    try {
      const res = await diagnosticService.submitDiagnosis({
        plotId,
        symptomsDescription: 'Dust residue and glare on lower canopy',
        simulateLowConfidence: true,
      });
      if (res.success && res.data) {
        setDiagnosis(res.data);
        Alert.alert(
          'DIAG-6 Low Confidence Review Queued',
          'AI Confidence is 58%. In accordance with regulatory safety (DIAG-6), a physical verification task has been dispatched to your local DA (Bekele Tola).'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const primaryPrescription = diagnosis?.recommendations?.primaryPrescription;
  const confidencePct = diagnosis?.confidence
    ? Math.round(Number(diagnosis.confidence) * 100)
    : 94;
  const isLowConfidence = diagnosis?.reviewStatus === 'pending_da_review' || confidencePct < 65;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Context Telemetry Chip Strip */}
        <View style={styles.telemetryCard}>
          <View style={styles.telemetryTop}>
            <View style={styles.telemetryHeaderLeft}>
              <Text style={styles.brainIcon}>🧠</Text>
              <Text style={styles.telemetryTitle}>Context-Grounded Field Telemetry</Text>
            </View>
            <View style={styles.geoMatchedBadge}>
              <View style={styles.geoDot} />
              <Text style={styles.geoMatchedText}>AI Geo-Matched</Text>
            </View>
          </View>

          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryCol}>
              <Text style={styles.colLabel}>🌾 Plot</Text>
              <Text style={styles.colValue}>Hillside Plot</Text>
              <Text style={styles.colSub}>Wheat (Dega)</Text>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.colLabel}>🌱 Soil</Text>
              <Text style={styles.colValue}>Beda Nitisol</Text>
              <Text style={styles.colSub}>Clay-rich Red</Text>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.colLabel}>💧 7-Day Rain</Text>
              <Text style={[styles.colValue, { color: Colors.light.primary }]}>45 mm</Text>
              <Text style={styles.colSub}>High Moisture</Text>
            </View>
          </View>
        </View>

        {/* Multi-Angle Image Inspection Grid */}
        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <Text style={styles.photoTitle}>Field Samples ({photoCount}/4 Scanned)</Text>
            <Text style={styles.photoSub}>Multimodal Gemini Feed</Text>
          </View>

          <View style={styles.photoGrid}>
            {/* Slot 1: Leaf Spot */}
            <View style={styles.photoCard}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoSymbol}>🍂</Text>
                <View style={styles.verifiedCheck}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>
              <Text style={styles.photoLabel}>Leaf Spot</Text>
            </View>

            {/* Slot 2: Stem Lesion */}
            <View style={styles.photoCard}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoSymbol}>🌿</Text>
                <View style={styles.verifiedCheck}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>
              <Text style={styles.photoLabel}>Stem Lesion</Text>
            </View>

            {/* Slot 3: Spore Detail */}
            <View style={styles.photoCard}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoSymbol}>🔬</Text>
                <View style={styles.verifiedCheck}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>
              <Text style={styles.photoLabel}>Spore Detail</Text>
            </View>

            {/* Slot 4: Add Button or 4th photo */}
            {photoCount < 4 ? (
              <Pressable style={styles.addPhotoCard} onPress={handleAddPhoto}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>+ Add</Text>
                <Text style={styles.maxPhotoText}>Max 4</Text>
              </Pressable>
            ) : (
              <View style={styles.photoCard}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoSymbol}>🔎</Text>
                  <View style={styles.verifiedCheck}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                </View>
                <Text style={styles.photoLabel}>Canopy</Text>
              </View>
            )}
          </View>
        </View>

        {/* Primary Diagnosis Result Card */}
        <View style={[styles.diagnosisCard, isLowConfidence && styles.diagnosisCardWarning]}>
          <View style={[styles.cardAccentLine, isLowConfidence && styles.cardAccentWarning]} />

          {/* Severity & Confidence Badges */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.severityBadge,
                isLowConfidence && { backgroundColor: '#FFE0B2' },
              ]}>
              <Text style={styles.severityIcon}>{isLowConfidence ? '⚠️' : '🚨'}</Text>
              <Text
                style={[
                  styles.severityText,
                  isLowConfidence && { color: Colors.light.accent },
                ]}>
                {isLowConfidence ? 'MODERATE SEVERITY • DA REVIEW' : 'HIGH SEVERITY • URGENT'}
              </Text>
            </View>

            <View
              style={[
                styles.confidenceBadge,
                isLowConfidence && { backgroundColor: '#FFE0B2' },
              ]}>
              <Text
                style={[
                  styles.confidenceText,
                  isLowConfidence && { color: Colors.light.accent },
                ]}>
                {confidencePct}% Match
              </Text>
            </View>
          </View>

          {/* Disease Heading (Bilingual English & Amharic) */}
          <View style={styles.diseaseHeader}>
            <Text style={styles.diseaseEn}>
              {isLowConfidence
                ? 'Northern Corn Leaf Blight (Suspected)'
                : 'Wheat Stem Rust'}
            </Text>
            <Text style={styles.diseaseAm}>
              {isLowConfidence ? 'የበቆሎ ቅጠል ሰደድ በሽታ' : 'የስንዴ ቢጫ ዝገት'}
            </Text>
            <Text style={styles.diseasePathotype}>
              {isLowConfidence
                ? 'Exserohilum turcicum • Low Optical Clarity'
                : 'Puccinia graminis f. sp. tritici • Pathotype Identified'}
            </Text>
          </View>

          {/* Visual Pathology Snippet */}
          <View style={styles.pathologySnippet}>
            <View style={styles.pathologyIconBox}>
              <Text style={styles.pathologyIcon}>🦠</Text>
            </View>
            <View style={styles.pathologyTextCol}>
              <Text style={styles.pathologyTitle}>
                {isLowConfidence ? 'Flagged for DA Physical Review (DIAG-6)' : 'Aggressive Spore Cycle'}
              </Text>
              <Text style={styles.pathologyDesc}>
                {isLowConfidence
                  ? 'Optical glare and dust residue on lower canopy prevented automatic certification. Assigned to DA Bekele Tola.'
                  : 'High 7-day humidity (45mm rain) accelerating spore dispersion across Dega microclimate. Intervention within 48h recommended.'}
              </Text>
            </View>
          </View>

          {/* Audio Readout Action (Primary Tactile Button) */}
          <Pressable
            style={[styles.audioReadoutBtn, audioPlaying && styles.audioReadoutBtnActive]}
            onPress={handlePlayAudio}>
            <View style={styles.audioReadoutLeft}>
              <View style={styles.audioSpeakerCircle}>
                <Text style={styles.audioSpeakerIcon}>🔊</Text>
              </View>
              <View>
                <Text style={styles.audioReadoutTitle}>የመፍትሄ ሃሳቡን አዳምጥ</Text>
                <Text style={styles.audioReadoutSub}>
                  Listen to Audio Prescription (Amharic / Oromo)
                </Text>
              </View>
            </View>
            <Text style={styles.audioPlayArrow}>▶</Text>
          </Pressable>

          {/* Test toggle for low confidence */}
          <Pressable
            style={styles.simulateConfidenceBtn}
            onPress={handleSimulateLowConfidence}>
            <Text style={styles.simulateConfidenceText}>
              🔬 Test DIAG-6 Low Confidence Review Trigger
            </Text>
          </Pressable>
        </View>

        {/* Pesticide Safety Filtered Treatment Prescription Card */}
        <View style={styles.prescriptionCard}>
          <View style={styles.prescriptionHeader}>
            <View style={styles.prescHeaderLeft}>
              <View style={styles.prescIconBox}>
                <Text style={styles.prescIcon}>🧪</Text>
              </View>
              <View>
                <Text style={styles.prescTitle}>Certified Prescription</Text>
                <Text style={styles.prescSubtitle}>SRS DIAG-4 / DIAG-5 Verified</Text>
              </View>
            </View>
            <View style={styles.moaBadge}>
              <Text style={styles.moaBadgeText}>MoA Listed</Text>
            </View>
          </View>

          {/* Product Title */}
          <View style={styles.productBox}>
            <Text style={styles.productTag}>MOA REGISTERED SYSTEMIC FUNGICIDE</Text>
            <Text style={styles.productBrand}>
              {primaryPrescription?.brandName || 'Tilt 250 EC'} ({primaryPrescription?.activeIngredient || 'Propiconazole 250 g/L'})
            </Text>
            <Text style={styles.productReg}>
              Reg #: {primaryPrescription?.registrationNumber || 'MoA-ET/1042'} • Class II (Cautionary)
            </Text>
          </View>

          {/* Prescription Key Parameters Mosaic */}
          <View style={styles.mosaicRow}>
            <View style={styles.mosaicCard}>
              <Text style={styles.mosaicLabel}>🧪 Verified Dosage</Text>
              <Text style={styles.mosaicValue}>
                {primaryPrescription?.dosagePerHa || '0.5 L / Ha'}
              </Text>
              <Text style={styles.mosaicSub}>Dilute in 200 Liters clean water</Text>
            </View>

            <View style={styles.mosaicCard}>
              <Text style={styles.mosaicLabel}>⏳ Harvest Safety (PHI)</Text>
              <Text style={[styles.mosaicValue, { color: Colors.light.accent }]}>
                {primaryPrescription?.safetyIntervalDays || 30} Days
              </Text>
              <Text style={styles.mosaicSub}>Do not harvest before 30d window</Text>
            </View>
          </View>

          {/* Mandatory PPE Checklist */}
          <View style={styles.ppeCard}>
            <Text style={styles.ppeTitle}>⚠️ Mandatory Personal Protection (PPE)</Text>
            <View style={styles.ppeRow}>
              <View style={styles.ppeItem}>
                <Text style={styles.ppeItemIcon}>😷</Text>
                <Text style={styles.ppeItemLabel}>Protective Mask</Text>
              </View>
              <View style={styles.ppeItem}>
                <Text style={styles.ppeItemIcon}>🧤</Text>
                <Text style={styles.ppeItemLabel}>Rubber Gloves</Text>
              </View>
              <View style={styles.ppeItem}>
                <Text style={styles.ppeItemIcon}>🥾</Text>
                <Text style={styles.ppeItemLabel}>Rubber Boots</Text>
              </View>
            </View>
            <Text style={styles.ppeNote}>
              Apply early morning before wind picks up. Wash equipment at least 30m away from municipal drinking trenches.
            </Text>
          </View>

          {/* Zero Unregistered Disclaimer */}
          <View style={styles.zeroDisclaimer}>
            <Text style={styles.zeroIcon}>✓</Text>
            <Text style={styles.zeroText}>
              Zero unregistered chemicals policy enforced: Only Ethiopian Ministry of Agriculture certified lots shown.
            </Text>
          </View>

          {/* Action button to Certified Inputs Directory */}
          <Pressable
            style={styles.findDealersBtn}
            onPress={() => onNavigate?.('CertifiedInputs')}>
            <Text style={styles.findDealersBtnText}>
              🛒 Find Certified Local Dealers (የተፈቀደላቸው አከፋፋዮች)
            </Text>
          </Pressable>
        </View>

        {/* 3-Year Crop Rotation Plan (DIAG-8) */}
        <View style={styles.rotationCard}>
          <Text style={styles.rotationHeading}>3-Year Crop Rotation Strategy (DIAG-8)</Text>
          <View style={styles.rotationContent}>
            <Text style={styles.rotationCrop}>Recommended Next Crop: Chickpea (Legume)</Text>
            <Text style={styles.rotationDesc}>
              Breaks cereal fungal spore cycle. Naturally fixes up to 60 kg/ha atmospheric nitrogen in vertisol beds.
            </Text>
          </View>
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
  telemetryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  telemetryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  telemetryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brainIcon: {
    fontSize: 14,
  },
  telemetryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  geoMatchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    gap: 4,
  },
  geoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  geoMatchedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  telemetryCol: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.two,
  },
  colLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  colValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  colSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  photoSection: {
    marginBottom: Spacing.four,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  photoSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  photoCard: {
    flex: 1,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  photoSymbol: {
    fontSize: 24,
  },
  verifiedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  photoLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  addPhotoCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  addPhotoIcon: {
    fontSize: 20,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 2,
  },
  maxPhotoText: {
    fontSize: 9,
    color: Colors.light.textMuted,
  },
  diagnosisCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  diagnosisCardWarning: {
    borderColor: '#FFE0B2',
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.light.danger,
  },
  cardAccentWarning: {
    backgroundColor: Colors.light.accent,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDAD6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  severityIcon: {
    fontSize: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.danger,
  },
  confidenceBadge: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  diseaseHeader: {
    marginBottom: Spacing.three,
  },
  diseaseEn: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  diseaseAm: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.accent,
    marginTop: 2,
  },
  diseasePathotype: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  pathologySnippet: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.two,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  pathologyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathologyIcon: {
    fontSize: 20,
  },
  pathologyTextCol: {
    flex: 1,
  },
  pathologyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  pathologyDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  audioReadoutBtn: {
    backgroundColor: '#FFDBCF',
    borderRadius: 10,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  audioReadoutBtnActive: {
    backgroundColor: '#FFB59A',
  },
  audioReadoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  audioSpeakerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C2200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioSpeakerIcon: {
    fontSize: 18,
  },
  audioReadoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C2200',
  },
  audioReadoutSub: {
    fontSize: 11,
    color: '#6C2200',
    opacity: 0.9,
  },
  audioPlayArrow: {
    fontSize: 18,
    color: '#6C2200',
    fontWeight: '700',
  },
  simulateConfidenceBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  simulateConfidenceText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textDecorationLine: 'underline',
  },
  prescriptionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  prescHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  prescIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.light.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescIcon: {
    fontSize: 18,
  },
  prescTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  prescSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  moaBadge: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  moaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  productBox: {
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
  },
  productTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  productBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  productReg: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  mosaicRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  mosaicCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.two,
  },
  mosaicLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  mosaicValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
    marginTop: 2,
  },
  mosaicSub: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  ppeCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  ppeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  ppeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  ppeItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: Spacing.two,
    alignItems: 'center',
  },
  ppeItemIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  ppeItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  ppeNote: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    lineHeight: 15,
  },
  zeroDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    padding: Spacing.two,
    borderRadius: 6,
    marginBottom: Spacing.three,
  },
  zeroIcon: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  zeroText: {
    fontSize: 11,
    color: Colors.light.primary,
    flex: 1,
  },
  findDealersBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  findDealersBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rotationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  rotationHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  rotationContent: {
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: 8,
  },
  rotationCrop: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  rotationDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
