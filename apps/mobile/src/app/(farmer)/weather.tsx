import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sun, CloudRain, Wind, Droplets, MapPin, Volume2 } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { audioService } from '@/services/audio';

export default function WeatherScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState('Boku Shenen Kebele Center');

  const days = [
    { day: 'Monday (Today)', tempMax: '24°C', tempMin: '12°C', rainPct: '20%', rainMm: '1.2 mm', wind: '8 km/h', humidity: '55%' },
    { day: 'Tuesday', tempMax: '22°C', tempMin: '11°C', rainPct: '65%', rainMm: '14.5 mm', wind: '12 km/h', humidity: '78%' },
    { day: 'Wednesday', tempMax: '21°C', tempMin: '10°C', rainPct: '70%', rainMm: '18.0 mm', wind: '15 km/h', humidity: '82%' },
    { day: 'Thursday', tempMax: '23°C', tempMin: '11°C', rainPct: '30%', rainMm: '3.0 mm', wind: '10 km/h', humidity: '60%' },
    { day: 'Friday', tempMax: '25°C', tempMin: '13°C', rainPct: '10%', rainMm: '0.0 mm', wind: '7 km/h', humidity: '50%' },
    { day: 'Saturday', tempMax: '26°C', tempMin: '14°C', rainPct: '5%', rainMm: '0.0 mm', wind: '6 km/h', humidity: '45%' },
    { day: 'Sunday', tempMax: '25°C', tempMin: '13°C', rainPct: '15%', rainMm: '0.5 mm', wind: '8 km/h', humidity: '52%' },
  ];

  const handlePlayWeeklySummary = () => {
    audioService.speak(
      'Weekly agricultural advisory: Light rainfall expected today. Moderate to heavy showers on Tuesday and Wednesday reaching 18 millimeters. Chemical spraying should be completed immediately or postponed until Thursday.',
      language
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{t('weather.forecast')}</Text>
          <View style={styles.locationPill}>
            <MapPin size={14} color="#16A34A" />
            <Text style={styles.locationText}>{selectedLocation}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.audioSummaryBtn} onPress={handlePlayWeeklySummary}>
          <Volume2 size={18} color="#FFFFFF" />
          <Text style={styles.audioSummaryText}>Listen Summary</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={styles.decisionBanner}
          onPress={() => router.push('/weather/farm-or-not')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.decisionTitle}>{t('weather.farmOrNot')} →</Text>
            <Text style={styles.decisionSub}>Check plowing, spraying & dry harvesting windows</Text>
          </View>
        </TouchableOpacity>

        {days.map((d, idx) => (
          <View key={idx} style={[styles.dayCard, idx === 0 && styles.todayCard]}>
            <View style={styles.dayHeader}>
              <View style={styles.dayTitleRow}>
                {parseInt(d.rainPct) > 50 ? (
                  <CloudRain size={22} color="#2563EB" />
                ) : (
                  <Sun size={22} color="#D97706" />
                )}
                <Text style={styles.dayName}>{d.day}</Text>
              </View>
              <Text style={styles.tempSpan}>
                {d.tempMax} / <Text style={styles.tempMin}>{d.tempMin}</Text>
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Droplets size={14} color="#2563EB" />
                <Text style={styles.metricText}>
                  {d.rainPct} ({d.rainMm})
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Wind size={14} color="#566153" />
                <Text style={styles.metricText}>{d.wind}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricText}>Humidity: {d.humidity}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
    gap: 12,
  },
  titleWrapper: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A14',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '700',
  },
  audioSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  audioSummaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
  },
  decisionBanner: {
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#86EFAC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  decisionSub: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    elevation: 2,
  },
  todayCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#151A14',
  },
  tempSpan: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
  },
  tempMin: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
    paddingTop: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#566153',
  },
});

