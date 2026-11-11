import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Volume2, ShieldCheck, CheckCircle2, Droplets, Package } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { audioService } from '@/services/audio';

export default function StorageGuidanceScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const handleReadGuide = () => {
    audioService.speak(
      'Post-harvest storage directive: Dry your grain until moisture is below 13 percent before packing. Use triple-layer hermetic PICS bags to asphyxiate weevils without chemicals.',
      language
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post-Harvest Storage Guide</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.audioAction} onPress={handleReadGuide}>
          <Volume2 size={20} color="#16A34A" />
          <Text style={styles.audioActionText}>Listen Post-Harvest Voice Instructions</Text>
        </TouchableOpacity>

        {/* Moisture Test Guide */}
        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <Droplets size={24} color="#2563EB" />
            <Text style={styles.cardTitle}>1. Grain Moisture Testing</Text>
          </View>
          <Text style={styles.cardBody}>
            Ensure your wheat or teff grain moisture content is below 13% before bagging to prevent post-harvest fungal aflatoxin accumulation.
          </Text>
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Salt Jar Test (Zero Equipment):</Text>
            <Text style={styles.stepText}>
              1. Take dry table salt and mix with grain in a clean glass jar.{'\n'}
              2. Shake for 10 minutes.{'\n'}
              3. If salt sticks to jar walls, moisture is above 14% and grain requires further sun-drying.
            </Text>
          </View>
        </View>

        {/* Hermetic PICS Bag Protocol */}
        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <Package size={24} color="#16A34A" />
            <Text style={styles.cardTitle}>2. Hermetic Storage (PICS Bags)</Text>
          </View>
          <Text style={styles.cardBody}>
            Purdue Improved Crop Storage (PICS) bags use 3 airtight layers to suffocate storage insects without toxic chemical dusts.
          </Text>
          <View style={styles.stepBox}>
            <Text style={styles.stepTitle}>Correct Tying Sequence:</Text>
            <Text style={styles.stepText}>
              1. Fill inner polyethylene liner and twist tightly.{'\n'}
              2. Tie inner liner with string.{'\n'}
              3. Repeat for middle layer and outer woven bag.
            </Text>
          </View>
        </View>
      </ScrollView>
      <VoiceBar
        title="Storage Guidance"
        readAloudText="Post-harvest storage instructions for moisture testing and hermetic bags."
        onVoiceCommand={handleReadGuide}
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
  audioAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  audioActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
  },
  cardBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  stepBox: {
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2DBD0',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#566153',
    lineHeight: 18,
  },
});

