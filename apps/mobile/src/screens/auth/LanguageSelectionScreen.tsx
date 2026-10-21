import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, Shadows, TouchTargets } from '@/theme/tokens';
import type { SupportedLanguage } from '@/config/constants';
import { useVoice } from '@/context/VoiceContext';

export interface LanguageSelectionScreenProps {
  onSelectLanguage?: (lang: SupportedLanguage) => void;
  onOpenDaHelp?: () => void;
}

interface LanguageItem {
  code: SupportedLanguage;
  nativeTitle: string;
  englishTitle: string;
  description: string;
  listenLabel: string;
  listenSub: string;
  icon: string;
  audioPromptText: string;
  continueLabel: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    code: 'am',
    nativeTitle: 'አማርኛ',
    englishTitle: 'Amharic',
    description: 'የኢትዮጵያ ፌዴራል ቋንቋ',
    listenLabel: 'ድምፅ ያዳምጡ (Listen)',
    listenSub: 'Tap to listen • አዳምጥ',
    icon: '🌾',
    audioPromptText: 'እንኳን ወደ ግብርና ኢንተለጀንስ በደህና መጡ። ቋንቋዎን ይምረጡ እና በድምፅ መመሪያ ይቀጥሉ።',
    continueLabel: 'ቀጥል (Continue)',
  },
  {
    code: 'om',
    nativeTitle: 'Afaan Oromoo',
    englishTitle: 'Oromo',
    description: 'Qophii Qonnaa fi Gorsaa',
    listenLabel: 'Sagalee dhagayyadha',
    listenSub: 'Oromiffaan caqasi',
    icon: '🌱',
    audioPromptText: 'Baga nagaan dhuftan. Afaan keessan filadhaa sagalee fi afaaniin qonnaa keessan hordofaa.',
    continueLabel: 'Itti Fufi (Continue)',
  },
  {
    code: 'ti',
    nativeTitle: 'ትግርኛ',
    englishTitle: 'Tigrinya',
    description: 'ሕርሻን ምኽሪን ሓበሬታ',
    listenLabel: 'ድምፂ ስምዑ',
    listenSub: 'ብትግርኛ ስምዑ',
    icon: '🌿',
    audioPromptText: 'እንቋዕ ብደሓን መጻእኹም። ቋንቋኹም ምረፁ ኣብ ምሉእ እቲ ኣፕሊኬሽን ድምፂ ብምስማዕ ክትጥቀሙ ትኽእሉ ኢኹም።',
    continueLabel: 'ቀፅሉ (Continue)',
  },
  {
    code: 'en',
    nativeTitle: 'English',
    englishTitle: 'English',
    description: 'Agronomic Advisory & Extension DA',
    listenLabel: 'Listen in English',
    listenSub: 'Spoken prompt',
    icon: '🌐',
    audioPromptText: 'Welcome to Agricultural Intelligence. Select your language to use natural voice guidance throughout the app.',
    continueLabel: 'Continue to Sign-In',
  },
];

