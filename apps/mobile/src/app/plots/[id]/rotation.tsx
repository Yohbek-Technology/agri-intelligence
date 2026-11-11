import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Info, Compass } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { audioService } from '@/services/audio';

export default function RotationPlanScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const rotationPlan = [
    {
      season: 'Season 1 (Upcoming Meher)',
      crop: 'Chickpea / Faba Bean (Legume)',
      score: '96 / 100',
      reason: 'Breaks cereal monoculture, fixes atmospheric nitrogen in Koticha soil, and suppresses root rot pathogens.',
    },
    {
      season: 'Season 2 (Next Year Meher)',
      crop: 'Wheat (Kakaba / Dega)',
      score: '92 / 100',
      reason: 'Capitalizes on residual nitrogen fixed by previous legume cycle, leading to an estimated 18% yield boost.',
    },
    {
      season: 'Season 3 (Following Year)',
      crop: 'Teff (Quncho)',
      score: '88 / 100',
      reason: 'Deep root utilization of residual nutrients, minimal pest carryover from wheat, ideal soil restructuring.',
    },
  ];

  const handleReadPlan = () => {
    audioService.speak(
      'Three-year rotation advisory: Season 1 plant Chickpea to restore nitrogen. Season 2 follow with certified Wheat. Season 3 plant Teff for balanced nutrient extraction.',
      language
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3-Year Crop Rotation Plan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <Compass size={28} color="#16A34A" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Soil Health & Nitrogen Preservation</Text>
            <Text style={styles.bannerSub}>
              Continuous cereal cropping on Black Vertisol depletes nitrogen and accumulates soil-borne pests.
            </Text>
          </View>
        </View>

        {rotationPlan.map((r, idx) => (
          <View key={idx} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.seasonTitle}>{r.season}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{r.score}</Text>
              </View>
            </View>

            <Text style={styles.cropName}>{r.crop}</Text>
            <Text style={styles.reasonText}>{r.reason}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.basisButton}>
          <Info size={16} color="#566153" />
          <Text style={styles.basisText}>View Agronomic Rule Basis</Text>
        </TouchableOpacity>
      </ScrollView>

      <VoiceBar
        title="3-Year Rotation Plan"
        readAloudText="Three-year rotation plan for soil nitrogen restoration."
        onVoiceCommand={handleReadPlan}
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
    paddingBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  bannerSub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#566153',
  },
  scoreBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  cropName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  basisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    borderRadius: 12,
    marginTop: 8,
  },
  basisText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#566153',
  },
});

