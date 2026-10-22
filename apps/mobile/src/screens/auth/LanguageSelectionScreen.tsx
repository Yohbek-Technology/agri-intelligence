import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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
  iconName: keyof typeof MaterialIcons.glyphMap;
  selectedBadge: string;
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
    iconName: 'spa',
    selectedBadge: 'የተመረጠ',
    audioPromptText:
      'ቋንቋዎን ይምረጡ። በመተግበሪያው ውስጥ በሙሉ የድምፅ መመሪያ ማዳመጥና ማውራት ይችላሉ።',
    continueLabel: 'ቀጥል (Continue)',
  },
  {
    code: 'om',
    nativeTitle: 'Afaan Oromoo',
    englishTitle: 'Oromo',
    description: 'Qophii Qonnaa fi Gorsaa',
    listenLabel: 'Sagalee dhagayyadha',
    listenSub: 'Oromiffaan caqasi',
    iconName: 'nature-people',
    selectedBadge: 'Filatameera',
    audioPromptText:
      'Afaan keessan filadhaa. Sagalee fi afaaniin qonnaa fi gorsa keessan hordofaa.',
    continueLabel: 'Itti Fufi (Continue)',
  },
  {
    code: 'ti',
    nativeTitle: 'ትግርኛ',
    englishTitle: 'Tigrinya',
    description: 'ሕርሻን ምኽሪን ሓበሬታ',
    listenLabel: 'ድምፂ ስምዑ',
    listenSub: 'ብትግርኛ ስምዑ',
    iconName: 'eco',
    selectedBadge: 'ተመሪፁ',
    audioPromptText:
      'ቋንቋኹም ምረፁ። ኣብ ምሉእ እቲ ኣፕሊኬሽን ድምፂ ብምስማዕን ብምዝራብን ክትጥቀሙ ትኽእሉ ኢኹም።',
    continueLabel: 'ቀፅሉ (Continue)',
  },
  {
    code: 'en',
    nativeTitle: 'English',
    englishTitle: 'English',
    description: 'Agronomic Advisory & Extension DA',
    listenLabel: 'Listen in English',
    listenSub: 'Spoken prompt',
    iconName: 'language',
    selectedBadge: 'Selected',
    audioPromptText:
      'Tap your language to hear guidance and use voice commands throughout the app.',
    continueLabel: 'Continue to Sign-In',
  },
];

