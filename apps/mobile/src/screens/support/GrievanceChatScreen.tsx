import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/theme/colors'
import { Spacing, Radii, Shadows } from '@/theme/tokens'
import {
  grievanceService,
  type GrievanceRecord,
  type GrievanceMessageItem,
} from '@/services/api/grievance-service'

interface GrievanceChatScreenProps {
  grievanceId?: string
  onNavigateBack?: () => void
}

export function GrievanceChatScreen({
  grievanceId = 'g-409-mock-uuid',
  onNavigateBack,
}: GrievanceChatScreenProps) {
  const [grievance, setGrievance] = useState<GrievanceRecord | null>(null)
  const [messages, setMessages] = useState<GrievanceMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [textInput, setTextInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isPlayingFarmerVoice, setIsPlayingFarmerVoice] = useState(false)
  const [isPlayingDAVoice, setIsPlayingDAVoice] = useState(false)
  const [activeLang, setActiveLang] = useState<'am' | 'om'>('am')
  const [photosCount, setPhotosCount] = useState(1)

  const pulseAnim = useRef(new Animated.Value(1)).current
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadGrievanceData()
  }, [grievanceId])

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  const loadGrievanceData = async () => {
    setIsLoading(true)
    try {
      const [detail, msgs] = await Promise.all([
        grievanceService.fetchGrievanceDetail(grievanceId),
        grievanceService.fetchMessages(grievanceId),
      ])
      setGrievance(detail)
      setMessages(msgs)
    } catch {
      // Fallbacks inside service handle error gracefully
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Voice Record Hold
  const startRecording = () => {
    setIsRecording(true)
    setRecordingSeconds(0)
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1)
    }, 1000)
  }

  const stopRecordingAndSend = async () => {
    if (!isRecording) return
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    const duration = recordingSeconds || 3
    const newMsg = await grievanceService.sendMessage(grievanceId, {
      messageType: 'audio',
      audioMediaId: `audio-note-${Date.now()}`,
      textBody: `Follow-up voice recording (${duration}s)`,
      audioDurationSec: duration,
    })

    setMessages((prev) => [...prev, newMsg])
    Alert.alert(
      'Voice Note Recorded',
      `Voice message (${duration}s) captured in your selected language and submitted to the extension desk.`
    )
  }

  const handleSendTextMessage = async () => {
    if (!textInput.trim()) return
    const note = textInput.trim()
    setTextInput('')

    const newMsg = await grievanceService.sendMessage(grievanceId, {
      messageType: 'text',
      textBody: note,
    })
    setMessages((prev) => [...prev, newMsg])
  }

  const handleAddPhoto = () => {
    if (photosCount >= 3) {
      Alert.alert('Maximum Limit', 'A maximum of 3 evidence photos can be attached to a grievance.')
      return
    }
    setPhotosCount((c) => c + 1)
    Alert.alert('Photo Attached', `Evidence photo ${photosCount + 1}/3 attached to consultation.`)
  }

  const handleConfirmResolution = async () => {
    Alert.alert(
      'Confirm Resolution / ተፈትቷል',
      'Are you sure you want to mark this grievance as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm / አረጋግጥ',
          onPress: async () => {
            const updated = await grievanceService.confirmResolution(grievanceId)
            setGrievance(updated)
            Alert.alert('Resolved', 'Thank you! Grievance #G-409 marked as resolved.')
          },
        },
      ]
    )
  }

  const handleReopen = async () => {
    Alert.alert(
      'Reopen Ticket / ድጋሚ ክፈት',
      'Do you need to reopen this issue? You can reopen within 7 days of resolution.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reopen / ድጋሚ ክፈት',
          onPress: async () => {
            const updated = await grievanceService.reopenGrievance(grievanceId, 'Issue still persisting at depot')
            setGrievance(updated)
            Alert.alert('Ticket Reopened', 'Case reopened. The Adama Extension Desk has been notified.')
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading voice consultation...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* App Header with Back, Title, and Cloud Sync Chip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={onNavigateBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Active Voice Consultation
            </Text>
            <Text style={styles.headerSubtitle}>የድምፅ ምክክር</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.syncChip}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Cloud Active</Text>
          </View>
          <View style={styles.avatarButton}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Case Meta Card */}
        <View style={styles.caseCard}>
          <View style={styles.caseHeaderRow}>
            <View style={styles.caseCodeBadge}>
              <Text style={styles.caseCode}>#G-409</Text>
              <View style={styles.metaDot} />
              <Text style={styles.caseCategory}>
                Fertilizer Shortage / የማዳበሪያ እጥረት
              </Text>
            </View>
            <View style={[
              styles.statusPill,
              grievance?.status === 'resolved' && styles.statusPillResolved,
            ]}>
              <View style={[
                styles.pulsingStatusDot,
                grievance?.status === 'resolved' && styles.statusDotResolved,
              ]} />
              <Text style={styles.statusPillText}>
                {grievance?.status === 'resolved'
                  ? 'Resolved / ተፈትቷል'
                  : 'In Progress / በሂደት ላይ'}
              </Text>
            </View>
          </View>

          {/* Plot Telemetry Context Tag */}
          <View style={styles.plotContextTag}>
            <Text style={styles.plotIcon}>🌱</Text>
            <View style={styles.plotInfoWrap}>
              <Text style={styles.plotLabel}>Plot: </Text>
              <Text style={styles.plotValue} numberOfLines={1}>
                {grievance?.plotName || 'Lower Field (Teff - Koticha Soil) • Adama Woreda'}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Thread Timeline */}
        <View style={styles.threadContainer}>
          {/* Farmer Initial Message (You) */}
          <View style={styles.farmerMessageContainer}>
            <View style={styles.farmerMessageCard}>
              <View style={styles.msgHeader}>
                <View style={styles.senderWrap}>
                  <View style={styles.farmerAvatar}>
                    <Text style={styles.farmerAvatarIcon}>🎙️</Text>
                  </View>
                  <Text style={styles.senderName}>You (Farmer Alemayehu)</Text>
                </View>
                <Text style={styles.msgTimestamp}>Yesterday 4:15 PM</Text>
              </View>

              <Text style={styles.messageNoteText}>
                Audio Note: Urea Depot 2 out of stock / የዩሪያ አቅርቦት በመጋዘን 2 አልቋል
              </Text>

              {/* Voice Playback Card */}
              <View style={styles.voicePlaybackCard}>
                <Pressable
                  onPress={() => setIsPlayingFarmerVoice(!isPlayingFarmerVoice)}
                  style={styles.voicePlayBtn}
                  accessibilityLabel="Play farmer voice note"
                >
                  <Text style={styles.playBtnIcon}>
                    {isPlayingFarmerVoice ? '⏸' : '▶'}
                  </Text>
                </Pressable>

                <View style={styles.voicePlayerMeta}>
                  <View style={styles.voicePlayerTimes}>
                    <Text style={styles.timeElapsed}>
                      {isPlayingFarmerVoice ? '0:45' : '0:32'}
                    </Text>
                    <Text style={styles.timeTotal}>1:45 min</Text>
                  </View>

                  {/* Tactile Waveform Bars */}
                  <View style={styles.waveformContainer}>
                    {[12, 16, 24, 20, 12, 8, 20, 24, 16, 8, 20, 24, 16, 12, 20, 8, 16, 20, 12, 8, 16, 6].map((h, i) => (
                      <View
                        key={`bar-${i}`}
                        style={[
                          styles.waveformBar,
                          { height: h },
                          i < (isPlayingFarmerVoice ? 12 : 7) ? styles.waveformBarPlayed : styles.waveformBarPending,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Attachment Thumbnail */}
              <View style={styles.attachmentStrip}>
                <View style={styles.attachmentWrapper}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600',
                    }}
                    style={styles.attachmentThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.attachmentBadge}>
                    <Text style={styles.attachmentBadgeText}>📷 1 Photo</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* System Status Audit Event */}
          <View style={styles.auditEventContainer}>
            <View style={styles.auditPill}>
              <Text style={styles.auditIcon}>🔄</Text>
              <Text style={styles.auditText}>
                Status updated to In Progress by Officer Sisay • 2 hrs ago
              </Text>
            </View>
          </View>

          {/* DA Kebede Official Desk Response */}
          <View style={styles.daMessageContainer}>
            <View style={styles.daMessageCard}>
              <View style={styles.msgHeader}>
                <View style={styles.senderWrap}>
                  <View style={styles.daAvatar}>
                    <Text style={styles.daAvatarText}>KB</Text>
                  </View>
                  <View>
                    <Text style={styles.daSenderName}>DA Kebede Tadesse</Text>
                    <Text style={styles.daOfficeLabel}>Adama Extension Office</Text>
                  </View>
                </View>
                <Text style={styles.msgTimestamp}>10:45 AM</Text>
              </View>

              {/* DA Voice Response Card */}
              <View style={styles.daVoiceCard}>
                <Pressable
                  onPress={() => setIsPlayingDAVoice(!isPlayingDAVoice)}
                  style={styles.daPlayBtn}
                  accessibilityLabel="Play extension officer audio reply"
                >
                  <Text style={styles.daPlayIcon}>
                    {isPlayingDAVoice ? '⏸' : '🔊'}
                  </Text>
                </Pressable>
                <View style={styles.daVoiceMeta}>
                  <View style={styles.daVoiceHeader}>
                    <Text style={styles.daVoiceDuration}>
                      Voice Response (1:10 min)
                    </Text>
                    <Text style={styles.daListenLabel}>
                      {isPlayingDAVoice ? 'Playing... / እየተጫወተ ነው' : 'Listen / አዳምጥ'}
                    </Text>
                  </View>
                  <View style={styles.daProgressTrack}>
                    <View style={[styles.daProgressBar, { width: isPlayingDAVoice ? '75%' : '45%' }]} />
                  </View>
                </View>
              </View>

              {/* Transcribed Official Advisory */}
              <View style={styles.transcriptCard}>
                <View style={styles.transcriptHeader}>
                  <Text style={styles.transcriptIcon}>📖</Text>
                  <Text style={styles.transcriptLabel}>OFFICIAL TRANSCRIPT</Text>
                </View>
                <Text style={styles.transcriptBody}>
                  “A new truck delivery of 400 quintals NPS & Urea will reach Depot 2 by Thursday morning. We have reserved your 25kg allotment. Bring your farmer green booklet.”
                </Text>
              </View>

              {/* Secondary Local Language Audio Button */}
              <View style={styles.quickLanguageRow}>
                <Pressable
                  onPress={() => {
                    setActiveLang(activeLang === 'am' ? 'om' : 'am')
                    Alert.alert(
                      'Spoken Audio in Afaan Oromoo',
                      'Sagalee afaan Oromootiin dhaggeeffadhu: Xaa’oon Yuuriyaa fi NPS gaafa Guyyaa Kamisaa ganama dhiyaata.'
                    )
                  }}
                  style={styles.oromoListenBtn}
                >
                  <Text style={styles.oromoBtnIcon}>🎧</Text>
                  <Text style={styles.oromoBtnText}>Dhaggeeffadhu (Oromo)</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Action Status Buttons (Resolution Lifecycle) */}
        <View style={styles.lifecycleButtonsRow}>
          <Pressable
            onPress={handleReopen}
            style={styles.reopenButton}
          >
            <Text style={styles.reopenIcon}>🔄</Text>
            <Text style={styles.reopenText}>Reopen / ድጋሚ ክፈት</Text>
          </Pressable>

          <Pressable
            onPress={handleConfirmResolution}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmIcon}>✓</Text>
            <Text style={styles.confirmText}>Confirm Resolution / ተፈትቷል</Text>
          </Pressable>
        </View>

        {/* Bottom Voice Composer ("Voice Box") */}
        <View style={styles.voiceBoxContainer}>
          <View style={styles.voiceBoxHeader}>
            <View style={styles.voiceBoxTitleRow}>
              <Text style={styles.voiceBoxIcon}>🎙️</Text>
              <Text style={styles.voiceBoxTitle}>Add Follow-up / ምላሽ ይስጡ</Text>
            </View>
            <Text style={styles.maxTimeHint}>Max 3 mins</Text>
          </View>

          {/* Giant Tactile Recording Button */}
          <Pressable
            onPressIn={startRecording}
            onPressOut={stopRecordingAndSend}
            style={[
              styles.giantRecordButton,
              isRecording && styles.giantRecordButtonActive,
            ]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.recordMicIcon}>🎙️</Text>
            </Animated.View>
            <View style={styles.recordTextCol}>
              <Text style={styles.recordMainText}>
                {isRecording
                  ? `Recording Voice Note (${recordingSeconds}s)... Release to Send`
                  : 'Hold to Record Voice Message'}
              </Text>
              <Text style={styles.recordAmharicText}>
                {isRecording
                  ? 'ለመላክ እጅዎን ይልቀቁ'
                  : 'ድምፅ ለመቅረጽ ይጫኑ (የድምጽ መልእክት)'}
              </Text>
            </View>
          </Pressable>

          {/* Visual Attachment Strip & Keyboard Fallback Input */}
          <View style={styles.composerToolsRow}>
            {/* Camera / Photo Button */}
            <Pressable
              onPress={handleAddPhoto}
              style={styles.cameraToolBtn}
              accessibilityLabel="Add photos of receipts or field notices"
            >
              <Text style={styles.cameraToolIcon}>📷</Text>
            </Pressable>

            {/* Typed Text Input Fallback */}
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Type message note / ጽሑፍ..."
                placeholderTextColor={Colors.light.textTertiary}
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={handleSendTextMessage}
              />
              <Pressable
                onPress={handleSendTextMessage}
                style={styles.sendIconBtn}
                accessibilityLabel="Send message"
              >
                <Text style={styles.sendIcon}>➤</Text>
              </Pressable>
            </View>
          </View>

          {/* Sub-bar Status */}
          <View style={styles.subBarRow}>
            <Text style={styles.subBarText}>Photos: {photosCount}/3 attached</Text>
            <View style={styles.voiceReadyBadge}>
              <View style={styles.voiceReadyDot} />
              <Text style={styles.voiceReadyText}>Voice AI ready</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: '#41493E',
  },

  // Header
  header: {
    height: 64,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(249, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#E7EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#111C2D',
    fontWeight: '700',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111C2D',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#717A6D',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.full,
    gap: 6,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006E1C',
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006E1C',
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00450D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
  },

  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },

  // Case Meta Card
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  caseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  caseCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  caseCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00450D',
  },
  metaDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#717A6D',
  },
  caseCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111C2D',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 6,
  },
  statusPillResolved: {
    backgroundColor: '#E3F2FD',
  },
  pulsingStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#006E1C',
  },
  statusDotResolved: {
    backgroundColor: '#1976D2',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006E1C',
  },
  plotContextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    gap: Spacing.xs,
  },
  plotIcon: {
    fontSize: 16,
  },
  plotInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  plotValue: {
    fontSize: 13,
    color: '#41493E',
    flex: 1,
  },

  // Thread Timeline
  threadContainer: {
    gap: Spacing.md,
  },
  farmerMessageContainer: {
    width: '100%',
    paddingLeft: Spacing.md,
  },
  farmerMessageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  farmerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ACF4A4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmerAvatarIcon: {
    fontSize: 14,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111C2D',
  },
  msgTimestamp: {
    fontSize: 12,
    color: '#717A6D',
  },
  messageNoteText: {
    fontSize: 15,
    color: '#111C2D',
    lineHeight: 22,
  },
  voicePlaybackCard: {
    backgroundColor: '#F0F3FF',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  voicePlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00450D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  voicePlayerMeta: {
    flex: 1,
    gap: 4,
  },
  voicePlayerTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeElapsed: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00450D',
  },
  timeTotal: {
    fontSize: 12,
    color: '#717A6D',
  },
  waveformContainer: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  waveformBarPlayed: {
    backgroundColor: '#00450D',
  },
  waveformBarPending: {
    backgroundColor: '#CBD5E1',
  },
  attachmentStrip: {
    paddingTop: 4,
  },
  attachmentWrapper: {
    width: 130,
    height: 110,
    borderRadius: Radii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentThumbnail: {
    width: '100%',
    height: '100%',
  },
  attachmentBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  attachmentBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Audit event pill
  auditEventContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  auditPill: {
    backgroundColor: '#E7EEFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auditIcon: {
    fontSize: 13,
  },
  auditText: {
    fontSize: 12,
    color: '#41493E',
  },

  // DA response
  daMessageContainer: {
    width: '100%',
    paddingRight: Spacing.md,
  },
  daMessageCard: {
    backgroundColor: '#DEE8FF',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  daAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#91F78E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00450D',
  },
  daSenderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  daOfficeLabel: {
    fontSize: 11,
    color: '#41493E',
  },
  daVoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  daPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B5E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daPlayIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  daVoiceMeta: {
    flex: 1,
    gap: 6,
  },
  daVoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daVoiceDuration: {
    fontSize: 12,
    color: '#717A6D',
  },
  daListenLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006E1C',
  },
  daProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E7EEFF',
    overflow: 'hidden',
  },
  daProgressBar: {
    height: '100%',
    backgroundColor: '#006E1C',
    borderRadius: 3,
  },
  transcriptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    gap: 4,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transcriptIcon: {
    fontSize: 12,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#41493E',
  },
  transcriptBody: {
    fontSize: 14,
    color: '#111C2D',
    lineHeight: 20,
  },
  quickLanguageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  oromoListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#933100',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.full,
    gap: 6,
  },
  oromoBtnIcon: {
    fontSize: 13,
  },
  oromoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Lifecycle buttons
  lifecycleButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  reopenButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: '#DEE8FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...Shadows.sm,
  },
  reopenIcon: {
    fontSize: 16,
  },
  reopenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111C2D',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: '#006E1C',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...Shadows.sm,
  },
  confirmIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Voice Box Composer
  voiceBoxContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.md,
  },
  voiceBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceBoxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceBoxIcon: {
    fontSize: 16,
  },
  voiceBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111C2D',
  },
  maxTimeHint: {
    fontSize: 12,
    color: '#717A6D',
  },
  giantRecordButton: {
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: '#BA1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  giantRecordButtonActive: {
    backgroundColor: '#1B5E20',
  },
  recordMicIcon: {
    fontSize: 26,
  },
  recordTextCol: {
    flex: 1,
  },
  recordMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  recordAmharicText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  composerToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: 4,
  },
  cameraToolBtn: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#E7EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraToolIcon: {
    fontSize: 20,
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: Spacing.sm,
    paddingRight: 40,
    fontSize: 14,
    color: '#111C2D',
  },
  sendIconBtn: {
    position: 'absolute',
    right: 6,
    top: 7,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00450D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  subBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  subBarText: {
    fontSize: 12,
    color: '#717A6D',
  },
  voiceReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voiceReadyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#006E1C',
  },
  voiceReadyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006E1C',
  },
})
