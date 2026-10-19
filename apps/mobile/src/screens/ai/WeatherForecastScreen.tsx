import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function WeatherForecastScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>7-Day Agro-Weather Intelligence</Text>
          <Text style={styles.subtitle}>
            Bound to Plot GPS (8.5411° N, 39.2704° E) • Updated 1h ago (Cached)
          </Text>
        </View>

        {/* Current Observations Card (WEATH-1) */}
        <View style={styles.currentCard}>
          <View style={styles.currentTopRow}>
            <Text style={styles.currentTemp}>26°C</Text>
            <Text style={styles.weatherConditionIcon}>⛅</Text>
          </View>
          <Text style={styles.conditionText}>Partly Cloudy • Adama Extension Zone</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Rain Prob</Text>
              <Text style={styles.metricVal}>15%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricVal}>8 km/h</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricVal}>62%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Soil Moisture</Text>
              <Text style={styles.metricVal}>Adequate</Text>
            </View>
          </View>
        </View>

        {/* Farm or Not Decision Indicators (WEATH-3, WEATH-4, WEATH-5) */}
        <Text style={styles.sectionHeading}>"Farm or Not" Activity Decisions</Text>

        <VisualCard
          icon="🚜"
          title="Plowing Readiness: GO"
          subtitle="Soil moisture is within optimal range for Koticha vertisol. No heavy compaction."
          value="Go (Optimal)"
          badgeText="Plow Ready"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="💧"
          title="Chemical Spraying: WAIT"
          subtitle="Rain forecast within 6 hours. Wash-off risk high (pre-harvest interval compromised)."
          value="Wait (Wash-off)"
          badgeText="Rain Alert"
          badgeColor={Colors.light.warning}
          badgeBackground={Colors.light.warningLight}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="🌾"
          title="Harvest Window: NO"
          subtitle="Precipitation probability exceeds 20% threshold over the next 48h. Risk of mold."
          value="No (Rot Risk)"
          badgeText="Postpone"
          badgeColor={Colors.light.danger}
          badgeBackground={Colors.light.dangerLight}
          onAudioPress={() => {}}
        />

        {/* 7-Day Daily Forecast List (WEATH-2) */}
        <Text style={styles.sectionHeading}>7-Day Daily Breakdown</Text>
        {[
          { day: 'Mon, Oct 19', temp: '26° / 14°', rain: '10%', icon: '☀️' },
          { day: 'Tue, Oct 20', temp: '25° / 15°', rain: '15%', icon: '⛅' },
          { day: 'Wed, Oct 21', temp: '23° / 16°', rain: '65% (18mm)', icon: '🌧️' },
          { day: 'Thu, Oct 22', temp: '22° / 15°', rain: '70% (22mm)', icon: '🌧️' },
          { day: 'Fri, Oct 23', temp: '24° / 14°', rain: '30%', icon: '⛅' },
          { day: 'Sat, Oct 24', temp: '25° / 13°', rain: '10%', icon: '☀️' },
          { day: 'Sun, Oct 25', temp: '26° / 14°', rain: '5%', icon: '☀️' },
        ].map((item) => (
          <View key={item.day} style={styles.dailyRow}>
            <Text style={styles.dailyDay}>{item.day}</Text>
            <Text style={styles.dailyIcon}>{item.icon}</Text>
            <Text style={styles.dailyRain}>{item.rain}</Text>
            <Text style={styles.dailyTemp}>{item.temp}</Text>
          </View>
        ))}
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
  currentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.four,
    marginVertical: Spacing.three,
  },
  currentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentTemp: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.light.text,
  },
  weatherConditionIcon: {
    fontSize: 40,
  },
  conditionText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radii.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.one,
  },
  dailyDay: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    width: 90,
  },
  dailyIcon: {
    fontSize: 20,
  },
  dailyRain: {
    fontSize: 13,
    color: Colors.light.info,
    fontWeight: '600',
  },
  dailyTemp: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
