import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function GrievanceChatScreen() {
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(1);
    } else {
      setIsRecording(false);
      Alert.alert(
        'Voice Grievance Recorded',
        'Audio note (45s) captured and encrypted. Category: Subsidized Fertilizer Shortage. Submitting to Adama Agriculture Desk.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Grievance Voice Box</Text>
          <Text style={styles.subtitle}>
            Submit spoken complaints or resource shortages. Two-way threaded audio communication with the city desk.
          </Text>
        </View>

        {/* Record New Grievance Section (GRIEV-1, GRIEV-2) */}
        <View style={styles.recorderCard}>
          <Text style={styles.recorderTitle}>Record Voice Complaint (Max 3 Minutes)</Text>
          <Text style={styles.recorderSubtitle}>
            Explain the issue in your language. Your plot centroid will be attached automatically.
          </Text>

          <Pressable
            onPress={toggleRecording}
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}>
            <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
            <Text style={styles.recordButtonText}>
              {isRecording ? `Recording... (${recordingSeconds}s) Tap to Stop` : 'Tap to Record Voice Note'}
            </Text>
          </Pressable>
        </View>

        {/* Active Ticket Thread (GRIEV-5, GRIEV-6) */}
        <Text style={styles.sectionHeading}>Active Grievance Thread #ETH-GRV-041</Text>
        <VisualCard
          icon="📦"
          title="Urea Fertilizer Depot Shortage"
          subtitle="Submitted 2026-08-10 • Category: Fertilizer/Seed Shortage"
          value="In Progress"
          badgeText="Assigned to DA"
          badgeColor={Colors.light.info}
          badgeBackground={Colors.light.infoLight}
        />

        {/* Two-Way Messages Thread (GRIEV-6) */}
        <View style={styles.threadContainer}>
          {/* Farmer Voice Message */}
          <View style={[styles.chatBubble, styles.farmerBubble]}>
            <Text style={styles.senderLabel}>You (Spoken Voice Note • 42s)</Text>
            <Pressable style={styles.audioPlayRow}>
              <Text style={styles.playIcon}>▶️</Text>
              <Text style={styles.audioDurationText}>Play Original Voice Recording</Text>
            </Pressable>
            <Text style={styles.msgTime}>Aug 10, 09:15 AM • Unmodified Human Audio</Text>
          </View>

          {/* Desk Officer Response */}
          <View style={[styles.chatBubble, styles.deskBubble]}>
            <Text style={styles.senderLabel}>DA Kebede (Adama Agriculture Desk)</Text>
            <Text style={styles.deskText}>
              "The regional depot received 200 quintals of Urea yesterday. Your primary cooperative depot will disburse stock starting Thursday morning."
            </Text>
            <Pressable style={styles.audioPlayRow}>
              <Text style={styles.playIcon}>🔊</Text>
              <Text style={styles.audioDurationText}>Listen to Spoken Readout (Gemini TTS)</Text>
            </Pressable>
            <Text style={styles.msgTime}>Aug 11, 02:30 PM • Read</Text>
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
    lineHeight: 18,
  },
  recorderCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    padding: Spacing.four,
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  recorderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  recorderSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  recordButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recordButtonActive: {
    backgroundColor: Colors.light.danger,
  },
  recordIcon: {
    fontSize: 20,
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  threadContainer: {
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
  chatBubble: {
    padding: Spacing.three,
    borderRadius: Radii.large,
    maxWidth: '90%',
  },
  farmerBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primarySubtle,
    borderBottomRightRadius: 2,
  },
  deskBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderBottomLeftRadius: 2,
  },
  senderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  deskText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  audioPlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.medium,
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  playIcon: {
    fontSize: 16,
  },
  audioDurationText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  msgTime: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: Spacing.one,
  },
});
