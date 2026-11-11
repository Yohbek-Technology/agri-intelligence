import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Volume2, AlertOctagon, MessageSquare, Radio } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { audioService } from '@/services/audio';

export default function AnnouncementsNewsfeedScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const news = [
    {
      id: 'ann-1',
      title: 'Emergency Quarantine: Fall Armyworm',
      type: 'EMERGENCY',
      date: 'Today, 08:00 AM',
      body: 'Confirmed migratory swarm detected moving north-east through Boku Shenen. All maize and sorghum growers are directed to inspect leaf funnels.',
      smsSent: true,
      audioText: 'Emergency Quarantine alert: Fall armyworm swarm detected in Boku Shenen. Inspect your fields immediately.',
    },
    {
      id: 'ann-2',
      title: 'Subsidized NPS Fertilizer Delivery at Depot',
      type: 'INPUT_AVAILABILITY',
      date: 'Yesterday',
      body: 'Cooperative Union central depot received 200 metric tonnes of certified NPS fertilizer. Distribution commences Wednesday.',
      smsSent: true,
      audioText: 'Input availability notice: Subsidized NPS fertilizer has arrived at the central cooperative depot.',
    },
  ];

  const handleSpeak = (text: string) => {
    audioService.speak(text, language);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Official Bulletins</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {news.map((item) => {
          const isEmergency = item.type === 'EMERGENCY';
          return (
            <View
              key={item.id}
              style={[
                styles.card,
                isEmergency && styles.emergencyCard,
              ]}
            >
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.typeBadge,
                    isEmergency ? styles.emergencyBadge : styles.regularBadge,
                  ]}
                >
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.listenBtn}
                  onPress={() => handleSpeak(item.audioText)}
                >
                  <Volume2 size={16} color="#15803D" />
                  <Text style={styles.listenText}>Listen Broadcast</Text>
                </TouchableOpacity>

                {item.smsSent && (
                  <View style={styles.smsPill}>
                    <Radio size={12} color="#566153" />
                    <Text style={styles.smsText}>Dispatched via SMS</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <VoiceBar title="Official Bulletins" readAloudText="Official announcements from the City Agriculture Office." />
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  emergencyCard: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  emergencyBadge: {
    backgroundColor: '#DC2626',
  },
  regularBadge: {
    backgroundColor: '#16A34A',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 12,
    color: '#71717A',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
    paddingTop: 10,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  listenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  smsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smsText: {
    fontSize: 11,
    color: '#566153',
  },
});

