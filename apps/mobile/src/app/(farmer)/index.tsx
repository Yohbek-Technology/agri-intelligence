import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, AlertOctagon, CloudRain, Sun, ChevronRight, MessageSquare } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { FarmOrNotCard } from '@/components/FarmOrNotCard';
import { VisualCard } from '@/components/VisualCard';
import { useAuth } from '@/providers/auth-provider';

export default function FarmerHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Greeting Banner */}
      <View style={styles.greetingSection}>
        <Text style={styles.welcomeText}>
          {t('common.appName')}
        </Text>
        <Text style={styles.farmerName}>
          {user?.name || 'Abebe Bikila'}
        </Text>
        <Text style={styles.locationText}>
          Kebele: Boku Shenen • Adama Zone
        </Text>
      </View>

      {/* Emergency Quarantine / Outbreak Alert Banner */}
      <TouchableOpacity
        style={styles.alertBanner}
        onPress={() => router.push('/announcements')}
        activeOpacity={0.85}
      >
        <AlertOctagon size={24} color="#DC2626" />
        <View style={styles.alertTextWrapper}>
          <Text style={styles.alertTitle}>Fall Armyworm Advisory</Text>
          <Text style={styles.alertSub}>3 outbreaks confirmed within 5 km of your plot</Text>
        </View>
        <ChevronRight size={20} color="#DC2626" />
      </TouchableOpacity>

      {/* 7-Day Weather Glance Strip */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('weather.forecast')}</Text>
        <TouchableOpacity onPress={() => router.push('/(farmer)/weather')}>
          <Text style={styles.seeAllText}>View 7 Days →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherStrip}>
        {[
          { day: 'Today', temp: '24°C', rain: '20%', icon: Sun },
          { day: 'Tomorrow', temp: '22°C', rain: '65%', icon: CloudRain },
          { day: 'Wed', temp: '21°C', rain: '70%', icon: CloudRain },
          { day: 'Thu', temp: '23°C', rain: '30%', icon: Sun },
          { day: 'Fri', temp: '25°C', rain: '10%', icon: Sun },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <View key={idx} style={[styles.weatherDayCard, idx === 0 && styles.activeDayCard]}>
              <Text style={styles.weatherDayText}>{item.day}</Text>
              <Icon size={24} color={idx === 0 ? '#16A34A' : '#566153'} style={styles.weatherIcon} />
              <Text style={styles.weatherTempText}>{item.temp}</Text>
              <Text style={styles.weatherRainText}>{item.rain} rain</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Today's Farm or Not Indicators */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('weather.farmOrNot')}</Text>
        <TouchableOpacity onPress={() => router.push('/weather/farm-or-not')}>
          <Text style={styles.seeAllText}>Details →</Text>
        </TouchableOpacity>
      </View>

      <FarmOrNotCard
        activity="plowing"
        status="GO"
        title={t('weather.plowing')}
        reason="Soil moisture in Black Vertisol is optimal (22%). Safe to plow today."
        detail="Optimal Vertisol Moisture"
      />

      <FarmOrNotCard
        activity="spraying"
        status="WAIT"
        title={t('weather.spraying')}
        reason="Heavy rain expected within 4 hours. Chemical wash-off risk is high."
        detail="Rain Wash-off Risk"
      />

      {/* Unread Grievance Updates & Notices */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('voiceBox.myGrievances')}</Text>
        <TouchableOpacity onPress={() => router.push('/grievances')}>
          <Text style={styles.seeAllText}>All →</Text>
        </TouchableOpacity>
      </View>

      <VisualCard
        title="Urea Fertilizer Shortage Report"
        subtitle="DA Worku replied with audio instructions • 2 hours ago"
        badge="In Progress"
        badgeColor="#C78326"
        icon={<MessageSquare size={24} color="#16A34A" />}
        onPress={() => router.push('/grievances')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  greetingSection: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  farmerName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#151A14',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#566153',
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  alertTextWrapper: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
  alertSub: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#151A14',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  weatherStrip: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  weatherDayCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    borderRadius: 16,
    padding: 12,
    width: 90,
    alignItems: 'center',
    marginRight: 8,
  },
  activeDayCard: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  weatherDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  weatherIcon: {
    marginVertical: 6,
  },
  weatherTempText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151A14',
  },
  weatherRainText: {
    fontSize: 11,
    color: '#566153',
    marginTop: 2,
  },
});

