import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { FarmOrNotCard } from '@/components/FarmOrNotCard';

export default function FarmOrNotDecisionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('weather.farmOrNot')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>
          Operational farm decisions computed from 7-day weather forecast, soil moisture class, and chemical wash-off limits.
        </Text>

        <FarmOrNotCard
          activity="plowing"
          status="GO"
          title={t('weather.plowing')}
          reason="Soil moisture in Black Vertisol is currently in the Optimal class (22%). Safe to proceed with primary or secondary plowing."
          detail="Vertisol Soil Moisture: Optimal"
        />

        <FarmOrNotCard
          activity="spraying"
          status="WAIT"
          title={t('weather.spraying')}
          reason="High probability of heavy precipitation (14 mm) within the next 4 hours. Chemical wash-off risk is critical. Postpone until Thursday."
          detail="Wash-off Window: Violated"
        />

        <FarmOrNotCard
          activity="harvesting"
          status="GO"
          title={t('weather.harvesting')}
          reason="Relative humidity below 55% with calm winds. Safe window for dry harvesting and threshing without post-harvest mold risk."
          detail="Dry Harvesting Window: Open"
        />
      </ScrollView>
      <VoiceBar title={t('weather.farmOrNot')} readAloudText={t('weather.farmOrNot')} />
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
  subtitle: {
    fontSize: 13,
    color: '#566153',
    lineHeight: 18,
    marginBottom: 16,
  },
});

