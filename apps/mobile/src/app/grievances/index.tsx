import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Volume2, MessageSquare, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { audioService } from '@/services/audio';

export default function MyGrievancesScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const [grievances, setGrievances] = useState([
    {
      id: 'g-1',
      category: 'FERTILIZER_SHORTAGE',
      title: 'Urea Fertilizer Shortage Report',
      date: 'Yesterday, 14:30',
      status: 'IN_PROGRESS',
      statusColor: '#C78326',
      transcript: 'Cooperative in Boku Shenen stated no Urea delivery arrived.',
      hasAudioReply: true,
      replyText: 'City Agriculture Office dispatched a supplemental truck of 40 quintals to Boku Shenen depot this morning.',
      isUnread: true,
    },
    {
      id: 'g-2',
      category: 'PEST_OUTBREAK',
      title: 'Armyworm Swarm Spotted',
      date: 'Oct 28, 2024',
      status: 'RESOLVED',
      statusColor: '#16A34A',
      transcript: 'Armyworm caterpillars observed in boundary vegetation.',
      hasAudioReply: true,
      replyText: 'Field DA dispatched chemical spray squad. Containment completed.',
      isUnread: false,
    },
  ]);

  const handlePlayReply = (text: string, id: string) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isUnread: false } : g))
    );
    audioService.speak(text, language);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('voiceBox.myGrievances')}</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/(farmer)/voice-box')}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Record</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {grievances.map((g) => (
          <View key={g.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{g.title}</Text>
                  {g.isUnread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardDate}>{g.date}</Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: g.statusColor }]}>
                <Text style={styles.statusText}>{g.status}</Text>
              </View>
            </View>

            <Text style={styles.transcript}>{g.transcript}</Text>

            {g.replyText && (
              <View style={styles.replyBox}>
                <View style={styles.replyHeader}>
                  <MessageSquare size={16} color="#15803D" />
                  <Text style={styles.replyTitle}>City Office Response</Text>
                </View>
                <Text style={styles.replyBody}>{g.replyText}</Text>
                <TouchableOpacity
                  style={styles.playReplyBtn}
                  onPress={() => handlePlayReply(g.replyText, g.id)}
                >
                  <Volume2 size={16} color="#15803D" />
                  <Text style={styles.playReplyText}>Listen Voice Response</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <VoiceBar title={t('voiceBox.myGrievances')} readAloudText={t('voiceBox.myGrievances')} />
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
    justifyContent: 'space-between',
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  cardDate: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  transcript: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  replyBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  replyBody: {
    fontSize: 13,
    color: '#14532D',
    lineHeight: 18,
  },
  playReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  playReplyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
});