const AFFIRMATION_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCzTZ2ViPeLPz-rcFsglkeMlnXxMxo124BixJ7KsEJgB5WLf_F_6iodBUsTpTXw7FccKxIiKjK_b4LtV4k8NCuXq6uoDo6scSec3NXHEa17RF5m9QkDP7pUBpWJ70Njp6AKhH78rq48PW2_TIVr9DsOllbT7a0NbrhEyD1sJE312rcscU_eL2BUIx5svl_s7WrXrcWCVs7sKyECRWOy9DS-getVguNFICOiGt6L3cs8JeP6Szq-DI4czA';

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
        {/* 1. Top Status Ribbon & Offline Readiness */}
        <View style={styles.topRibbon}>
          <View style={styles.offlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.offlineText}>Offline AI Voice Ready</Text>
          </View>
          <View style={styles.networkStatus}>
            <MaterialIcons name="signal-cellular-alt" size={18} color="#41493E" />
            <Text style={styles.networkText}>2G / Direct Solar Mode</Text>
          </View>
        </View>

        {/* 2. Animated Voice Prompt Card */}
        <View style={styles.voicePromptCard}>
          <View style={styles.voicePromptHeader}>
            <View style={styles.micCircle}>
              <MaterialIcons name="mic" size={28} color="#FFFFFF" />
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
                  <MaterialIcons
                    name={isSpeaking ? 'stop' : 'volume-up'}
                    size={16}
                    color="#00450D"
                  />
                  <Text style={styles.playAllText}>
                    {isSpeaking ? 'Stop' : 'Play All'}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.voicePromptBody}>
                {currentItem.audioPromptText}
              </Text>
              <Text style={styles.voicePromptHint}>
                Tap your language below to hear spoken guidance and speak back naturally.
              </Text>
            </View>
          </View>

          {/* Tactile Soundwave Visualization */}
          <View style={styles.soundwaveRow}>
            <View style={[styles.soundwaveBar, { height: 8, backgroundColor: '#78DC77' }]} />
            <View style={[styles.soundwaveBar, { height: 16, backgroundColor: '#1B5E20' }]} />
            <View style={[styles.soundwaveBar, { height: 24, backgroundColor: '#00450D' }]} />
            <View style={[styles.soundwaveBar, { height: 12, backgroundColor: '#006E1C' }]} />
            <View style={[styles.soundwaveBar, { height: 20, backgroundColor: '#1B5E20' }]} />
            <View style={[styles.soundwaveBar, { height: 8, backgroundColor: '#78DC77' }]} />
            <View style={[styles.soundwaveBar, { height: 16, backgroundColor: '#00450D' }]} />
            <Text style={styles.soundwaveLabel}>
              Amharic / Afaan Oromo / ትግርኛ / English
            </Text>
          </View>
        </View>

        {/* 3. Onboarding Progress Context Indicator */}
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

        {/* 4. Section Title */}
        <View style={styles.titleSection}>
          <Text style={styles.headingTitle}>ይምረጡ / Choose Language</Text>
          <Text style={styles.headingSubtitle}>
            ትክክለኛውን ቋንቋ ይንኩ። ድምጹን ለመስማት የድምፅ ማዳመጫውን ይጫኑ።
          </Text>
        </View>

        {/* 5. 4 Interactive High-Contrast Language Cards */}
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
                  isSelected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}>
                <View style={styles.cardMainRow}>
                  <View style={styles.cardLeft}>
                    <View style={styles.langIconBadge}>
                      <MaterialIcons name={item.iconName} size={28} color="#00450D" />
                    </View>
                    <View style={styles.langTitles}>
                      <View style={styles.nativeRow}>
                        <Text style={styles.langNativeText}>{item.nativeTitle}</Text>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>{item.selectedBadge}</Text>
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
                    <MaterialIcons
                      name={isPlayingThis ? 'stop' : 'volume-up'}
                      size={22}
                      color="#380D00"
                    />
                  </Pressable>
                </View>

                {/* Bottom Listen Bar */}
                <View style={styles.cardListenBar}>
                  <View style={styles.listenBarLeft}>
                    <MaterialIcons name="graphic-eq" size={18} color="#6C2200" />
                    <Text style={styles.listenBarTitle}>{item.listenLabel}</Text>
                  </View>
                  <Text style={styles.listenBarSub}>{item.listenSub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* 6. Agricultural Visual Affirmation Card */}
        <View style={styles.affirmationCard}>
          <Image
            source={{ uri: AFFIRMATION_IMAGE_URI }}
            style={styles.affirmationImage}
            resizeMode="cover"
          />
          <View style={styles.affirmationContent}>
            <Text style={styles.affirmationTitle}>ለገበሬዎች እና የግብርና ኤክስቴንሽን</Text>
            <Text style={styles.affirmationSubtitle}>
              Tailored for smallholders & Development Agents in Tigray, Oromia, Amhara, and Sidama regions.
            </Text>
          </View>
        </View>

        {/* 7. Bottom Persistent Tactile Action Block */}
        <View style={styles.bottomBlock}>
          {/* Active Audio Status Toast */}
          {isSpeaking && (
            <View style={styles.audioToast}>
              <View style={styles.audioToastLeft}>
                <MaterialIcons name="sync" size={20} color="#FFB498" />
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
              <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
              <Text style={styles.continueLabel}>{currentItem.continueLabel}</Text>
            </View>
            <View style={styles.voiceSupportBadge}>
              <MaterialIcons name="hearing" size={16} color="#FFFFFF" />
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
            <MaterialIcons name="contact-support" size={18} color="#41493E" />
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
    backgroundColor: '#F9F9FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#006E1C',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#41493E',
  },
  voicePromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  voicePromptHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  micCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#006E1C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  playAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00450D',
  },
  voicePromptBody: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111C2D',
    lineHeight: 20,
    marginBottom: 4,
  },
  voicePromptHint: {
    fontSize: 12,
    color: '#41493E',
    lineHeight: 16,
  },
  soundwaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F3FF',
  },
  soundwaveBar: {
    width: 6,
    borderRadius: 3,
  },
  soundwaveLabel: {
    fontSize: 11,
    color: '#41493E',
    marginLeft: 8,
    flex: 1,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepLabelPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00450D',
  },
  stepLabelSecondary: {
    fontSize: 13,
    color: '#41493E',
  },
  stepBarTrack: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBarSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DEE8FF',
  },
  stepBarActive: {
    backgroundColor: '#1B5E20',
  },
  titleSection: {
    marginBottom: 16,
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111C2D',
    marginBottom: 4,
  },
  headingSubtitle: {
    fontSize: 14,
    color: '#41493E',
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#1B5E20',
    backgroundColor: '#FFFFFF',
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  langIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111C2D',
  },
  selectedBadge: {
    backgroundColor: '#91F78E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00731E',
  },
  langEnglishText: {
    fontSize: 13,
    color: '#41493E',
    marginTop: 2,
  },
  listenButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFDBCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenButtonActive: {
    backgroundColor: '#FFB59A',
  },
  cardListenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  listenBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listenBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C2200',
  },
  listenBarSub: {
    fontSize: 11,
    color: '#41493E',
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  affirmationImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  affirmationContent: {
    flex: 1,
  },
  affirmationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  affirmationSubtitle: {
    fontSize: 12,
    color: '#41493E',
    lineHeight: 16,
    marginTop: 2,
  },
  bottomBlock: {
    gap: 8,
  },
  audioToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#933100',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  audioToastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  audioToastText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB498',
  },
  toastStopButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  toastStopText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB498',
    textDecorationLine: 'underline',
  },
  continueButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#1B5E20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonPressed: {
    transform: [{ translateY: 1 }],
  },
  continueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceSupportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006E1C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  voiceSupportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  daHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  daHelpText: {
    fontSize: 12,
    color: '#41493E',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