export function LanguageSelectionScreen({
  onSelectLanguage,
  onOpenDaHelp,
}: LanguageSelectionScreenProps) {
  const { language, setLanguage, speakText, stopSpeaking, isSpeaking } = useVoice();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language || 'am');
  const [activePlayingLang, setActivePlayingLang] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    if (!isSpeaking) {
      setActivePlayingLang(null);
    }
  }, [isSpeaking]);

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    setSelectedLang(code);
    await setLanguage(code);
  };

  const handlePlaySnippet = async (item: LanguageItem) => {
    if (activePlayingLang === item.code && isSpeaking) {
      stopSpeaking();
      setActivePlayingLang(null);
      return;
    }
    stopSpeaking();
    setActivePlayingLang(item.code);
    await speakText(item.audioPromptText, item.code);
  };

  const handlePlayAll = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setActivePlayingLang(null);
      return;
    }
    const current = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];
    setActivePlayingLang(current.code);
    await speakText(current.audioPromptText, current.code);
  };

  const handleContinue = async () => {
    stopSpeaking();
    await setLanguage(selectedLang);
    onSelectLanguage?.(selectedLang);
  };

  const currentItem = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Top Status Ribbon & Offline Readiness */}
        <View style={styles.topRibbon}>
          <View style={styles.offlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.offlineText}>Offline AI Voice Ready</Text>
          </View>
          <View style={styles.networkStatus}>
            <Text style={styles.networkIcon}>📶</Text>
            <Text style={styles.networkText}>2G / Direct Solar Mode</Text>
          </View>
        </View>

        {/* Animated Voice Prompt Card */}
        <View style={[styles.voicePromptCard, Shadows.card]}>
          <View style={styles.voicePromptHeader}>
            <View style={styles.micCircle}>
              <Text style={styles.micIcon}>🎙️</Text>
            </View>
            <View style={styles.voicePromptTextWrap}>
              <View style={styles.voicePromptTitleRow}>
                <Text style={styles.voicePromptTag}>Voice Guide • መመሪያ ድምፅ</Text>
                <Pressable
                  onPress={handlePlayAll}
                  style={({ pressed }) => [
                    styles.playAllButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text style={styles.playAllIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
                  <Text style={styles.playAllText}>{isSpeaking ? 'Stop' : 'Play All'}</Text>
                </Pressable>
              </View>
              <Text style={styles.voicePromptBody}>
                {selectedLang === 'om'
                  ? 'Afaan keessan filadhaa. Sagalee fi afaaniin qonnaa fi gorsa keessan hordofaa.'
                  : selectedLang === 'ti'
                  ? 'ቋንቋኹም ምረፁ። ኣብ ምሉእ እቲ ኣፕሊኬሽን ድምፂ ብምስማዕ ክትጥቀሙ ትኽእሉ ኢኹም።'
                  : selectedLang === 'en'
                  ? 'Choose your language. You can speak and listen to voice guides throughout the app.'
                  : 'ቋንቋዎን ይምረጡ። በመተግበሪያው ውስጥ በሙሉ የድምፅ መመሪያ ማዳመጥና ማውራት ይችላሉ።'}
              </Text>
              <Text style={styles.voicePromptHint}>
                Tap your language below to hear spoken guidance and speak back naturally.
              </Text>
            </View>
          </View>

          {/* Tactile Soundwave Visualization */}
          <View style={styles.soundwaveRow}>
            <View style={[styles.soundwaveBar, { height: 10, backgroundColor: Colors.light.primarySubtle }]} />
            <View style={[styles.soundwaveBar, { height: 20, backgroundColor: Colors.light.primary }]} />
            <View style={[styles.soundwaveBar, { height: 28, backgroundColor: Colors.light.primaryDark }]} />
            <View style={[styles.soundwaveBar, { height: 16, backgroundColor: Colors.light.primary }]} />
            <View style={[styles.soundwaveBar, { height: 24, backgroundColor: Colors.light.primarySubtle }]} />
            <View style={[styles.soundwaveBar, { height: 12, backgroundColor: Colors.light.primaryDark }]} />
            <Text style={styles.soundwaveLabel}>Amharic / Afaan Oromo / ትግርኛ / English</Text>
          </View>
        </View>

        {/* Onboarding Progress Context Indicator */}
        <View style={styles.stepContainer}>
          <View style={styles.stepLabelRow}>
            <Text style={styles.stepLabelPrimary}>ደረጃ 1 ከ 3 • Step 1 of 3</Text>
            <Text style={styles.stepLabelSecondary}>ቋንቋ ምረጡ (Language)</Text>
          </View>
          <View style={styles.stepBarTrack}>
            <View style={[styles.stepBarSegment, styles.stepBarActive]} />
            <View style={styles.stepBarSegment} />
            <View style={styles.stepBarSegment} />
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.titleSection}>
          <Text style={styles.headingTitle}>ይምረጡ / Choose Language</Text>
          <Text style={styles.headingSubtitle}>
            ትክክለኛውን ቋንቋ ይንኩ። ድምጹን ለመስማት የድምፅ ማዳመጫውን ይጫኑ።
          </Text>
        </View>

        {/* 4 Interactive High-Contrast Language Cards */}
        <View style={styles.cardsContainer}>
          {LANGUAGES.map((item) => {
            const isSelected = selectedLang === item.code;
            const isPlayingThis = activePlayingLang === item.code && isSpeaking;

            return (
              <Pressable
                key={item.code}
                onPress={() => handleSelectLanguage(item.code)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.englishTitle}`}
                style={({ pressed }) => [
                  styles.card,
                  Shadows.card,
                  isSelected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.cardMainRow}>
                  <View style={styles.cardLeft}>
                    <View style={styles.langIconBadge}>
                      <Text style={styles.langIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.langTitles}>
                      <View style={styles.nativeRow}>
                        <Text style={styles.langNativeText}>{item.nativeTitle}</Text>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>የተመረጠ</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.langEnglishText}>
                        {item.englishTitle} • {item.description}
                      </Text>
                    </View>
                  </View>

                  {/* Terracotta Audio Listen Trigger */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      void handlePlaySnippet(item);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Listen to ${item.englishTitle} prompt`}
                    style={({ pressed }) => [
                      styles.listenButton,
                      isPlayingThis && styles.listenButtonActive,
                      pressed && styles.buttonPressed,
                    ]}>
                    <Text style={styles.listenButtonIcon}>
                      {isPlayingThis ? '⏹️' : '🔊'}
                    </Text>
                  </Pressable>
                </View>

                {/* Bottom Listen Bar */}
                <View style={styles.cardListenBar}>
                  <View style={styles.listenBarLeft}>
                    <Text style={styles.listenEqIcon}>📶</Text>
                    <Text style={styles.listenBarTitle}>{item.listenLabel}</Text>
                  </View>
                  <Text style={styles.listenBarSub}>{item.listenSub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Agricultural Visual Affirmation Card */}
        <View style={styles.affirmationCard}>
          <View style={styles.affirmationIconBox}>
            <Text style={styles.affirmationIcon}>🌱</Text>
          </View>
          <View style={styles.affirmationContent}>
            <Text style={styles.affirmationTitle}>ለገበሬዎች እና የግብርና ኤክስቴንሽን</Text>
            <Text style={styles.affirmationSubtitle}>
              Tailored for smallholders & Development Agents in Tigray, Oromia, Amhara, and Sidama regions.
            </Text>
          </View>
        </View>

        {/* Bottom Persistent Tactile Action Block */}
        <View style={styles.bottomBlock}>
          {/* Active Audio Status Toast */}
          {isSpeaking && (
            <View style={styles.audioToast}>
              <View style={styles.audioToastLeft}>
                <Text style={styles.audioToastIcon}>🔊</Text>
                <Text style={styles.audioToastText}>ድምፅ በማጫወት ላይ... (Playing Audio)</Text>
              </View>
              <Pressable onPress={stopSpeaking} style={styles.toastStopButton}>
                <Text style={styles.toastStopText}>STOP</Text>
              </Pressable>
            </View>
          )}

          {/* Main Continue CTA (56dp standard height) */}
          <Pressable
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to Sign In"
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}>
            <View style={styles.continueLeft}>
              <Text style={styles.continueArrow}>➔</Text>
              <Text style={styles.continueLabel}>{currentItem.continueLabel}</Text>
            </View>
            <View style={styles.voiceSupportBadge}>
              <Text style={styles.voiceSupportIcon}>🎙️</Text>
              <Text style={styles.voiceSupportText}>ድምፅ ድጋፍ</Text>
            </View>
          </Pressable>

          {/* Sub-Action DA Help */}
          <Pressable
            onPress={onOpenDaHelp}
            style={({ pressed }) => [
              styles.daHelpButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.daHelpIcon}>🤝</Text>
            <Text style={styles.daHelpText}>
              የልማት ጣቢያ ሰራተኛ (DA) እገዛ ይፈልጋሉ? Need DA assistance?
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  topRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 6,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  networkIcon: {
    fontSize: 14,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  voicePromptCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  voicePromptHeader: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  micCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 22,
  },
  voicePromptTextWrap: {
    flex: 1,
  },
  voicePromptTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voicePromptTag: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  playAllIcon: {
    fontSize: 12,
  },
  playAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primaryDark,
  },
  voicePromptBody: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    lineHeight: 20,
    marginTop: 2,
  },
  voicePromptHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  soundwaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  soundwaveBar: {
    width: 5,
    borderRadius: 3,
  },
  soundwaveLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  stepContainer: {
    marginBottom: Spacing.four,
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepLabelPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  stepLabelSecondary: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  stepBarTrack: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBarSegment: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
  },
  stepBarActive: {
    backgroundColor: Colors.light.primary,
  },
  titleSection: {
    marginBottom: Spacing.four,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
  },
  headingSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardsContainer: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  cardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FAFDF8',
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  langIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langIconText: {
    fontSize: 22,
  },
  langTitles: {
    flex: 1,
  },
  nativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langNativeText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  selectedBadge: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primaryDark,
  },
  langEnglishText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  listenButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFDBCE', // Terracotta-fixed tone
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  listenButtonActive: {
    backgroundColor: '#FF6F00',
  },
  listenButtonIcon: {
    fontSize: 20,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  cardListenBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radii.medium,
  },
  listenBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listenEqIcon: {
    fontSize: 14,
  },
  listenBarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A2D00',
  },
  listenBarSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: Radii.card,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  affirmationIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.medium,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationIcon: {
    fontSize: 24,
  },
  affirmationContent: {
    flex: 1,
  },
  affirmationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  affirmationSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBlock: {
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  audioToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#933100',
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: Radii.card,
    marginBottom: 4,
  },
  audioToastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  audioToastIcon: {
    fontSize: 16,
  },
  audioToastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  toastStopButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toastStopText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFDBCE',
    textDecorationLine: 'underline',
  },
  continueButton: {
    height: TouchTargets.primaryButton, // 56dp
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    ...Shadows.card,
  },
  continueButtonPressed: {
    backgroundColor: Colors.light.primaryHover,
  },
  continueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  continueLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  voiceSupportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryDark,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  voiceSupportIcon: {
    fontSize: 12,
  },
  voiceSupportText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    gap: 6,
  },
  daHelpIcon: {
    fontSize: 16,
  },
  daHelpText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
