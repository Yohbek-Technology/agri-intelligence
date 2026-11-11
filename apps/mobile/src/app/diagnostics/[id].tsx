import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertTriangle, ShieldCheck, Volume2, Clock, CheckCircle } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { audioService } from '@/services/audio';

export default function DiagnosisResultScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const params = useLocalSearchParams();

  const diagnosis = {
    id: params.id || 'diag-1',
    pestName: 'Yellow Rust (Puccinia striiformis)',
    confidence: 0.94,
    severity: 'HIGH',
    needsReview: true,
    audioExplanation: 'Yellow rust fungal pustules identified on wheat leaves. Early chemical control recommended before flag leaf infection.',
    managementAdvice: 'Apply systemic fungicide at early infection stage. Spray during calm morning hours with adequate coverage.',
    approvedPesticides: [
      {
        name: 'Tilt 250 EC (Propiconazole)',
        dosage: '0.5 L/ha in 200L water',
        rainFree: '3 hours',
        safetyNotes: 'Wear mask and protective clothing. 14 days pre-harvest interval.',
        available: true,
      },
    ],
  };

  const handleSpeak = () => {
    audioService.speak(diagnosis.audioExplanation, language);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Diagnostic Result</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Pending DA Expert Review Badge (FR-AI-014) */}
        {diagnosis.needsReview && (
          <View style={styles.reviewBadge}>
            <Clock size={16} color="#92400E" />
            <Text style={styles.reviewBadgeText}>
              Pending DA Verification (High Severity Escalation)
            </Text>
          </View>
        )}

        {/* Diagnosis Header */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.pestName}>{diagnosis.pestName}</Text>
              <Text style={styles.confidenceText}>
                AI Match: {Math.round(diagnosis.confidence * 100)}% Confidence
              </Text>
            </View>
            <View style={styles.severityBadge}>
              <Text style={styles.severityText}>{diagnosis.severity}</Text>
            </View>
          </View>

          {/* Audio Explanation Button */}
          <TouchableOpacity style={styles.audioBtn} onPress={handleSpeak}>
            <Volume2 size={18} color="#15803D" />
            <Text style={styles.audioBtnText}>Listen Voice Explanation</Text>
          </TouchableOpacity>
        </View>

        {/* Cultural / Non-Chemical Management */}
        <Text style={styles.sectionTitle}>Cultural Management</Text>
        <View style={styles.adviceCard}>
          <Text style={styles.adviceText}>{diagnosis.managementAdvice}</Text>
        </View>

        {/* Registered & Locally Available Agrochemicals (BR-07) */}
        <Text style={styles.sectionTitle}>Locally Available Registered Agrochemicals</Text>
        {diagnosis.approvedPesticides.map((p, idx) => (
          <View key={idx} style={styles.pesticideCard}>
            <View style={styles.pesticideHeader}>
              <ShieldCheck size={20} color="#16A34A" />
              <Text style={styles.chemName}>{p.name}</Text>
            </View>

            <View style={styles.pesticideSpecs}>
              <Text style={styles.specLine}>
                <Text style={styles.specLabel}>Dosage: </Text>{p.dosage}
              </Text>
              <Text style={styles.specLine}>
                <Text style={styles.specLabel}>Rain-Free Hours: </Text>{p.rainFree}
              </Text>
              <Text style={styles.specLine}>
                <Text style={styles.specLabel}>Safety: </Text>{p.safetyNotes}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <VoiceBar
        title={diagnosis.pestName}
        readAloudText={`${diagnosis.pestName}. ${diagnosis.audioExplanation}`}
        onVoiceCommand={handleSpeak}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  scroll: {
    padding: 16,
    paddingBottom: 28,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  reviewBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pestName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  confidenceText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 2,
  },
  severityBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  audioBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
    marginVertical: 10,
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 14,
  },
  adviceText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  pesticideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#86EFAC',
    padding: 14,
    marginBottom: 10,
  },
  pesticideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151A14',
  },
  pesticideSpecs: {
    gap: 4,
  },
  specLine: {
    fontSize: 12,
    color: '#374151',
  },
  specLabel: {
    fontWeight: '700',
    color: '#566153',
  },
});

